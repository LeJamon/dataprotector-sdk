import {
  FetchGrantedAccessParams,
  IExecConsumer,
  GrantedAccess,
} from './types.js';
import { WorkflowError } from '../utils/errors.js';
import { throwIfMissing } from '../utils/validators.js';

export const fetchGrantedAccess = async ({
  iexec = throwIfMissing(),
  protectedData = throwIfMissing(),
  authorizedApp = 'any',
  authorizedUser = 'any',
}: IExecConsumer & FetchGrantedAccessParams): Promise<GrantedAccess[]> => {
  try {
    const { orders } = await iexec.orderbook.fetchDatasetOrderbook(
      protectedData,
      {
        app: authorizedApp,
        requester: authorizedUser,
      }
    );
    const grantedAccess = orders?.map((el) => el.order);
    return grantedAccess;
  } catch (error) {
    throw new WorkflowError(
      `Failed to fetch granted access to this data: ${error.message}`,
      error
    );
  }
};
