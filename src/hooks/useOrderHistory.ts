import dbIndexerClient from "@/lib/indexer-client";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export type Trade = {
  trade_id: string;
  maker_balance_manager_id: string;
  maker_order_id: string;
  taker_balance_manager_id: string;
  taker_order_id: string;
  type: string;
  price: number;
  base_volume: number;
  quote_volume: number;
  timestamp: number;
};

export function useOrderHistory(pool: string, limit: number = 1, taker: string | null = null, maker: string | null = null): UseQueryResult<Trade[], Error> {
  const url = `/trades/${pool}?limit=${limit}${taker ? `&taker_balance_manager_id=${taker}` : ""}${maker ? `&maker_balance_manager_id=${maker}` : ""}`
  return useQuery({
    queryKey: ["trades", pool, limit, maker, taker],
    queryFn: async () => await dbIndexerClient(url),
    refetchInterval: 1000
  });
}

async function fetchEvents(sender: string, cursor?: string) {
  const query = `
    query GetEvents($sender: String, $cursor: String) {
        events(
          filter: { sender: $sender }
          first: 50
          after: $cursor
        ) {
          edges {
            node {
              timestamp
              transactionBlock {
                digest
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
  `;

  const response = await fetch("https://sui-mainnet.mystenlabs.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { sender, cursor },
    }),
  });

  return response.json();
}

async function fetchAllEvents(walletAddress: string) {
  let hasNextPage = true;
  let cursor: string | null = null;
  let allEvents: any[] = [];

  while (hasNextPage) {
    const response = await fetchEvents(walletAddress, cursor || undefined);
    const { edges, pageInfo } = response.data.events;
    
    allEvents = [...allEvents, ...edges.map(edge => edge.node)];
    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }

  const seenDigests = new Set()
  const uniqueEvents = allEvents.filter(event => {
    if (seenDigests.has(event.transactionBlock.digest)) {
      return false
    } else {
      seenDigests.add(event.transactionBlock.digest)
      return true
    }
  })

  return uniqueEvents.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

export function useUserOrderHistory(address: string | undefined) {
  return useQuery({
    queryKey: ["userOrderHistory", address!],
    queryFn: async () => await fetchAllEvents(address!),
    enabled: !!address
  });
}
