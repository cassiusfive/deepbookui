import dbIndexerClient from "@/lib/indexer-client";
import { useQuery, useInfiniteQuery, UseInfiniteQueryResult, InfiniteData, UseQueryResult } from "@tanstack/react-query";

export type Trade = {
  trade_id: string;
  maker_balance_manager_id: string;
  maker_order_id: string;
  taker_balance_manager_id: string;
  taker_order_id: string;
  type: string;
  price: number;
  base_volume: number;
  quote_volume: number;
  timestamp: number;
};

export function useOrderHistory(
  poolKey: string, 
  maker?: string, 
  taker?: string, 
  limit?: number
): UseInfiniteQueryResult<InfiniteData<Trade[], number>, Error> {
  return useInfiniteQuery({
    queryKey: ["orderUpdates", poolKey, maker, taker, limit],
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams({
        limit: (limit || 50).toString(),
        end_time: Math.floor(pageParam / 1000).toString()
      })

      if (maker) searchParams.append("maker", maker);
      if (taker) searchParams.append("taker", taker);

      return await dbIndexerClient(`/trades/${poolKey}?${searchParams.toString()}`);
    },
    getNextPageParam: lastPage => {
      if (!lastPage || lastPage.length === 0) return undefined
      return lastPage[lastPage.length - 1].timestamp
    },
    getPreviousPageParam: firstPage => {
      if (!firstPage || firstPage.length === 0) return undefined
      return firstPage[0].timestamp
    },
    initialPageParam: Date.now(),
    refetchInterval: 1000
  })
}

// for some reason infinite query doesn't work with refetchInterval
export function useTradeHistory(poolKey: string): UseQueryResult<Trade[], Error> {
  return useQuery({
    queryKey: ["tradeHistory", poolKey],
    queryFn: async () => await dbIndexerClient(`/trades/${poolKey}?limit=50`),
    refetchInterval: 1000
  });
}