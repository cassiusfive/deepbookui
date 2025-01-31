import { useQuery } from "@tanstack/react-query";
import { useDeepBook } from "@/contexts/deepbook"

export function usePoolAssetMetadata(baseCoinType: string, quoteCoinType: string) {
  const dbClient = useDeepBook();

  const baseAssetQuery = useQuery({
    queryKey: ["coinMetadata", baseCoinType],
    queryFn: async () => {
      return dbClient?.client.getCoinMetadata({ 
        coinType: baseCoinType 
      });
    },
    enabled: !!dbClient,
  });

  // Query for quote asset metadata
  const quoteAssetQuery = useQuery({
    queryKey: ["coinMetadata", quoteCoinType],
    queryFn: async () => {
      return dbClient?.client.getCoinMetadata({ 
        coinType: quoteCoinType
      });
    },
    enabled: !!dbClient
  });

  return {
    baseAssetMetadata: baseAssetQuery.data,
    quoteAssetMetadata: quoteAssetQuery.data,
    isLoading: baseAssetQuery.isLoading || quoteAssetQuery.isLoading,
    error: baseAssetQuery.error || quoteAssetQuery.error,
  };
}