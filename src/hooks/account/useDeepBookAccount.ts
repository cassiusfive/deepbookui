import { useQuery } from "@tanstack/react-query";
import { useDeepBook } from "@/contexts/deepbook";

export function useDeepBookAccount(poolKey: string, managerKey: string) {
  const dbClient = useDeepBook();

  return useQuery({
    queryKey: ["account", poolKey, managerKey],
    queryFn: async () => {
      return await dbClient?.account(poolKey, managerKey)
    },
    enabled: !!dbClient,
  });
}