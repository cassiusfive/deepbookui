import { DeepBookContext } from "@/contexts/deepbook";
import { useCurrentPool } from "@/contexts/pool";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { coinWithBalance, Transaction } from "@mysten/sui/transactions";
import { useContext } from "react";

const BALANCE_MANAGER_STORAGE_KEY = "DEEP";
const DEEPBOOK_PACKAGE_ID =
  "0x2c8d603bc51326b8c13cef9dd07031a408a48dddb541963357661df5d3204809";

export function useDeepBook() {
  const context = useContext(DeepBookContext);
  const account = useCurrentAccount();
  const pool = useCurrentPool();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  if (!context) {
    throw new Error("useDeepBook must be used within a DeepBookProvider");
  }

  const getBalanceManager = (tx: Transaction) => {
    const managerAddress = localStorage.getItem(BALANCE_MANAGER_STORAGE_KEY);
    if (managerAddress) return tx.object(managerAddress);

    // create a balance manager if one doesn't exist
    const manager = tx.moveCall({
      target: `${DEEPBOOK_PACKAGE_ID}::balance_manager::new`,
    });

    tx.moveCall({
      target: "0x2::transfer::public_share_object",
      arguments: [manager],
      typeArguments: [
        `${DEEPBOOK_PACKAGE_ID}::balance_manager::BalanceManager`,
      ],
    });

    return manager;
  };

  //
  const placeOrder = (amountToDeposit: number) => {
    if (!account) {
      throw Error("placeOrder requires wallet to be connected");
    }
    const tx = new Transaction();

    const manager = getBalanceManager(tx);

    tx.setSenderIfNotSet(account.address);
    const depositInput = Math.round(
      amountToDeposit * pool.quote_asset_decimals,
    );
    const deposit = coinWithBalance({
      type: pool.quote_asset_id,
      balance: depositInput,
    });

    tx.moveCall({
      target: `${DEEPBOOK_PACKAGE_ID}::balance_manager::deposit`,
      arguments: [manager, deposit],
      typeArguments: [pool.quote_asset_id],
    });

    signAndExecuteTransaction({ transaction: tx });
  };

  return { context, placeOrder };
}
