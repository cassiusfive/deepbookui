import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import type { Keypair } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import type { Transaction } from "@mysten/sui/transactions";

import { DeepBookClient } from "@mysten/deepbook-v3";
import type { BalanceManager } from "@mysten/deepbook-v3";

export default class DeepBookMarketMaker extends DeepBookClient {
  keypair: Keypair;
  suiClient: SuiClient;

  constructor(
    keypair: string | Keypair,
    env: "testnet" | "mainnet",
    balanceManagers?: { [key: string]: BalanceManager },
    adminCap?: string,
  ) {
    let resolvedKeypair: Keypair;

    if (typeof keypair === "string") {
      resolvedKeypair = DeepBookMarketMaker.#getSignerFromPK(keypair);
    } else {
      resolvedKeypair = keypair;
    }

    const address = resolvedKeypair.toSuiAddress();

    super({
      address: address,
      env: env,
      client: new SuiClient({
        url: getFullnodeUrl(env),
      }),
      balanceManagers: balanceManagers,
      adminCap: adminCap,
    });

    this.keypair = resolvedKeypair;
    this.suiClient = new SuiClient({
      url: getFullnodeUrl(env),
    });
  }

  static #getSignerFromPK = (privateKey: string) => {
    const { schema, secretKey } = decodeSuiPrivateKey(privateKey);
    if (schema === "ED25519") return Ed25519Keypair.fromSecretKey(secretKey);

    throw new Error(`Unsupported schema: ${schema}`);
  };

  signAndExecute = async (tx: Transaction) => {
    // remove arguments
    return this.suiClient.signAndExecuteTransaction({
      transaction: tx,
      signer: this.keypair,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });
  };

  getActiveAddress() {
    return this.keypair.getPublicKey().toSuiAddress();
  }
}
