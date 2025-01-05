import { SuiClient } from "@mysten/sui/client";
import type { Transaction } from "@mysten/sui/transactions";

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

  placeLimitOrderExample = (tx: Transaction) => {
    tx.add(
      this.deepBook.placeLimitOrder({
        poolKey: "SUI_DBUSDC",
        balanceManagerKey: "MANAGER_1",
        clientOrderId: "123456789",
        price: 1,
        quantity: 10,
        isBid: true,
        // orderType default: no restriction
        // selfMatchingOption default: allow self matching
        // payWithDeep default: true
      }),
    );
  };
}
