import { useState } from "react";
import { useSuiClientQueries } from "@mysten/dapp-kit";
import { useSummary } from "@/hooks/useSummary";
import { usePoolsContext } from "@/contexts/pools";
import { Input } from "@/components/ui/input";
import suiImg from "@/assets/sui.png";
import usdcImg from "@/assets/usdc.png";
import notFound from "@/assets/not-found.png";

export default function PairTable() {
  const pools = usePoolsContext();
  const { data: summaryData } = useSummary();
  if (!summaryData || !pools) return <p>loading</p>;

  const metadataResults = useSuiClientQueries({
    queries: pools.flatMap(pool => [
      {
        method: "getCoinMetadata" as const,
        params: { coinType: pool.quote_asset_id }
      },
      {
        method: "getCoinMetadata" as const,
        params: { coinType: pool.base_asset_id }
      }
    ])
  });

  if (!metadataResults) return <p>Loading</p>;

  metadataResults.forEach(res => console.log(res.data))

  const [inputValue, setInputValue] = useState<string>("");
  const input = inputValue.toLowerCase().trim();

  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  });

  const filteredData = summaryData
    .sort((a, b) => b.quote_volume - a.quote_volume)
    .filter(pair =>
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
        {filteredData.map(pair => {
          
          let baseAssetImg = metadataResults.find(res => res.data?.symbol === pair.base_currency)?.data?.iconUrl
          if (!baseAssetImg) {
            if (pair.base_currency.includes("SUI")) baseAssetImg = suiImg
            else if (pair.base_currency.includes("USDC")) baseAssetImg = usdcImg
            else baseAssetImg = notFound
          }
          let quoteAssetImg = metadataResults.find(res => res.data?.symbol === pair.quote_currency)?.data?.iconUrl
          if (!quoteAssetImg) {
            if (pair.quote_currency.includes("SUI")) quoteAssetImg = suiImg
            else if (pair.quote_currency.includes("USDC")) quoteAssetImg = usdcImg
            else quoteAssetImg = notFound
          }

          return (
            <a
              className="flex w-full items-center p-2 hover:bg-gray-100"
              href={`/trade/${pair.trading_pairs}`}
            >
              <div className="mr-6 flex">
                <img
                  src={baseAssetImg}
                  alt={pair.base_currency}
                  className="rounded-full z-10 h-6 w-6"
                />
                <img
                  src={quoteAssetImg}
                  alt={pair.quote_currency}
                  className="rounded-full ml-[-8px] h-6 w-6"
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
                <p className="text-gray-600 text-xs">
                  Vol {formatter.format(pair.quote_volume)} {pair.quote_currency}
                </p>
                <p
                  className={`text-right ${pair.price_change_percent_24h < 0 ? "text-[#ef5350]" : "text-[#26a69a]"}`}
                >
                  {Math.abs(pair.price_change_percent_24h).toFixed(2)}%
                </p>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  );
}
