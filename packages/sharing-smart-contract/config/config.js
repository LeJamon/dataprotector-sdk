import { getEnvironment } from '@iexec/dataprotector-environments';
import 'dotenv/config';

const { ENV } = process.env;

const { hubAddress, datasetRegistryAddress, appRegistryAddress, voucherHubAddress } = getEnvironment(ENV);

export const SMART_CONTRACT_ADDRESS_FILE = '.smart-contract-address';

export const POCO_ADDRESS = hubAddress;
export const DATASET_REGISTRY_ADDRESS = datasetRegistryAddress;
export const APP_REGISTRY_ADDRESS = appRegistryAddress;
export const VOUCHER_HUB_ADDRESS = voucherHubAddress;
