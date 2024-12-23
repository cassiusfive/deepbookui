import deepbookApiClient from "@/lib/deepbook/apiClient";
import { useQuery } from "@tanstack/react-query";

export type OrderbookEntry = {
  price: number;
  amount: number;
};

type OrderbookInfo = {
  bids: OrderbookEntry[];
  asks: OrderbookEntry[];
  spreadAmount: number;
  spreadPercent: number;
};

async function fetchOrderbookInfo(
  poolId: string,
  depth: number = 30,
): Promise<OrderbookInfo> {
  const data = await deepbookApiClient(`/orderbook/${poolId}?depth=${depth}`);

  const asks: OrderbookEntry[] = data.asks.map((ask: [string, string]) => ({
    price: parseFloat(ask[0]),
    amount: parseFloat(ask[1]),
  }));

  const bids: OrderbookEntry[] = data.bids.map((bid: [string, string]) => ({
    price: parseFloat(bid[0]),
    amount: parseFloat(bid[1]),
  }));

  const spreadAmount = asks[0].price - bids[0].price;
  const spreadPercent = (spreadAmount / bids[0].price) * 100;

  return {
    asks,
    bids,
    spreadAmount,
    spreadPercent,
  };
}

// should pass in poolId as context
export function useOrderbook(poolId?: string) {
  return useQuery({
    queryKey: ["orderbook", poolId],
    queryFn: () => fetchOrderbookInfo(poolId!),
    refetchInterval: 500,
    refetchIntervalInBackground: true,
    enabled: !!poolId,
  });
}
