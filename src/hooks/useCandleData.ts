import { useCurrentPool } from "@/contexts/pool";
import { useQuery } from "@tanstack/react-query";
import { DEEPBOOK_POOL_TO_DEX_POOL } from "@/constants/geckoterminal";

async function fetchGeckoTerminalOHLCV(
  poolId: string,
  timeframe: "day" | "hour" | "minute",
) {
  const dexPool = DEEPBOOK_POOL_TO_DEX_POOL[poolId];

  const url = `https://api.geckoterminal.com/api/v2/networks/sui-network/pools/${dexPool}/ohlcv/${timeframe}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Error fetching data: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.data.attributes.ohlcv_list
      .map((item: [number, number, number, number, number]) => ({
        time: item[0],
        open: item[1],
        high: item[2],
        low: item[3],
        close: item[4],
      }))
      .sort((a, b) => a.time - b.time);
  } catch (error) {
    console.error("Failed to fetch OHLCV data:", error);
    return null;
  }
}

export function useCandleData() {
  const pool = useCurrentPool();

  return useQuery({
    queryKey: ["candleData", pool.pool_id],
    queryFn: async () => {
      return fetchGeckoTerminalOHLCV(pool.pool_id, "day");
    },
    refetchInterval: 10000,
  });
}
