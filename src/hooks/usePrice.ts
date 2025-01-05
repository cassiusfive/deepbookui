import { useQuery } from "@tanstack/react-query";
import { useDeepBook } from "@/contexts/deepbook";

export function usePrice(poolId: string) {
  const deepbook = useDeepBook();

  return useQuery({
    queryKey: ["price", poolId],
    queryFn: async () => {
      return deepbook!.midPrice(poolId);
    },
    refetchInterval: 1000,
    enabled: !!deepbook,
    // placeholderData: (prev) => prev,
  });
}
