import { Address, AddressOrENS, OnStatusUpdateFn } from './commonTypes.js';
import { OneCollectionByOwnerResponse } from './graphQLTypes.js';

/***************************************************************************
 *                        Sharing Types                                    *
 ***************************************************************************/
export type SharingContractConsumer = {
  sharingContractAddress: AddressOrENS;
};

export type SuccessWithTransactionHash = {
  success: boolean;
  txHash: string;
};

// ---------------------Collection Types------------------------------------
export type Creator = {
  address: AddressOrENS;
};

export type RemoveCollectionParams = {
  collectionTokenId: number;
};

export type CreateCollectionResponse = {
  collectionTokenId: number;
  txHash: string;
};

export type AddToCollectionParams = {
  collectionTokenId: number;
  protectedDataAddress: AddressOrENS;
  appAddress?: AddressOrENS;
  onStatusUpdate?: OnStatusUpdateFn<
    'APPROVE_COLLECTION_CONTRACT' | 'ADD_PROTECTED_DATA_TO_COLLECTION'
  >;
};

export type RemoveFromCollectionParams = {
  protectedDataAddress: AddressOrENS;
};

export type GetCollectionsByOwnerParams = {
  ownerAddress: AddressOrENS;
};

export type GetCollectionsByOwnerResponse = OneCollectionByOwnerResponse[];

export type ConsumeProtectedDataParams = {
  protectedDataAddress: AddressOrENS;
  onStatusUpdate?: OnStatusUpdateFn<
    'CONSUME_PROTECTED_DATA' | 'UPLOAD_RESULT_TO_IPFS'
  >;
};

export type ConsumeProtectedDataResponse = {
  success: boolean;
  txHash: string;
  dealId: string;
  ipfsLink: string;
  privateKey: CryptoKey;
};

// ---------------------Subscription Types------------------------------------
export type SetProtectedDataToSubscriptionParams = {
  protectedDataAddress: AddressOrENS;
};

export type SetSubscriptionParams = {
  collectionTokenId: number;
  priceInNRLC: bigint;
  durationInSeconds: number;
};

export type Subscriber = {
  address: Address;
  endSubscriptionTimestamp: number;
};

export type GetSubscribersResponse = {
  subscribers: Subscriber[];
};

export type SubscribeParams = {
  collectionTokenId: number;
};

// ---------------------Rental Types------------------------------------
export type GetRentersParams = {
  protectedDataAddress: AddressOrENS;
  includePastRentals?: boolean;
};

export type Renters = {
  id: string;
  renter: Address;
  endDateTimestamp: number;
  creationTimestamp: number;
  rentalParams: {
    durationInSeconds: number;
    priceInNRLC: number;
  };
};

export type SetProtectedDataToRentingParams = {
  protectedDataAddress: Address;
  priceInNRLC: bigint;
  durationInSeconds: number;
};

export type RemoveProtectedDataFromRentingParams = {
  protectedDataAddress: Address;
};

export type RentProtectedDataParams = {
  protectedDataAddress: Address;
};

// ---------------------Sell Types------------------------------------
export type SetProtectedDataForSaleParams = {
  protectedDataAddress: Address;
  priceInNRLC: number;
};

export type RemoveProtectedDataForSaleParams = {
  protectedDataAddress: Address;
};

export type BuyProtectedDataParams = {
  protectedDataAddress: Address;
  collectionTokenIdTo?: number;
  appAddress?: AddressOrENS;
};
