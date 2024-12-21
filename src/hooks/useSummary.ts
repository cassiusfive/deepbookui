import deepbookApiClient from "@/lib/deepbook/apiClient";
import { useQuery } from "@tanstack/react-query";

export type Pair = {
  trading_pairs: string,
  quote_currency: string,
  last_price: number,
  lowest_price_24h: number,
  highest_bid: number,
  base_volume: number,
  price_change_percent_24h: number,
  quote_volume: number,
  lowest_ask: number,
  highest_price_24h: number,
  base_currency: string
}

async function fetchSummary(): Promise<Pair[]> {
  const data = await deepbookApiClient(`/summary`);

  console.log(data)
  return data
}

export function useSummary() {
  return useQuery({
    queryKey: ["summary"],
    queryFn: () => fetchSummary(),
  });
}
