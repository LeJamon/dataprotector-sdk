export declare type KnownEnv = "prod" | "staging";
export declare type EnvKey =
  | "smsUrl"
  | "iexecGatewayUrl"
  | "resultProxyUrl"
  | "ipfsGatewayUrl"
  | "ipfsNodeUrl"
  /**
   * iExec prod Workerpool address
   */
  | "workerpoolProdAddress"
  /**
   * DataProtector contract address
   */
  | "DataProtectorContractAddress"
  /**
   * DataProtector indexing start bloc
   */
  | "DataProtectorStartBlock"
  /**
   * DataProtectorSharing contract address
   */
  | "DataProtectorSharingContractAddress"
  /**
   * DataProtectorSharing indexing start bloc
   */
  | "DataProtectorSharingStartBlock"
  /**
   * AddOnlyAppWhitelistRegistry contract address
   */
  | "AddOnlyAppWhitelistRegistryContractAddress"
  /**
   * AddOnlyAppWhitelistRegistry indexing start bloc
   */
  | "AddOnlyAppWhitelistRegistryStartBlock"
  | "protectedDataDeliveryWhitelistAddress"
  | "protectedDataDeliveryDappAddress"
  | "protectedDataDeliveryDappEns"
  | "dataprotectorSubgraphUrl";

export declare type Environment = Record<EnvKey, string | null>;

export declare const environments: Record<KnownEnv, Environment>;

export declare const getEnvironment: (env: KnownEnv) => Environment;
