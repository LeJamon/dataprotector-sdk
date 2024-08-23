import { Wallet } from 'ethers';
import { getIExec } from './utils.js';

const createAppFor = async owner => {
  const appOwnerWallet = Wallet.createRandom();
  const iexecAppOwner = getIExec(appOwnerWallet.privateKey);

  const { address: appAddress } = await iexecAppOwner.app.deployApp({
    owner,
    name: `test app${Date.now()}`,
    type: 'DOCKER',
    multiaddr: 'registry.hub.docker.com/iexechub/vanityeth:1.1.1',
    checksum: '0x00f51494d7a42a3c1c43464d9f09e06b2a99968e3b978f6cd11ab3410b7bcd14',
  });

  return appAddress;
};

export { createAppFor };
