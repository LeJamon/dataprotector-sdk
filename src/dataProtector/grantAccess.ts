import { WorkflowError } from '../utils/errors.js';
import { formatGrantedAccess } from '../utils/format.js';
import {
  addressOrEnsOrAnySchema,
  addressOrEnsSchema,
  positiveIntegerStringSchema,
  positiveStrictIntegerStringSchema,
  throwIfMissing,
} from '../utils/validators.js';
import { fetchGrantedAccess } from './fetchGrantedAccess.js';
import { GrantAccessParams, GrantedAccess, IExecConsumer } from './types.js';

export const inferTagFromAppMREnclave = (mrenclave: string) => {
  const tag = ['tee'];
  try {
    const { framework } = JSON.parse(mrenclave);
    switch (framework.toLowerCase()) {
      case 'scone':
        tag.push('scone');
        return tag;
      case 'gramine':
        tag.push('gramine');
        return tag;
      default:
        break;
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
}: IExecConsumer & GrantAccessParams): Promise<GrantedAccess> => {
  const vProtectedData = addressOrEnsSchema()
    .required()
    .label('protectedData')
    .validateSync(protectedData);
  const vAuthorizedApp = addressOrEnsSchema()
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

  const publishedDatasetOrders = await fetchGrantedAccess({
    iexec,
    protectedData: vProtectedData,
    authorizedApp: vAuthorizedApp,
    authorizedUser: vAuthorizedUser,
  }).catch((e) => {
    throw new WorkflowError('Failed to check granted access', e);
  });
  if (publishedDatasetOrders.length > 0) {
    throw new WorkflowError(
      'An access has been already granted to this user with this application'
    );
  }
  const datasetorderTemplate = await iexec.app
    .showApp(vAuthorizedApp)
    .then(({ app }) => {
      const mrenclave = app.appMREnclave;
      const tag = inferTagFromAppMREnclave(mrenclave);
      return iexec.order.createDatasetorder({
        dataset: vProtectedData,
        apprestrict: vAuthorizedApp,
        requesterrestrict: vAuthorizedUser,
        datasetprice: vPricePerAccess,
        volume: vNumberOfAccess,
        tag,
      });
    })
    .catch((e) => {
      throw new WorkflowError('Failed to create access', e);
    });
  const datasetorder = await iexec.order
    .signDatasetorder(datasetorderTemplate)
    .catch((e) => {
      throw new WorkflowError('Failed to sign access', e);
    });
  await iexec.order.publishDatasetorder(datasetorder).catch((e) => {
    throw new WorkflowError('Failed to publish access', e);
  });
  return formatGrantedAccess(datasetorder);
};
