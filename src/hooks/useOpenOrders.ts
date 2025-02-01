import { useQuery } from "@tanstack/react-query";
import { useDeepBook } from "@/contexts/deepbook";

export function useOpenOrders(poolKey: string, managerKey: string) {
  const dbClient = useDeepBook();

  return useQuery({
    queryKey: ["openOrders", poolKey, managerKey],
    queryFn: async () => {
      const orderIds = await dbClient?.accountOpenOrders(poolKey, managerKey)
      if (!orderIds || orderIds.length === 0) return []
      return await dbClient?.getOrders(poolKey, orderIds)
    },
    enabled: !!dbClient,
    refetchInterval: 1000,
  });
}