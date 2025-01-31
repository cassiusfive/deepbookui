import { useDeepBook } from "@/contexts/deepbook";
import { useCurrentPool } from "@/contexts/pool";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { normalizeStructTag } from "@mysten/sui/utils";
import { useQuery } from "@tanstack/react-query";

export function useBalances() {
  const account = useCurrentAccount();
  const dbClient = useDeepBook();

  return useQuery({
    queryKey: ["walletBalances", account?.address],
    queryFn: async () => {
      return await dbClient?.client.getAllBalances({
        owner: account!.address
      });
    },
    enabled: !!dbClient && !!account,
    refetchInterval: 1000,
  });
}

export function useManagerBalance(managerKey: string, coinKey: string) {
  const dbClient = useDeepBook();

  return useQuery({
    queryKey: ["managerBalance", managerKey, coinKey],
    queryFn: () => dbClient?.checkManagerBalance(managerKey, coinKey),
    enabled: !!dbClient
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
