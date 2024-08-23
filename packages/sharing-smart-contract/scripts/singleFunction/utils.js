import { getEnvironment } from '@iexec/dataprotector-environments';
import { IExec, utils } from 'iexec';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'dotenv/config';

const { ENV } = process.env;

const {
  chainId,
  rpcURL,
  hubAddress,
  ensRegistryAddress,
  ensPublicResolverAddress,
  smsURL,
  iexecGatewayURL,
  resultProxyURL,
  ipfsGatewayURL,
  pocoSubgraphURL,
  voucherSubgraphURL,
} = getEnvironment(ENV);

const iexecOptions = {
  chainId,
  rpcURL,
  hubAddress,
  ensPublicResolverAddress,
  ensRegistryAddress,
  pocoSubgraphURL,
  voucherSubgraphURL,
  resultProxyURL,
  smsURL,
  ipfsGatewayURL,
  iexecGatewayURL,
};

export const getIExec = privateKey => {
  const ethProvider = utils.getSignerFromPrivateKey(rpcURL, privateKey);
  return new IExec({ ethProvider }, iexecOptions);
};

export const impersonate = async ({ rpcUrl, address }) => {
  await fetch(rpcUrl, {
    method: 'POST',
    body: JSON.stringify({
      method: 'hardhat_impersonateAccount',
      params: [address],
      id: 1,
      jsonrpc: '2.0',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const stopImpersonate = async ({ rpcUrl, address }) => {
  await fetch(rpcUrl, {
    method: 'POST',
    body: JSON.stringify({
      method: 'hardhat_stopImpersonatingAccount',
      params: [address],
      id: 1,
      jsonrpc: '2.0',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
