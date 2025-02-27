import { useCurrentPool } from "@/contexts/pool";
import { useQuery } from "@tanstack/react-query";

type PriceData = {
  open: string;
  high: string;
  low: string;
  settle: string;
  avg: string;
  timestamp: number;
}

type ResponseData = {
  code: number;
  msg: string;
  data: {
    lists: PriceData[]
  };
}

async function fetchGeckoTerminalOHLCV(poolId: string) {
  const end = Math.floor(Date.now() / 1000)
  const start = end - (60 * 60 * 24 * 7)

  const url = `https://api-sui.cetus.zone/v2/sui/deepbookv3/prices?date_type=hour&start_timestamp=${start}&end_timestamp=${end}&address=${poolId}`;

  console.log(url)

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
  }

  const res = (await response.json()) as ResponseData;

  console.log(res)
  return res.data.lists.map(dataPoint => ({
    time: dataPoint.timestamp,
    open: parseFloat(dataPoint.open),
    high: parseFloat(dataPoint.high),
    low: parseFloat(dataPoint.low),
    close: parseFloat(dataPoint.settle),
  })).sort((a, b) => a.time - b.time);
}

export function useCandleData() {
  const pool = useCurrentPool();

  console.log(pool.pool_id)

  return useQuery({
    queryKey: ["candleData", pool.pool_id],
    queryFn: async () => {
      return fetchGeckoTerminalOHLCV(pool.pool_id);
    },
    refetchInterval: 10000,
  });
}
