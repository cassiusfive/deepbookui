import { useCurrentPool } from "@/contexts/pool";
import { useQuery } from "@tanstack/react-query";
import { useDeepBook } from "@/hooks/useDeepbook";

export function useQuantityOut(baseQuantity: number, quoteQuantity: number) {
  const pool = useCurrentPool();
  const { context: deepbook } = useDeepBook();

  return useQuery({
    queryKey: ["quantityOut", pool.pool_name, baseQuantity, quoteQuantity],
    queryFn: async () => {
      return await deepbook.getQuantityOut(
        pool.pool_name,
        baseQuantity,
        quoteQuantity,
      );
    },
  });
}
