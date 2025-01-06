import { SuiClient } from "@mysten/sui/client";
import { DeepBookClient } from "@mysten/deepbook-v3";
import type { BalanceManager } from "@mysten/deepbook-v3";

export default class DeepBookMarketMaker extends DeepBookClient {
  suiClient: SuiClient;

  constructor(
    address: string,
    env: "testnet" | "mainnet",
    suiClient: SuiClient,
    balanceManagers?: { [key: string]: BalanceManager },
    adminCap?: string,
  ) {
    super({
      address: address,
      env: env,
      client: suiClient,
      balanceManagers: balanceManagers,
      adminCap: adminCap,
    });

    this.suiClient = suiClient;
  }
}
