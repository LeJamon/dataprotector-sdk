import { Wallet } from 'ethers';
import { getIExec } from './utils.js';

const createWorkerpool = async () => {
  const workerpoolOwnerWallet = Wallet.createRandom();
  const iexecWorkerpoolOwner = getIExec(workerpoolOwnerWallet.privateKey);

  const { address: workerpoolAddress } = await iexecWorkerpoolOwner.workerpool.deployWorkerpool({
    owner: workerpoolOwnerWallet.address,
    description: 'Test workerpool',
  });

  return { iexecWorkerpoolOwner, workerpoolAddress };
};

const createWorkerpoolOrder = async ({ iexecWorkerpoolOwner, workerpoolAddress, workerpoolprice = 0 }) => {
  const workerpoolorder = await iexecWorkerpoolOwner.order
    .createWorkerpoolorder({
      workerpool: workerpoolAddress,
      category: 0,
      workerpoolprice,
      tag: ['tee', 'scone'],
      volume: 100,
    })
    .then(order => iexecWorkerpoolOwner.order.signWorkerpoolorder(order));

  return workerpoolorder;
};

export { createWorkerpool, createWorkerpoolOrder };
