import { WorkflowError } from '../../utils/errors.js';
import {
  positiveNumberSchema,
  throwIfMissing,
} from '../../utils/validators.js';
import {
  SetSubscriptionParams,
  SharingContractConsumer,
  SuccessWithTransactionHash,
} from '../types/index.js';
import { IExecConsumer } from '../types/internalTypes.js';
import { getSharingContract } from './smartContract/getSharingContract.js';
import { onlyCollectionOperator } from './smartContract/preflightChecks.js';

export const setSubscriptionParams = async ({
  iexec = throwIfMissing(),
  sharingContractAddress = throwIfMissing(),
  collectionTokenId = throwIfMissing(),
  priceInNRLC = throwIfMissing(),
  durationInSeconds = throwIfMissing(),
}: IExecConsumer &
  SharingContractConsumer &
  SetSubscriptionParams): Promise<SuccessWithTransactionHash> => {
  const vCollectionTokenId = positiveNumberSchema()
    .required()
    .label('collectionTokenId')
    .validateSync(collectionTokenId);

  let userAddress = await iexec.wallet.getAddress();
  userAddress = userAddress.toLowerCase();

  const sharingContract = await getSharingContract(
    iexec,
    sharingContractAddress
  );

  //---------- Smart Contract Call ----------
  await onlyCollectionOperator({
    sharingContract,
    collectionTokenId: vCollectionTokenId,
    userAddress,
  });

  try {
    const { txOptions } = await iexec.config.resolveContractsClient();
    const subscriptionParams = {
      price: priceInNRLC,
      duration: durationInSeconds,
    };
    const tx = await sharingContract.setSubscriptionParams(
      vCollectionTokenId,
      subscriptionParams,
      txOptions
    );
    await tx.wait();

    return {
      txHash: tx.hash,
    };
  } catch (e) {
    // Try to extract some meaningful error like:
    // "User denied transaction signature"
    if (e?.info?.error?.message) {
      throw new WorkflowError(
        `Failed to set subscription params: ${e.info.error.message}`,
        e
      );
    }
    throw new WorkflowError(
      'Failed to set Subscription Options into sharing smart contract',
      e
    );
  }
};
