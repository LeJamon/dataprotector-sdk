import { WorkflowError } from '../../utils/errors.js';
import { numberBetweenSchema, throwIfMissing } from '../../utils/validators.js';
import {
  GetCollectionOwnersParams,
  GetCollectionOwnersResponse,
} from '../types/index.js';
import type { IExecConsumer, SubgraphConsumer } from '../types/internalTypes.js';
import { getCollectionOwnersQuery } from './subgraph/getCollectionOwnersQuery.js';

export async function getCollectionOwners({
  iexec = throwIfMissing(),
  graphQLClient = throwIfMissing(),
  limit,
}: IExecConsumer &
  SubgraphConsumer &
  GetCollectionOwnersParams): Promise<GetCollectionOwnersResponse> {
  const vLimit = numberBetweenSchema(1, 1000)
    .default(100)
    .label('limit')
    .validateSync(limit);

  let userAddress = await iexec.wallet.getAddress();
  userAddress = userAddress.toLowerCase();

  try {
    const getCollectionOwnersQueryResponse = await getCollectionOwnersQuery({
      graphQLClient,
      userAddress,
      limit: vLimit,
    });

    return { collectionOwners: getCollectionOwnersQueryResponse.accounts };
  } catch (e) {
    console.error(e);
    throw new WorkflowError('Failed to get collection owners', e);
  }
}
