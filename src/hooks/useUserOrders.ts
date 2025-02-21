import { useInfiniteQuery, UseInfiniteQueryResult, InfiniteData } from "@tanstack/react-query";
import dbIndexerClient from "@/lib/indexer-client";

export type Order = {
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

export function useOrders(poolKey: string, balanceManagerId: string, params?: {
  limit?: number,
  status?: "Placed" | "Modified" | "Canceled" | "Expired",
}): UseInfiniteQueryResult<InfiniteData<Order[], number>, Error> {
  return useInfiniteQuery({
    queryKey: ["orderUpdates", poolKey, balanceManagerId, params],
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams({
        balance_manager_id: "0xd335e8aa19d6dc04273d77e364c936bad69db4905a4ab3b2733d644dd2b31e0a",
        limit: (params?.limit || 50).toString(),
        end_time: Math.floor(pageParam / 1000).toString()
      })

      console.log(`/order_updates/${poolKey}?${searchParams.toString()}`)
      return await dbIndexerClient(`/order_updates/${poolKey}?${searchParams.toString()}`);
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
