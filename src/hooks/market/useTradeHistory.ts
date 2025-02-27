import { useQuery, UseQueryResult } from "@tanstack/react-query";
import dbIndexerClient from "@/lib/indexer-client";

type Trade = {
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

// for some reason infinite query doesn't work with refetchInterval
export function useTradeHistory(poolKey: string): UseQueryResult<Trade[], Error> {
  return useQuery({
    queryKey: ["tradeHistory", poolKey],
    queryFn: async () => await dbIndexerClient(`/trades/${poolKey}?limit=50`),
    refetchInterval: 1000
  });
}