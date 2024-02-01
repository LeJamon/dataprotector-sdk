import { gql } from 'graphql-request';
import type { Connector } from 'wagmi';
import { type Address } from '@iexec/dataprotector';
import { ProtectedData } from '../../../../../../sdk/src';
import { getDataProtectorClient } from '../../../externals/dataProtectorClient.ts';

export async function getContentOfTheWeek({
  connector,
}: {
  connector: Connector;
}): Promise<ProtectedData[]> {
  const dataProtector = await getDataProtectorClient({
    connector,
  });
  const sevenDaysAgo = Math.round(
    (Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000
  );
  const contentOfTheWeekQuery = gql`
    query {
      protectedDatas(
        where: {
          transactionHash_not: "0x",
          owner: "${import.meta.env.VITE_CONTENT_CREATOR_SMART_CONTRACT_ADDRESS.toLowerCase()}",
          creationTimestamp_gte: "${sevenDaysAgo}",
        },
        first: 10
        orderBy: creationTimestamp
        orderDirection: desc
      ) {
        id
        name
        owner {
          id
        }
        creationTimestamp
      }
    }
  `;
  const contentOfTheWeekData: {
    protectedDatas: Array<{
      id: Address;
      name: string;
      owner: { id: Address };
      creationTimestamp: string;
    }>;
  } = await dataProtector.getGraphQLClient().request(contentOfTheWeekQuery);
  return contentOfTheWeekData.protectedDatas.map((protectedData) => ({
    address: protectedData.id,
    ...protectedData,
  }));
}