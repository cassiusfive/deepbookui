import dbIndexerClient from "@/lib/indexer-client";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

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

export function useOrderHistory(pool: string, limit: number = 1, taker: string | null = null, maker: string | null = null): UseQueryResult<Trade[], Error> {
  const url = `/trades/${pool}?limit=${limit}${taker ? `&taker_balance_manager_id=${taker}` : ""}${maker ? `&maker_balance_manager_id=${maker}` : ""}`
  return useQuery({
    queryKey: ["trades", pool, limit, maker, taker],
    queryFn: async () => await dbIndexerClient(url),
    refetchInterval: 1000
  });
}