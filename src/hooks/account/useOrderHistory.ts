import { useInfiniteQuery, UseInfiniteQueryResult, InfiniteData } from "@tanstack/react-query";
import dbIndexerClient from "@/lib/indexer-client";

type Order = {
  order_id: string;
  price: number;
  original_quantity: number;
  remaining_quantity: number;
  filled_quantity: number;
  timestamp: number;
  type: "buy" | "sell"; 
  balance_manager_id: string;
  status: "Placed" | "Modified" | "Canceled" | "Expired";
}

export function useOrderHistory(
  poolKey: string, 
  balanceManagerId: string, 
  limit?: number
): UseInfiniteQueryResult<InfiniteData<Order[], number>, Error> {
  return useInfiniteQuery({
    queryKey: ["orderUpdates", poolKey, balanceManagerId, limit],
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams({
        balance_manager_id: balanceManagerId,
        limit: (limit || 50).toString(),
        end_time: Math.floor(pageParam / 1000).toString()
      })

      return await dbIndexerClient(`/order_updates/${poolKey}?${searchParams.toString()}`) as Order[];
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
