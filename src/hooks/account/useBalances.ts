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
        owner: account!.address,
      });
    },
    enabled: !!dbClient && !!account,
  });
}

export function useBalance(assetType: string, scalar: number) {
  const { data: balances } = useBalances();

  return useQuery({
    queryKey: ["walletBalance", assetType],
    queryFn: () => {
      const rawWalletBalance = balances!.find(
        (coin) =>
          normalizeStructTag(coin.coinType) === normalizeStructTag(assetType),
      )?.totalBalance;
      return rawWalletBalance !== undefined
        ? parseInt(rawWalletBalance) / scalar
        : 0;
    },
    enabled: balances !== undefined,
  });
}

export function useManagerBalance(managerKey: string, coinKey: string) {
  const dbClient = useDeepBook();

  return useQuery({
    queryKey: ["managerBalance", managerKey, coinKey],
    queryFn: async () => await dbClient?.checkManagerBalance(managerKey, coinKey),
    enabled: !!dbClient && coinKey.length > 0,
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
