import { string } from 'yup';
import {
  SCONE_TAG,
  WORKERPOOL_ADDRESS,
  DEFAULT_MAX_PRICE,
} from '../../config/config.js';
import { WorkflowError } from '../../utils/errors.js';
import { resolveENS } from '../../utils/resolveENS.js';
import { getFormattedKeyPair } from '../../utils/rsa.js';
import { getEventFromLogs } from '../../utils/transactionEvent.js';
import {
  addressOrEnsSchema,
  throwIfMissing,
  validateOnStatusUpdateCallback,
  positiveNumberSchema,
  booleanSchema,
} from '../../utils/validators.js';
import {
  ConsumeProtectedDataParams,
  ConsumeProtectedDataResponse,
  ConsumeProtectedDataStatuses,
  OnStatusUpdateFn,
  SharingContractConsumer,
} from '../types/index.js';
import { IExecConsumer } from '../types/internalTypes.js';
import { getResultFromCompletedTask } from './getResultFromCompletedTask.js';
import { getAppWhitelistContract } from './smartContract/getAddOnlyAppWhitelistContract.js';
import { getSharingContract } from './smartContract/getSharingContract.js';
import {
  onlyAppInAddOnlyAppWhitelist,
  onlyProtectedDataAuthorizedToBeConsumed,
} from './smartContract/preflightChecks.js';
import { getProtectedDataDetails } from './smartContract/sharingContract.reads.js';

export const consumeProtectedData = async ({
  iexec = throwIfMissing(),
  sharingContractAddress = throwIfMissing(),
  protectedData,
  maxPrice = DEFAULT_MAX_PRICE,
  app,
  workerpool,
  pemPublicKey,
  pemPrivateKey,
  useVoucher = false,
  onStatusUpdate = () => {},
}: IExecConsumer &
  SharingContractConsumer &
  ConsumeProtectedDataParams): Promise<ConsumeProtectedDataResponse> => {
  let vProtectedData = addressOrEnsSchema()
    .required()
    .label('protectedData')
    .validateSync(protectedData);
  const vMaxPrice = positiveNumberSchema()
    .label('maxPrice')
    .validateSync(maxPrice);
  let vApp = addressOrEnsSchema().required().label('app').validateSync(app);
  let vWorkerpool = addressOrEnsSchema()
    .label('workerpool')
    .validateSync(workerpool);
  const vPemPublicKey = string()
    .label('pemPublicKey')
    .validateSync(pemPublicKey);
  const vPemPrivateKey = string()
    .label('pemPrivateKey')
    .validateSync(pemPrivateKey);
  const vUseVoucher = booleanSchema()
    .label('useVoucher')
    .validateSync(useVoucher);
  const vOnStatusUpdate =
    validateOnStatusUpdateCallback<
      OnStatusUpdateFn<ConsumeProtectedDataStatuses>
    >(onStatusUpdate);

  // ENS resolution if needed
  vProtectedData = await resolveENS(iexec, vProtectedData);
  vApp = await resolveENS(iexec, vApp);
  vWorkerpool = await resolveENS(iexec, vWorkerpool);

  let userAddress = await iexec.wallet.getAddress();
  userAddress = userAddress.toLowerCase();

  if (useVoucher) {
    await iexec.voucher.showUserVoucher(userAddress);
  }

  const sharingContract = await getSharingContract(
    iexec,
    sharingContractAddress
  );

  //---------- Smart Contract Call ----------
  const protectedDataDetails = await getProtectedDataDetails({
    sharingContract,
    protectedData: vProtectedData,
    userAddress,
  });

  const addOnlyAppWhitelistContract = await getAppWhitelistContract(
    iexec,
    protectedDataDetails.addOnlyAppWhitelist
  );
  //---------- Pre flight check----------
  onlyProtectedDataAuthorizedToBeConsumed(protectedDataDetails);
  await onlyAppInAddOnlyAppWhitelist({
    addOnlyAppWhitelistContract,
    app: vApp,
  });

  vOnStatusUpdate({
    title: 'FETCH_WORKERPOOL_ORDERBOOK',
    isDone: false,
  });
  try {
    const workerpoolOrderbook = await iexec.orderbook.fetchWorkerpoolOrderbook({
      workerpool: vWorkerpool || WORKERPOOL_ADDRESS,
      app: vApp,
      dataset: vProtectedData,
      minTag: SCONE_TAG,
      maxTag: SCONE_TAG,
    });
    const workerpoolOrder = workerpoolOrderbook.orders[0]?.order;
    if (!workerpoolOrder) {
      throw new WorkflowError(
        'Could not find a workerpool order, maybe too many requests? You might want to try again later.'
      );
    }
    if (workerpoolOrder.workerpoolprice > vMaxPrice) {
      throw new WorkflowError(
        `No orders found within the specified price limit of ${vMaxPrice} nRLC.`
      );
    }
    vOnStatusUpdate({
      title: 'FETCH_WORKERPOOL_ORDERBOOK',
      isDone: true,
    });

    const { publicKey, privateKey } = await getFormattedKeyPair({
      pemPublicKey: vPemPublicKey,
      pemPrivateKey: vPemPrivateKey,
    });

    vOnStatusUpdate({
      title: 'PUSH_ENCRYPTION_KEY',
      isDone: false,
    });
    await iexec.result.pushResultEncryptionKey(publicKey, {
      forceUpdate: true,
    });
    vOnStatusUpdate({
      title: 'PUSH_ENCRYPTION_KEY',
      isDone: true,
    });

    // Make a deal
    vOnStatusUpdate({
      title: 'CONSUME_ORDER_REQUESTED',
      isDone: false,
    });
    const { txOptions } = await iexec.config.resolveContractsClient();
    let tx;
    let transactionReceipt;
    try {
      tx = await sharingContract.consumeProtectedData(
        vProtectedData,
        workerpoolOrder,
        vApp,
        vUseVoucher,
        txOptions
      );
      transactionReceipt = await tx.wait();
    } catch (err) {
      console.error('Smart-contract consumeProtectedData() ERROR', err);
      throw err;
    }
    vOnStatusUpdate({
      title: 'CONSUME_ORDER_REQUESTED',
      isDone: true,
      payload: {
        txHash: tx.hash,
      },
    });

    const specificEventForPreviousTx = getEventFromLogs(
      'ProtectedDataConsumed',
      transactionReceipt.logs,
      { strict: true }
    );

    const dealId = specificEventForPreviousTx.args?.dealId;
    const taskId = await iexec.deal.computeTaskId(dealId, 0);
    vOnStatusUpdate({
      title: 'CONSUME_TASK',
      isDone: false,
      payload: { dealId, taskId },
    });

    const taskObservable = await iexec.task.obsTask(taskId, { dealid: dealId });

    await new Promise((resolve, reject) => {
      taskObservable.subscribe({
        next: () => {},
        error: (err) => reject(err),
        complete: () => resolve(undefined),
      });
    });

    vOnStatusUpdate({
      title: 'CONSUME_TASK',
      isDone: true,
      payload: { dealId, taskId },
    });

    const { result } = await getResultFromCompletedTask({
      iexec,
      taskId,
      pemPrivateKey: privateKey,
      onStatusUpdate: vOnStatusUpdate,
    });

    return {
      txHash: tx.hash,
      dealId,
      taskId,
      result,
      pemPrivateKey: privateKey,
    };
  } catch (e) {
    // Try to extract some meaningful error like:
    // "insufficient funds for transfer"
    if (e?.info?.error?.data?.message) {
      throw new WorkflowError(
        `Failed to consume protected data: ${e.info.error.data.message}`,
        e
      );
    }
    // Try to extract some meaningful error like:
    // "User denied transaction signature"
    if (e?.info?.error?.message) {
      throw new WorkflowError(
        `Failed to consume protected data: ${e.info.error.message}`,
        e
      );
    }
    throw new WorkflowError(
      'Sharing smart contract: Failed to consume protected data',
      e
    );
  }
};
