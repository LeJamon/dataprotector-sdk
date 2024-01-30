export const ABI = [
  {
    inputs: [
      {
        internalType: 'contract IExecPocoDelegate',
        name: '_proxy',
        type: 'address',
      },
      {
        internalType: 'contract IDatasetRegistry',
        name: '_registry',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'OwnableInvalidOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: '_collectionId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: '_protectedData',
        type: 'address',
      },
    ],
    name: 'AddProtectedDataForSubscription',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'DealId',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: '_collectionId',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'subscriber',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint48',
        name: 'endDate',
        type: 'uint48',
      },
    ],
    name: 'NewSubscription',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: '_collectionId',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'uint112',
            name: 'price',
            type: 'uint112',
          },
          {
            internalType: 'uint48',
            name: 'duration',
            type: 'uint48',
          },
        ],
        indexed: false,
        internalType: 'struct Store.SubscriptionParams',
        name: 'subscriptionParams',
        type: 'tuple',
      },
    ],
    name: 'NewSubscriptionParams',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: '_collectionId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: '_protectedData',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint112',
        name: '_price',
        type: 'uint112',
      },
      {
        indexed: false,
        internalType: 'uint48',
        name: '_duration',
        type: 'uint48',
      },
    ],
    name: 'ProtectedDataAddedToRenting',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: '_collectionId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: '_protectedData',
        type: 'address',
      },
    ],
    name: 'ProtectedDataRemovedFromRenting',
    type: 'event',
  },
  {
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_protectedData',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'workerpool',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'workerpoolprice',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'volume',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'tag',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'category',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'trust',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'apprestrict',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'datasetrestrict',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'requesterrestrict',
            type: 'address',
          },
          {
            internalType: 'bytes32',
            name: 'salt',
            type: 'bytes32',
          },
          {
            internalType: 'bytes',
            name: 'sign',
            type: 'bytes',
          },
        ],
        internalType: 'struct IexecLibOrders_v5.WorkerpoolOrder',
        name: '_workerpoolOrder',
        type: 'tuple',
      },
      {
        internalType: 'string',
        name: '_contentPath',
        type: 'string',
      },
    ],
    name: 'consumeProtectedData',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'm_collection',
    outputs: [
      {
        internalType: 'contract Collection',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'protectedDataInRenting',
    outputs: [
      {
        internalType: 'bool',
        name: 'inRenting',
        type: 'bool',
      },
      {
        internalType: 'uint112',
        name: 'price',
        type: 'uint112',
      },
      {
        internalType: 'uint48',
        name: 'duration',
        type: 'uint48',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'protectedDataInSubscription',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_collectionId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_protectedData',
        type: 'address',
      },
    ],
    name: 'removeProtectedDataFromRenting',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_appAddress',
        type: 'address',
      },
    ],
    name: 'setAppAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_collectionId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_protectedData',
        type: 'address',
      },
      {
        internalType: 'uint112',
        name: '_price',
        type: 'uint112',
      },
      {
        internalType: 'uint48',
        name: '_duration',
        type: 'uint48',
      },
    ],
    name: 'setProtectedDataToRenting',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_collectionId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_protectedData',
        type: 'address',
      },
    ],
    name: 'setProtectedDataToSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_collectionId',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'uint112',
            name: 'price',
            type: 'uint112',
          },
          {
            internalType: 'uint48',
            name: 'duration',
            type: 'uint48',
          },
        ],
        internalType: 'struct Store.SubscriptionParams',
        name: '_subscriptionParams',
        type: 'tuple',
      },
    ],
    name: 'setSubscriptionParams',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_collectionId',
        type: 'uint256',
      },
    ],
    name: 'subscribeTo',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'subscribers',
    outputs: [
      {
        internalType: 'uint48',
        name: '',
        type: 'uint48',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'subscriptionParams',
    outputs: [
      {
        internalType: 'uint112',
        name: 'price',
        type: 'uint112',
      },
      {
        internalType: 'uint48',
        name: 'duration',
        type: 'uint48',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_resultStorageProvider',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_resultStorageProxy',
        type: 'string',
      },
      {
        internalType: 'string',
        name: '_contentPath',
        type: 'string',
      },
    ],
    name: 'updateParams',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
];
