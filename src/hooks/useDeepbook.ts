import { DeepBookContext } from "@/contexts/deepbook";
import { useCurrentPool } from "@/contexts/pool";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { coinWithBalance, Transaction } from "@mysten/sui/transactions";
import { useContext } from "react";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";

const BALANCE_MANAGER_STORAGE_KEY = "DeepBookUI-BalanceManager";
const DEEPBOOK_PACKAGE_ID =
  "0x2c8d603bc51326b8c13cef9dd07031a408a48dddb541963357661df5d3204809";

export const FLOAT_SCALAR = 1000000000;
export const MAX_TIMESTAMP = 1844674407370955161n;

export function useDeepBook() {
  const context = useContext(DeepBookContext);
  const account = useCurrentAccount();
  const pool = useCurrentPool();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  if (!context) {
    throw new Error("useDeepBook must be used within a DeepBookProvider");
  }

  const getBalanceManager = (tx: Transaction) => {
    const managerAddress = localStorage.getItem(BALANCE_MANAGER_STORAGE_KEY);
    if (managerAddress)
      return { manager: tx.object(managerAddress), managerCreated: false };

    // create a balance manager if one doesn't exist
    const manager = tx.moveCall({
      target: `${DEEPBOOK_PACKAGE_ID}::balance_manager::new`,
    });

    return { manager: manager, managerCreated: true };
  };

  const depositIntoBalanceManager = (
    tx: Transaction,
    manager: any,
    coinType: string,
    amount: number,
  ) => {
    const deposit = coinWithBalance({
      type: coinType,
      balance: amount,
    });

    tx.moveCall({
      target: `${DEEPBOOK_PACKAGE_ID}::balance_manager::deposit`,
      arguments: [manager, deposit],
      typeArguments: [coinType],
    });
  };

  const placeLimitOrder = async (
    amount: number,
    price: number,
    type: "ask" | "bid",
  ) => {
    if (!account) {
      throw Error("placeOrder requires wallet to be connected");
    }

    const tx = new Transaction();
    tx.setSenderIfNotSet(account.address);

    const { manager, managerCreated } = getBalanceManager(tx);
    const assetDecimals =
      type === "bid" ? pool.quote_asset_decimals : pool.base_asset_decimals;
    const assetType = type === "bid" ? pool.quote_asset_id : pool.base_asset_id;

    depositIntoBalanceManager(
      tx,
      manager,
      assetType,
      Math.round(amount * price * 10 ** assetDecimals),
    );

    const tradeProof = tx.moveCall({
      target: `${DEEPBOOK_PACKAGE_ID}::balance_manager::generate_proof_as_owner`,
      arguments: [manager],
    });

    const inputPrice = Math.round(
      (price * FLOAT_SCALAR * 10 ** pool.quote_asset_decimals) /
        10 ** pool.base_asset_decimals,
    );
    const inputQuantity = Math.round(amount * 10 ** pool.base_asset_decimals);

    tx.moveCall({
      target: `${DEEPBOOK_PACKAGE_ID}::pool::place_limit_order`,
      arguments: [
        tx.object(pool.pool_id),
        manager,
        tradeProof,
        tx.pure.u64(1),
        tx.pure.u8(0), // no restriction
        tx.pure.u8(1), // cancel taker
        tx.pure.u64(inputPrice),
        tx.pure.u64(inputQuantity),
        tx.pure.bool(type === "bid"), // is bid
        tx.pure.bool(true), // pay with deep
        tx.pure.u64(MAX_TIMESTAMP),
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
      typeArguments: [pool.base_asset_id, pool.quote_asset_id],
    });

    if (managerCreated) {
      tx.moveCall({
        target: "0x2::transfer::public_share_object",
        arguments: [manager],
        typeArguments: [
          `${DEEPBOOK_PACKAGE_ID}::balance_manager::BalanceManager`,
        ],
      });
    }

    return signAndExecuteTransaction({ transaction: tx });
  };

  return { context, placeLimitOrder };
}
