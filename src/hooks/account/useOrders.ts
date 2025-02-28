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

export function useOrders(
  poolKey: string, 
  balanceManagerId: string, 
  status: "Open" | "Closed", 
  limit?: number
): UseInfiniteQueryResult<InfiniteData<Order[], number>, Error> {
  return useInfiniteQuery({
    queryKey: ["orderUpdates", poolKey, balanceManagerId, status, limit],
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams({
        balance_manager_id: balanceManagerId,
        limit: (limit || 50).toString(),
        end_time: Math.floor(pageParam / 1000).toString()
      })

      const orders = await dbIndexerClient(`/order_updates/${poolKey}?${searchParams.toString()}`) as Order[];

      const orderMap = new Map();
      const sortedOrders = orders.sort((a, b) => a.timestamp - b.timestamp);

      if (status === "Open") {
        sortedOrders.forEach(order => {
          const orderId = order.order_id;
          const currentStatus = order.status;
        
          if (!orderMap.has(orderId)) {
            orderMap.set(orderId, order);
            return;
          }
          
          if (currentStatus === "Modified") {
            orderMap.set(orderId, order);
          } else if (currentStatus === "Canceled" || currentStatus === "Expired") {
            orderMap.delete(orderId);
          }
        })

        return Array.from(orderMap.values()) as Order[];
      }

      else if (status === "Closed") {
        return sortedOrders.filter(order => order.status === "Canceled" || order.status === "Expired")
      }
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
