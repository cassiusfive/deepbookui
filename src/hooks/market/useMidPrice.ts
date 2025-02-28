import { useQuery } from "@tanstack/react-query";
import { useDeepBook } from "@/contexts/deepbook";

export function useMidPrice(poolKey: string) {
  const dbClient = useDeepBook();

  return useQuery({
    queryKey: ["midPrice", poolKey],
    queryFn: async () => {
      return await dbClient?.midPrice(poolKey);
    },
    refetchInterval: 1000,
    enabled: !!dbClient,
  });
}
