// https://docs.sui.io/standards/deepbookv3-sdk/pools#getlevel2ticksfrommid

import { useOrderbook, OrderbookEntry } from "@/hooks/useOrderbook";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { useCurrentPool } from "@/contexts/pool";
import { useTheme } from "@/contexts/theme";

type OrderbookEntriesProps = {
  entries: OrderbookEntry[];
  type: "ask" | "bid";
};

function OrderbookEntries({ entries, type }: OrderbookEntriesProps) {
  const { theme } = useTheme()
  const pool = useCurrentPool();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const textColor = type === "ask" ? "text-[#ef5350]" : "text-[#26a69a]";
  const bgColor =
    type === "ask" ? "rgba(239, 83, 80, 0.3)" : "rgba(38, 166, 154, 0.3)";
  // it might be nice to create custom utility class for these colors
  // these are the ones from trading view lightweight chart docs

  const aggregateData: {
    amount: number;
    value: number;
    averagePrice: number;
  }[] = [];
  entries.reduce(
    (acc, entry) => {
      acc.amount += entry.amount;
      acc.value += entry.amount * entry.price;
      aggregateData.push({
        ...acc,
        averagePrice: acc.value / acc.amount,
      });
      return acc;
    },
    { amount: 0, value: 0 },
  );

  const maxAmount = Math.max(...entries.map((entry) => entry.amount));

  if (type === "ask") {
    aggregateData.reverse();
  }

  const displayedEntries = type === "ask" ? entries.slice().reverse() : entries;

  return displayedEntries.map((entry, index) => {
    const barWidth = (entry.amount / maxAmount) * 100;
    const highlighted =
      hoveredIndex !== null &&
      (type === "ask" ? hoveredIndex <= index : hoveredIndex >= index);

    return (
      <Tooltip key={index}>
        <TooltipTrigger asChild>
          <tr
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              backgroundImage: `linear-gradient(to right,${bgColor} ${barWidth}%,transparent ${barWidth}%)`,
              backgroundColor: highlighted ? theme === "dark" ? "rgba(255,255,255, 0.1)" : "rgba(0,0,0, 0.05)" : "",
            }}
          >
            <td className="relative pr-6 text-right">
              <span className="relative">{entry.amount}</span>
            </td>
            <td className={`pr-3 text-right ${textColor}`}>
              {entry.price.toFixed(5)}
            </td>
          </tr>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={0} className="">
          <div className="flex w-full justify-between gap-2">
            <p>Average Price:</p>
            <p>{aggregateData[index].averagePrice.toFixed(5)}</p>
          </div>
          <div className="flex w-full justify-between gap-2">
            <p>{`Sum ${pool.base_asset_symbol}:`}</p>
            <p>{aggregateData[index].amount}</p>
          </div>
          <div className="flex w-full justify-between gap-2">
            <p>{`Sum ${pool.quote_asset_symbol}:`}</p>
            <p>{aggregateData[index].value.toFixed(5)}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  });
}

export default function OrderBook() {
  const pool = useCurrentPool();
  const { data, isLoading } = useOrderbook();

  if (isLoading) return <div></div>;
  if (!data) return <div>Error</div>;

  return (
    <table className="h-full w-full text-xs">
      <thead className="sticky top-0 z-10 h-6 bg-background text-muted-foreground shadow-[0_0_0_1px_hsl(var(--border))]">
        <tr>
          <th className="w-full text-nowrap pr-6 text-right">{`Amount (${pool.base_asset_symbol})`}</th>
          <th className="w-auto text-nowrap pr-3">{`Price (${pool.quote_asset_symbol})`}</th>
        </tr>
      </thead>
      <tbody>
        <OrderbookEntries entries={data!.asks} type="ask" />
        <tr className="border-y">
          <td
            colSpan={2}
            className="text-small w-full items-center justify-center py-1 text-center"
          >
            <span className="text-muted-foreground">SPREAD</span>
            <span className="mx-6">{data!.spreadAmount.toFixed(5)}</span>
            <span>{data!.spreadPercent.toFixed(4)}%</span>
          </td>
        </tr>
        <OrderbookEntries entries={data!.bids} type="bid" />
      </tbody>
    </table>
  );
}
