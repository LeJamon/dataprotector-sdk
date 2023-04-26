import { GrantAccessParams, IExecConsumer } from './types.js';
import { WorkflowError } from '../utils/errors.js';
import { throwIfMissing } from '../utils/validators.js';
import { fetchGrantedAccess } from './fetchGrantedAccess.js';

export const grantAccess = async ({
  iexec = throwIfMissing(),
  protectedData = throwIfMissing(),
  authorizedApp = throwIfMissing(),
  authorizedUser = throwIfMissing(),
  pricePerAccess,
  numberOfAccess,
  tag,
}: IExecConsumer & GrantAccessParams): Promise<string> => {
  try {
    const publishedDatasetOrders = await fetchGrantedAccess({
      iexec,
      protectedData,
      authorizedApp,
      authorizedUser,
    });
    if (publishedDatasetOrders.length > 0) {
      throw new Error(
        'An access has been already granted to this user/application'
      );
    }
    const datasetorderTemplate = await iexec.order.createDatasetorder({
      dataset: protectedData,
      apprestrict: authorizedApp,
      requesterrestrict: authorizedUser,
      datasetprice: pricePerAccess,
      volume: numberOfAccess,
      tag: tag,
    });
    const datasetorder = await iexec.order.signDatasetorder(
      datasetorderTemplate
    );
    const orderHash = await iexec.order.publishDatasetorder(datasetorder);
    return orderHash;
  } catch (error) {
    throw new WorkflowError(`Failed to grant access: ${error.message}`, error);
  }
};
