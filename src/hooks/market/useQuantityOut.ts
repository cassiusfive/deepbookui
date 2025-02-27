import { useCurrentPool } from "@/contexts/pool";
import { useQuery } from "@tanstack/react-query";
import { useDeepBook } from "@/contexts/deepbook";

export function useQuantityOut(baseQuantity: number, quoteQuantity: number) {
  const pool = useCurrentPool();
  const dbClient = useDeepBook();

  return useQuery({
    queryKey: ["quantityOut", pool.pool_name, baseQuantity, quoteQuantity],
    queryFn: () => {
      return dbClient?.getQuantityOut(
        pool.pool_name,
        baseQuantity,
        quoteQuantity,
      );
    },
    enabled: !!dbClient
  });
}
