import { useQuery } from "@tanstack/react-query";
import { useDeepBook } from "@/hooks/useDeepbook";

export function useOpenOrders(poolId: string, managerKey: string) {
  const deepbook = useDeepBook();

  return useQuery({
    queryKey: ["openOrders", poolId, managerKey],
    queryFn: async () => await deepbook.context.accountOpenOrders(poolId, managerKey)
  });
}
