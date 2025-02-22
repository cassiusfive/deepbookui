import { useQuery } from "@tanstack/react-query";
import { useDeepBook } from "@/contexts/deepbook";

export function useMidPrice(poolId: string) {
  const dbClient = useDeepBook();

  return useQuery({
    queryKey: ["midPrice", poolId],
    queryFn: async () => {
      return dbClient?.midPrice(poolId);
    },
    refetchInterval: 1000,
    enabled: !!dbClient,
  });
}
