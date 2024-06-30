import { ZeroAddress } from 'ethers';
import { ValidationError, WorkflowError,grantAccessErrorMessage } from '../../utils/errors.js';
import { formatGrantedAccess } from '../../utils/format.js';
import {
  addressOrEnsOrAnySchema,
  addressOrEnsSchema,
  isEnsTest,
  positiveIntegerStringSchema,
  positiveStrictIntegerStringSchema,
  throwIfMissing,
  validateOnStatusUpdateCallback,
} from '../../utils/validators.js';
import { isDeployedWhitelist } from '../../utils/whitelist.js';
import {
  GrantAccessParams,
  GrantAccessStatuses,
  GrantedAccess,
  OnStatusUpdateFn,
} from '../types/index.js';
import { IExecConsumer } from '../types/internalTypes.js';
import { getGrantedAccess } from './getGrantedAccess.js';

const inferTagFromAppMREnclave = (mrenclave: string) => {
  const tag = ['tee'];
  try {
    const { framework } = JSON.parse(mrenclave);
    if (framework.toLowerCase() === 'scone') {
      tag.push('scone');
      return tag;
    }
  } catch (e) {
    // noop
  }
  throw Error('App does not use a supported TEE framework');
};

export const grantAccess = async ({
  iexec = throwIfMissing(),
  protectedData,
  authorizedApp,
  authorizedUser,
  pricePerAccess,
  numberOfAccess,
  onStatusUpdate = () => {},
}: IExecConsumer & GrantAccessParams): Promise<GrantedAccess> => {
  const vProtectedData = addressOrEnsSchema()
    .required()
    .label('protectedData')
    .validateSync(protectedData);
  let vAuthorizedApp = addressOrEnsSchema()
    .required()
    .label('authorizedApp')
    .validateSync(authorizedApp);
  const vAuthorizedUser = addressOrEnsOrAnySchema()
    .required()
    .label('authorizedUser')
    .validateSync(authorizedUser);
  const vPricePerAccess = positiveIntegerStringSchema()
    .label('pricePerAccess')
    .validateSync(pricePerAccess);
  const vNumberOfAccess = positiveStrictIntegerStringSchema()
    .label('numberOfAccess')
    .validateSync(numberOfAccess);
  const vOnStatusUpdate =
    validateOnStatusUpdateCallback<OnStatusUpdateFn<GrantAccessStatuses>>(
      onStatusUpdate
    );

  if (vAuthorizedApp && isEnsTest(vAuthorizedApp)) {
    const resolved = await iexec.ens.resolveName(vAuthorizedApp);
    if (!resolved) {
      throw new ValidationError('authorizedApp ENS name is not valid');
    }
    vAuthorizedApp = resolved.toLowerCase();
  }

  if (vAuthorizedApp === ZeroAddress) {
    throw Error(
      `Forbidden to use ${ZeroAddress} as authorizedApp, this would give access to any app`
    );
  }

  const { grantedAccess: publishedDatasetOrders } = await getGrantedAccess({
    iexec,
    protectedData: vProtectedData,
    authorizedApp: vAuthorizedApp,
    authorizedUser: vAuthorizedUser,
  }).catch((e) => {
    throw new WorkflowError({message: 'Failed to check granted access', errorCause: e});
  });
  if (publishedDatasetOrders.length > 0) {
    throw new WorkflowError({message: grantAccessErrorMessage, errorCause: 
      Error('An access has been already granted to this user with this app')}
    );
  }

  let tag;
  const isDeployedApp = await iexec.app.checkDeployedApp(authorizedApp);
  if (isDeployedApp) {
    tag = await iexec.app.showApp(authorizedApp).then(({ app }) => {
      return inferTagFromAppMREnclave(app.appMREnclave);
    });
  } else if (await isDeployedWhitelist(iexec, authorizedApp)) {
    tag = ['tee', 'scone'];
  } else {
    throw new WorkflowError({message: grantAccessErrorMessage, errorCause: Error('Failed to detect the app TEE framework')});
  }

  vOnStatusUpdate({
    title: 'CREATE_DATASET_ORDER',
    isDone: false,
  });
  const datasetorder = await iexec.order
    .createDatasetorder({
      dataset: vProtectedData,
      apprestrict: vAuthorizedApp,
      requesterrestrict: vAuthorizedUser,
      datasetprice: vPricePerAccess,
      volume: vNumberOfAccess,
      tag,
    })
    .then((datasetorderTemplate) =>
      iexec.order.signDatasetorder(datasetorderTemplate)
    )
    .catch((e) => {
      throw new WorkflowError({message: 'Failed to sign data access', errorCause: e});
    });
  vOnStatusUpdate({
    title: 'CREATE_DATASET_ORDER',
    isDone: true,
  });

  vOnStatusUpdate({
    title: 'PUBLISH_DATASET_ORDER',
    isDone: false,
  });
  await iexec.order.publishDatasetorder(datasetorder).catch((e) => {
    throw new WorkflowError({message: 'Failed to publish data access', errorCause: e});
  });
  vOnStatusUpdate({
    title: 'PUBLISH_DATASET_ORDER',
    isDone: true,
  });

  return formatGrantedAccess(datasetorder);
};
