import { gql } from 'graphql-request';
import { DEFAULT_SHARING_CONTRACT_ADDRESS } from '../../config/config.js';
import {
  ensureDataSchemaIsValid,
  transformGraphQLResponse,
} from '../../utils/data.js';
import { ValidationError, WorkflowError } from '../../utils/errors.js';
import {
  addressOrEnsSchema,
  isEnsTest,
  numberBetweenSchema,
  positiveNumberSchema,
  throwIfMissing,
} from '../../utils/validators.js';
import { ProtectedDatasGraphQLResponse } from '../types/graphQLTypes.js';
import {
  DataSchema,
  GetProtectedDataByCollectionParams,
  IExecConsumer,
  ProtectedData,
  SubgraphConsumer,
} from '../types/index.js';

function flattenSchema(schema: DataSchema, parentKey = ''): string[] {
  return Object.entries(schema).flatMap(([key, value]) => {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof value === 'object') {
      return flattenSchema(value, newKey);
    } else {
      return `${newKey}:${value}`;
    }
  });
}

export const getProtectedDataByCollection = async ({
  iexec = throwIfMissing(),
  graphQLClient = throwIfMissing(),
  requiredSchema = {},
  collectionTokenId,
  creationTimestampGte,
  page = 0,
  pageSize = 1000,
}: GetProtectedDataByCollectionParams &
  IExecConsumer &
  SubgraphConsumer): Promise<ProtectedData[]> => {
  let vRequiredSchema: DataSchema;
  try {
    ensureDataSchemaIsValid(requiredSchema);
    vRequiredSchema = requiredSchema;
  } catch (e: any) {
    throw new ValidationError(`schema is not valid: ${e.message}`);
  }

  const vPage = positiveNumberSchema().label('page').validateSync(page);
  const vPageSize = numberBetweenSchema(10, 1000)
    .label('pageSize')
    .validateSync(pageSize);
  try {
    const start = vPage * vPageSize;
    const range = vPageSize;

    const schemaArray = flattenSchema(vRequiredSchema);
    const SchemaFilteredProtectedData = gql`
    query (
      $requiredSchema: [String!]!
      $start: Int!
      $range: Int!
    ) {
      protectedDatas(
        where: {
          transactionHash_not: "0x", 
          schema_contains: $requiredSchema, 
          owner: "${DEFAULT_SHARING_CONTRACT_ADDRESS}",
          ${
            creationTimestampGte
              ? `creationTimestamp_gte: "${creationTimestampGte}",`
              : ''
          }
        }
        skip: $start
        first: $range
        orderBy: creationTimestamp
        orderDirection: desc
      ) {
        id
        name
        owner {
          id
        }
        schema {
          id
        }
        creationTimestamp
        collection {
          id
        }
      }
    }
  `;
    //in case of a large number of protected data, we need to paginate the query
    const variables = {
      requiredSchema: schemaArray,
      start,
      range,
    };
    const protectedDataResultQuery: ProtectedDatasGraphQLResponse =
      await graphQLClient.request(SchemaFilteredProtectedData, variables);
    const protectedDataArray: ProtectedData[] = transformGraphQLResponse(
      protectedDataResultQuery
    );
    return protectedDataArray;
  } catch (e) {
    console.error(e);
    throw new WorkflowError('Failed to fetch protected data', e);
  }
};
