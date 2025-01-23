import deepbookApiClient from "@/lib/deepbook/apiClient";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export type Pool = {
  pool_id: string;
  pool_name: string;
  base_asset_id: string;
  base_asset_decimals: number;
  base_asset_symbol: string;
  base_asset_name: string;
  quote_asset_id: string;
  quote_asset_decimals: number;
  quote_asset_symbol: string;
  quote_asset_name: string;
  min_size: number;
  lot_size: number;
  tick_size: number;
};

export function usePools(): UseQueryResult<Pool[], Error> {
  return useQuery({
    queryKey: ["pools"],
    queryFn: async () => await deepbookApiClient(`/get_pools`),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
