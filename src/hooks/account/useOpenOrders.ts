import { useQuery } from "@tanstack/react-query";
import { useDeepBook } from "@/contexts/deepbook";

export function useOpenOrders(poolKey: string, managerKey: string) {
  const dbClient = useDeepBook();

  return useQuery({
    queryKey: ["openOrders", poolKey, managerKey],
    queryFn: async() => {
      const orderIds = await dbClient?.accountOpenOrders(poolKey, managerKey);
      const orders = await Promise.all(orderIds.map(async orderId => {
        return await dbClient?.getOrder(poolKey, orderId);
      }));
      return orders
    },
    enabled: !!dbClient
  });
}
