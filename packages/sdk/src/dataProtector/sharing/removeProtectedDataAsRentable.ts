import { WorkflowError } from '../../utils/errors.js';
import {
  isCollectionOwner,
  isProtectedDataInCollection,
} from '../../utils/sharing.js';
import { throwIfMissing } from '../../utils/validators.js';
import {
  IExecConsumer,
  RemoveProtectedDataAsRentableParams,
  RemoveProtectedDataAsRentableResponse,
  SubgraphConsumer,
} from '../types.js';
import { getSharingContract } from './smartContract/getSharingContract.js';

export const removeProtectedDataFromRenting = async ({
  iexec = throwIfMissing(),
  graphQLClient = throwIfMissing(),
  collectionTokenId = throwIfMissing(),
  protectedDataAddress = throwIfMissing(),
}: IExecConsumer &
  SubgraphConsumer &
  RemoveProtectedDataAsRentableParams): Promise<RemoveProtectedDataAsRentableResponse> => {
  //TODO:Input validation

  const userAddress = await iexec.wallet.getAddress();
  if (
    !(await isCollectionOwner({
      graphQLClient,
      collectionId: collectionTokenId,
      walletAddress: userAddress,
    }))
  ) {
    throw new WorkflowError(
      'Failed to Remove Protected Data From Renting: user is not collection owner.'
    );
  }

  if (
    !(await isProtectedDataInCollection({
      graphQLClient,
      protectedDataAddress,
      collectionId: collectionTokenId,
    }))
  ) {
    throw new WorkflowError(
      'Failed to Remove Protected Data From Renting: Protected Data is not in collection.'
    );
  }
  const sharingContract = await getSharingContract();
  try {
    const tx = await sharingContract.removeProtectedDataFromRenting(
      collectionTokenId,
      protectedDataAddress
    );
    const txReceipt = await tx.wait();
    return {
      success: true,
      txHash: txReceipt.hash,
    };
  } catch (e) {
    throw new WorkflowError('Failed to Remove Protected Data From Renting', e);
  }
};
