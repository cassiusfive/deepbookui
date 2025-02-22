import { useCurrentPool } from "@/contexts/pool";
import { useQuery } from "@tanstack/react-query";
import { DEEPBOOK_POOL_TO_DEX_POOL } from "@/constants/geckoterminal";


type OHLCVDataPoint = [
  number,  // time
  number,  // open
  number,  // high
  number,  // low
  number,  // close
  number   // volume
];

type CoinMeta = {
  address: string;
  name: string;
  symbol: string;
  coingecko_coin_id: string;
}

type ResponseMeta = {
  base: CoinMeta;
  quote: CoinMeta;
}

type OHLCVAttributes = {
  ohlcv_list: OHLCVDataPoint[];
}

type ResponseData = {
  id: string;
  type: string;
  attributes: OHLCVAttributes;
}

type OHLCVResponse = {
  data: ResponseData;
  meta: ResponseMeta;
}

async function fetchGeckoTerminalOHLCV(
  poolId: string,
  timeframe: "day" | "hour" | "minute",
) {
  const dexPool = DEEPBOOK_POOL_TO_DEX_POOL[poolId];

  const url = `https://api.geckoterminal.com/api/v2/networks/sui-network/pools/${dexPool}/ohlcv/${timeframe}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as OHLCVResponse;
  return data.data.attributes.ohlcv_list
    .map(dataPoint => ({
      time: dataPoint[0],
      open: dataPoint[1],
      high: dataPoint[2],
      low: dataPoint[3],
      close: dataPoint[4],
    }))
    .sort((a, b) => a.time - b.time);
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
