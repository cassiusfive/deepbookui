import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuiClientQueries } from "@mysten/dapp-kit";
import { useSummary } from "@/hooks/useSummary";
import { Input } from "@/components/ui/input";
import suiImg from "@/assets/sui.png";
import usdcImg from "@/assets/usdc.png";
import notFound from "@/assets/not-found.png";
import { usePools } from "@/hooks/usePools";

export default function PairTable() {
  const { data: pools } = usePools();
  const { data: summaryData } = useSummary();

  const metadataResults = useSuiClientQueries({
    queries: pools!.flatMap((pool) => [
      {
        method: "getCoinMetadata" as const,
        params: { coinType: pool.quote_asset_id },
      },
      {
        method: "getCoinMetadata" as const,
        params: { coinType: pool.base_asset_id },
      },
    ]),
  });

  metadataResults.forEach((res) => console.log(res.data));

  const [inputValue, setInputValue] = useState<string>("");
  const input = inputValue.toLowerCase().trim();

  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  });

  const filteredData = summaryData
    .sort((a, b) => b.quote_volume - a.quote_volume)
    .filter(
      (pair) =>
        pair.quote_currency.toLowerCase().includes(input) ||
        pair.base_currency.toLowerCase().includes(input),
    );

  return (
    <div className="my-6 flex h-[calc(100%-1.5rem)] flex-col font-mono text-sm">
      <Input
        placeholder="Search for a market"
        onChange={(e) => setInputValue(e.target.value)}
      />

      <div className="no-scrollbar mt-4 w-full shrink divide-y-[1px] overflow-y-auto">
        {filteredData.length == 0 && (
          <p className="text-center">No pair found</p>
        )}
        {filteredData.map((pair) => {
          const pool = pools.find(
            (pool) =>
              pool.base_asset_symbol == pair.base_currency &&
              pool.quote_asset_symbol == pair.quote_currency,
          );
          if (!pool) return <div>pool not found</div>;

          let baseAssetImg = metadataResults.find(
            (res) => res.data?.symbol === pair.base_currency,
          )?.data?.iconUrl;
          if (!baseAssetImg) {
            if (pair.base_currency.includes("SUI")) baseAssetImg = suiImg;
            else if (pair.base_currency.includes("USDC"))
              baseAssetImg = usdcImg;
            else baseAssetImg = notFound;
          }
          let quoteAssetImg = metadataResults.find(
            (res) => res.data?.symbol === pair.quote_currency,
          )?.data?.iconUrl;
          if (!quoteAssetImg) {
            if (pair.quote_currency.includes("SUI")) quoteAssetImg = suiImg;
            else if (pair.quote_currency.includes("USDC"))
              quoteAssetImg = usdcImg;
            else quoteAssetImg = notFound;
          }

          return (
            <Link
              className="flex w-full items-center p-2 hover:bg-gray-100"
              to="/trade/$contractAddress"
              params={{ contractAddress: pool.pool_id }}
            >
              <div className="mr-6 flex">
                <img
                  src={baseAssetImg}
                  alt={pair.base_currency}
                  className="z-10 h-6 w-6 rounded-full"
                />
                <img
                  src={quoteAssetImg}
                  alt={pair.quote_currency}
                  className="ml-[-8px] h-6 w-6 rounded-full"
                />
              </div>
              <div className="grid grow grid-cols-2 text-nowrap">
                <p className="text-sm">
                  {pair.base_currency}-{pair.quote_currency}
                </p>
                <p className="text-right text-xs">
                  {pair.quote_currency.includes("USD")
                    ? `$${pair.last_price.toFixed(2)}`
                    : `${pair.last_price.toFixed(2)} ${pair.quote_currency}`}
                </p>
                <p className="text-xs text-gray-600">
                  Vol {formatter.format(pair.quote_volume)}{" "}
                  {pair.quote_currency}
                </p>
                <p
                  className={`text-right ${pair.price_change_percent_24h < 0 ? "text-[#ef5350]" : "text-[#26a69a]"}`}
                >
                  {Math.abs(pair.price_change_percent_24h).toFixed(2)}%
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
