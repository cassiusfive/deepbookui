import { useDeepBook } from "@/contexts/deepbook";
import { useCurrentPool } from "@/contexts/pool";
import DeepBookMarketMaker from "@/lib/deepbook";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { normalizeStructTag } from "@mysten/sui/utils";
import { useQuery } from "@tanstack/react-query";
import { Pool } from "./usePools";

export function useBalances() {
  const account = useCurrentAccount();

  return useSuiClientQuery(
    "getAllBalances",
    { owner: account?.address ?? "" },
    { enabled: !!account },
  );
}

async function fetchManagerBalances(deepbook: DeepBookMarketMaker, pool: Pool) {
  try {
    const account = await deepbook!.account(pool.pool_name, "MANAGER_1");
    const { settled_balances, owed_balances } = account;
    return { settled_balances, owed_balances };
  } catch {
    return {
      settled_balances: {
        base: 0,
        quote: 0,
        deep: 0,
      },
      owed_balances: {
        base: 0,
        quote: 0,
        deep: 0,
      },
    };
  }
}

export function useManagerBalances() {
  const deepbook = useDeepBook();
  const pool = useCurrentPool();

  return useQuery({
    queryKey: ["useManagerBalances"],
    queryFn: () => fetchManagerBalances(deepbook, pool),
  });
}

export function useBalancesFromCurrentPool() {
  const pool = useCurrentPool();
  const { data: walletBalances } = useBalances();

  const getAssetBalance = (assetId: string) => {
    return parseInt(
      walletBalances?.find(
        (coin) =>
          normalizeStructTag(coin.coinType) === normalizeStructTag(assetId),
      )?.totalBalance ?? "0",
    );
  };

  const baseAssetBalance =
    getAssetBalance(pool.base_asset_id) / 10 ** pool.base_asset_decimals;
  const quoteAssetBalance =
    getAssetBalance(pool.quote_asset_id) / 10 ** pool.quote_asset_decimals;

  return { baseAssetBalance, quoteAssetBalance };
}
