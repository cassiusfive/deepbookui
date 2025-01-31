import dbIndexerClient from "@/lib/indexer-client";
import { useQuery } from "@tanstack/react-query";

export type Pair = {
  trading_pairs: string;
  quote_currency: string;
  last_price: number;
  lowest_price_24h: number;
  highest_bid: number;
  base_volume: number;
  price_change_percent_24h: number;
  quote_volume: number;
  lowest_ask: number;
  highest_price_24h: number;
  base_currency: string;
};

async function fetchSummary(): Promise<Pair[]> {
  if (import.meta.env.MODE === "development")
    return [
      {
        base_volume: 6096.8,
        last_price: 4.6298,
        trading_pairs: "SUI_AUSD",
        price_change_percent_24h: 4.987073071166148,
        highest_bid: 4.6214,
        quote_currency: "AUSD",
        base_currency: "SUI",
        quote_volume: 26440.97684,
        highest_price_24h: 4.7248,
        lowest_price_24h: 4.0976,
        lowest_ask: 4.6316,
      },
      {
        lowest_price_24h: 0.04545,
        lowest_ask: 0.04676,
        highest_bid: 0.04658,
        base_volume: 1024902.7,
        trading_pairs: "NS_SUI",
        base_currency: "NS",
        quote_currency: "SUI",
        quote_volume: 49235.097282,
        price_change_percent_24h: -8.09636650868878,
        last_price: 0.04654,
        highest_price_24h: 0.058,
      },
      {
        price_change_percent_24h: 1.2024048096192397,
        highest_bid: 0.0252,
        lowest_price_24h: 0.02443,
        quote_volume: 231040.4197,
        base_currency: "DEEP",
        base_volume: 9204220.0,
        trading_pairs: "DEEP_SUI",
        lowest_ask: 0.02523,
        highest_price_24h: 0.02562,
        last_price: 0.02525,
        quote_currency: "SUI",
      },
      {
        price_change_percent_24h: 0.0,
        base_volume: 3366698.2,
        base_currency: "WUSDC",
        highest_price_24h: 1.0002,
        quote_currency: "USDC",
        lowest_price_24h: 0.83105,
        highest_bid: 0.83106,
        lowest_ask: 1.0,
        trading_pairs: "WUSDC_USDC",
        quote_volume: 3366468.521435,
        last_price: 1.0,
      },
      {
        highest_price_24h: 0.0,
        highest_bid: 2800.0,
        trading_pairs: "BETH_USDC",
        base_volume: 0.0,
        base_currency: "BETH",
        lowest_price_24h: 0.0,
        lowest_ask: 100000.0,
        quote_volume: 0.0,
        price_change_percent_24h: 0.0,
        last_price: 2700.0,
        quote_currency: "USDC",
      },
      {
        lowest_price_24h: 0.01095,
        lowest_ask: 0.01128,
        base_currency: "TYPUS",
        highest_price_24h: 0.0113,
        trading_pairs: "TYPUS_SUI",
        quote_volume: 374.854297,
        price_change_percent_24h: 1.4388489208633226,
        last_price: 0.0113,
        base_volume: 33581.0,
        highest_bid: 0.01117,
        quote_currency: "SUI",
      },
      {
        trading_pairs: "NS_USDC",
        price_change_percent_24h: -3.6562500000000053,
        quote_currency: "USDC",
        last_price: 0.21581,
        quote_volume: 141477.926057,
        highest_bid: 0.21598,
        lowest_ask: 0.21652,
        lowest_price_24h: 0.194,
        base_currency: "NS",
        base_volume: 671695.7,
        highest_price_24h: 0.24485,
      },
      {
        base_volume: 36661.6,
        price_change_percent_24h: -0.029983509070008463,
        quote_volume: 36670.091745,
        highest_price_24h: 1.00394,
        trading_pairs: "AUSD_USDC",
        quote_currency: "USDC",
        last_price: 1.00025,
        lowest_price_24h: 1.00015,
        base_currency: "AUSD",
        lowest_ask: 1.00025,
        highest_bid: 0.99905,
      },
      {
        base_volume: 2120533.2,
        highest_bid: 4.635,
        last_price: 4.638,
        lowest_ask: 4.637,
        trading_pairs: "SUI_USDC",
        price_change_percent_24h: 4.435937851835181,
        quote_volume: 9312935.8644,
        base_currency: "SUI",
        quote_currency: "USDC",
        highest_price_24h: 4.739,
        lowest_price_24h: 4.107,
      },
      {
        quote_currency: "USDC",
        last_price: 0.11688,
        base_currency: "DEEP",
        highest_price_24h: 0.12088,
        lowest_price_24h: 0.10105,
        trading_pairs: "DEEP_USDC",
        lowest_ask: 0.11695,
        base_volume: 28765300.0,
        quote_volume: 3148668.0335,
        price_change_percent_24h: 5.15519568151146,
        highest_bid: 0.11678,
      },
      {
        lowest_price_24h: 0.0,
        highest_price_24h: 0.0,
        base_currency: "WUSDT",
        lowest_ask: 1.04,
        base_volume: 0.0,
        highest_bid: 0.90002,
        quote_currency: "USDC",
        last_price: 1.04,
        trading_pairs: "WUSDT_USDC",
        quote_volume: 0.0,
        price_change_percent_24h: 0.0,
      },
    ];
  return await dbIndexerClient(`/summary`);
}

export function useSummary() {
  return useQuery({
    queryKey: ["summary"],
    queryFn: () => fetchSummary(),
    refetchInterval: 1000,
  });
}
