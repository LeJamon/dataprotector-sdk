import { WorkflowError } from '../../utils/errors.js';
import { throwIfMissing } from '../../utils/validators.js';
import {
  RemoveProtectedDataAsRentableParams,
  RemoveProtectedDataAsRentableResponse,
} from '../types.js';
import { getSharingContract } from './smartContract/getSharingContract.js';

export const removeProtectedDataFromRenting = async ({
  collectionTokenId = throwIfMissing(),
  protectedDataAddress = throwIfMissing(),
}: RemoveProtectedDataAsRentableParams): Promise<RemoveProtectedDataAsRentableResponse> => {
  //TODO:Input validation

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
    throw new WorkflowError(
      'Failed to set Subscription Options into sharing smart contract',
      e
    );
  }
};
