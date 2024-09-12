import { WorkflowError } from '../../utils/errors.js';
import {
  addressSchema,
  booleanSchema,
  throwIfMissing,
} from '../../utils/validators.js';
import {
  GetCollectionsByOwnerResponse,
  GetCollectionsByOwnerParams,
} from '../types/index.js';
import { SubgraphConsumer } from '../types/internalTypes.js';
import { getCollectionsByOwnerQuery } from './subgraph/getCollectionsByOwnerQuery.js';

export async function getCollectionsByOwner({
  graphQLClient = throwIfMissing(),
  owner,
  includeHiddenProtectedDatas = false,
}: SubgraphConsumer &
  GetCollectionsByOwnerParams): Promise<GetCollectionsByOwnerResponse> {
  try {
    const vOwner = addressSchema()
      .required()
      .label('owner')
      .validateSync(owner);

    const vIncludeHiddenProtectedDatas = booleanSchema()
      .required()
      .label('includeHiddenProtectedDatas')
      .validateSync(owner);

    const getCollectionsByOwnerQueryResponse = await getCollectionsByOwnerQuery(
      {
        graphQLClient,
        owner: vOwner,
        includeHiddenProtectedDatas: vIncludeHiddenProtectedDatas,
      }
    );

    /**
     * With graph-node >= 0.30.0, possible query:
     * {
     *   protectedDatas(where: {
     *     or: [
     *       { isRentable: true },
     *       { isIncludedInSubscription: true },
     *       { isForSale: true },
     *     ]
     *   }) {
     *     id
     *   }
     * }
     * hence no need of this JS post filter!
     */

    return getCollectionsByOwnerQueryResponse;
  } catch (e) {
    console.log('[getCollectionsByOwner] ERROR', e);
    throw new WorkflowError({
      message: 'Failed to get collections by owner',
      errorCause: e,
    });
  }
}
