import { useSummary } from "@/hooks/useSummary";
import { Input } from "./ui/input";
import notFound from "@/assets/not-found.png";
import { useState } from "react";

export default function PairTable() {
  const { data } = useSummary();
  const [inputValue, setInputValue] = useState<string>("");

  const input = inputValue.toLowerCase().trim();

  if (!data) return <p>loading</p>;

  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  });

  const filteredData = data
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
        {filteredData.map((pair) => (
          <a
            className="flex w-full items-center p-2 hover:bg-gray-100"
            href={`/trade/${pair.trading_pairs}`}
          >
            <div className="mr-6 flex">
              <img
                src={notFound}
                alt={pair.base_currency}
                className="z-10 h-6 w-6"
              />
              <img
                src={notFound}
                alt={pair.quote_currency}
                className="ml-[-8px] h-6 w-6"
              />
            </div>
            <div className="grid grow grid-cols-2 text-nowrap">
              <p className="text-base font-bold">
                {pair.base_currency}-{pair.quote_currency}
              </p>
              <p className="text-right">
                {pair.last_price.toFixed(2)}
                {pair.quote_currency.includes("USD")
                  ? "$"
                  : ` ${pair.quote_currency}`}
              </p>
              <p className="">
                Vol {formatter.format(pair.quote_volume)} {pair.quote_currency}
              </p>
              <p
                className={`text-right ${pair.price_change_percent_24h < 0 ? "text-[#ef5350]" : "text-[#26a69a]"}`}
              >
                {pair.price_change_percent_24h.toFixed(2)}%
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
