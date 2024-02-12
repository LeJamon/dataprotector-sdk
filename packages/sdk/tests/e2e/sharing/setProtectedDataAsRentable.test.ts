import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import { Wallet, type HDNodeWallet } from 'ethers';
import { IExecDataProtector, getWeb3Provider } from '../../../src/index.js';
import { WorkflowError } from '../../../src/utils/errors.js';
import {
  MAX_EXPECTED_BLOCKTIME,
  MAX_EXPECTED_WEB2_SERVICES_TIME,
} from '../../test-utils.js';

describe('dataProtector.setProtectedDataToRenting()', () => {
  let dataProtector: IExecDataProtector;
  let wallet: HDNodeWallet;

  beforeAll(async () => {
    wallet = Wallet.createRandom();
    dataProtector = new IExecDataProtector(getWeb3Provider(wallet.privateKey));
  });

  describe('When calling setProtectedDataToRenting()', () => {
    it(
      'should answer with success true',
      async () => {
        //Create a Protected data
        const result = await dataProtector.protectData({
          name: 'test',
          data: { doNotUse: 'test' },
        });
        //create collection
        const { collectionId } = await dataProtector.createCollection();

        const onStatusUpdateMock = jest.fn();
        //add Protected Data To Collection
        await dataProtector.addToCollection({
          protectedDataAddress: result.address,
          collectionId,
          onStatusUpdate: onStatusUpdateMock,
        });
        //Test price and duration values
        const price = BigInt('100');
        const duration = 2000;

        const { success } = await dataProtector.setProtectedDataToRenting({
          protectedDataAddress: result.address,
          collectionTokenId: collectionId,
          durationInSeconds: duration,
          priceInNRLC: price,
        });
        expect(success).toBe(true);
      },
      8 * MAX_EXPECTED_BLOCKTIME + MAX_EXPECTED_WEB2_SERVICES_TIME
    );
    it(
      'should fail with not collection owner error',
      async () => {
        //Create a Protected data
        const result = await dataProtector.protectData({
          name: 'test',
          data: { doNotUse: 'test' },
        });
        //create collection
        const { collectionId } = await dataProtector.createCollection();

        const onStatusUpdateMock = jest.fn();
        //add Protected Data To Collection
        await dataProtector.addToCollection({
          protectedDataAddress: result.address,
          collectionId,
          onStatusUpdate: onStatusUpdateMock,
        });
        const wallet1 = Wallet.createRandom();
        const dataProtector1 = new IExecDataProtector(
          getWeb3Provider(wallet1.privateKey)
        );
        //Test price and duration values
        const price = BigInt('100');
        const duration = 2000;

        await expect(() =>
          dataProtector1.setProtectedDataToRenting({
            protectedDataAddress: result.address,
            collectionTokenId: collectionId,
            durationInSeconds: duration,
            priceInNRLC: price,
          })
        ).rejects.toThrow(
          new WorkflowError(
            'Failed to Set Protected Data To Renting: user is not collection owner.'
          )
        );
      },
      8 * MAX_EXPECTED_BLOCKTIME + MAX_EXPECTED_WEB2_SERVICES_TIME
    );
    it(
      'should fail with protected data is not in collection error',
      async () => {
        const protectedDataAddressMock = Wallet.createRandom().address;
        //create collection
        const { collectionId } = await dataProtector.createCollection();
        //to simulate the error we won't add the protected data to the collection
        //Test price and duration values
        const price = BigInt('100');
        const duration = 2000;

        await expect(() =>
          dataProtector.setProtectedDataToRenting({
            protectedDataAddress: protectedDataAddressMock,
            collectionTokenId: collectionId,
            durationInSeconds: duration,
            priceInNRLC: price,
          })
        ).rejects.toThrow(
          new WorkflowError(
            'Failed to Set Protected Data To Renting: Protected Data is not in collection.'
          )
        );
      },
      8 * MAX_EXPECTED_BLOCKTIME + MAX_EXPECTED_WEB2_SERVICES_TIME
    );
  });
});
