import { useQuery } from "@tanstack/react-query";
import { useDeepBook } from "@/contexts/deepbook";

export function usePrice(poolId: string) {
  const deepBook = useDeepBook();

  return useQuery({
    queryKey: ["price", poolId],
    queryFn: async () => {
      if (!deepBook) throw new Error("DeepBook not initialized");
      return deepBook.midPrice(poolId);
    },
    refetchInterval: 1000,
    onError: (error) => {
      console.error("Failed to fetch price:", error);
    },
    keepPreviousData: true,
  });
}
