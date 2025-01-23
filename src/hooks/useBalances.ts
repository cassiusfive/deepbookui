import { useCurrentPool } from "@/contexts/pool";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { normalizeStructTag } from "@mysten/sui/utils";

export function useBalances() {
  const account = useCurrentAccount();

  return useSuiClientQuery(
    "getAllBalances",
    { owner: account?.address ?? "" },
    { enabled: !!account },
  );
}

export function useBalancesFromCurrentPool() {
  const pool = useCurrentPool();
  const { data } = useBalances();

  const getAssetBalance = (assetId: string) => {
    return parseInt(
      data?.find(
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
