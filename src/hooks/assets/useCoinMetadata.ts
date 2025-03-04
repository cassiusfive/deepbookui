import { useQueries, useQuery } from "@tanstack/react-query";
import { useDeepBook } from "@/contexts/deepbook";
import suiImg from "@/assets/sui.png";
import usdcImg from "@/assets/usdc.png";
import notFound from "@/assets/not-found.png";
import { SuiClient } from "@mysten/sui/client";

const ICON_MAP: Record<string, string> = {
  SUI: suiImg,
  USDC: usdcImg,
  WUSDC: usdcImg,
};

async function fetchCoinMetadata(client: SuiClient, coinType: string) {
  const res = await client.getCoinMetadata({ coinType });
  if (!res) return;

  return { ...res, iconUrl: ICON_MAP[res?.symbol] || res.iconUrl || notFound };
}

export function useCoinMetadata(coinType: string) {
  const dbClient = useDeepBook();

  return useQuery({
    queryKey: ["coinMetadata", coinType],
    queryFn: async () => {
      return fetchCoinMetadata(dbClient!.client, coinType);
    },
  });
}

export function useCoinsMetadata(coinTypes: string[]) {
  const dbClient = useDeepBook();

  return useQueries({
    queries: coinTypes.map((coinType) => ({
      queryKey: ["coinMetadata", coinType],
      queryFn: async () => {
        return fetchCoinMetadata(dbClient!.client, coinType);
      },
    })),
  });
}
