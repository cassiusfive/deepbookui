import dbIndexerClient from "@/lib/indexer-client";
import { useInfiniteQuery, UseInfiniteQueryResult, InfiniteData } from "@tanstack/react-query";

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
  maker: string | null = null, 
  taker: string | null = null, 
  limit?: number
): UseInfiniteQueryResult<InfiniteData<Trade[], number>, Error> {
  return useInfiniteQuery({
    queryKey: ["orderUpdates", poolKey, maker, taker, limit],
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams({
        maker: "0xd335e8aa19d6dc04273d77e364c936bad69db4905a4ab3b2733d644dd2b31e0a",
        limit: (limit || 50).toString(),
        end_time: Math.floor(pageParam / 1000).toString()
      })

      console.log(`/trades/${poolKey}?${searchParams.toString()}`)
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
  })
}
