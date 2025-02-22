import dbIndexerClient from "@/lib/indexer-client";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export type Pair = {
  trading_pairs: string;
  base_currency: string;
  quote_currency: string;
  last_price: number;
  lowest_ask: number;
  highest_bid: number;
  base_volume: number;
  quote_volume: number;
  lowest_price_24h: number;
  highest_price_24h: number;
  price_change_percent_24h: number;
};


export function useSummary(): UseQueryResult<Pair[], Error> {
  return useQuery({
    queryKey: ["summary"],
    queryFn: async() => await dbIndexerClient("/summary"),
    refetchInterval: 1000,
  });
}
