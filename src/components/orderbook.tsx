// https://docs.sui.io/standards/deepbookv3-sdk/pools#getlevel2ticksfrommid

import { useOrderbook, OrderbookEntry } from "@/hooks/useOrderbook";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useContract } from "@/contexts/contract";

type OrderbookEntriesProps = {
  entries: OrderbookEntry[];
  type: "ask" | "bid";
};

function OrderbookEntries({ entries, type }: OrderbookEntriesProps) {
  const textColor = type === "ask" ? "text-[#ef5350]" : "text-[#26a69a]";
  const bgColor = type === "ask" ? "#ef5350" : "#26a69a";
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
  const displayedEntries = type === "ask" ? entries.slice().reverse() : entries;
  if (type === "ask") aggregateData.reverse();

  return displayedEntries.map((entry, index) => {
    const barWidth = (entry.amount / maxAmount) * 100;

    return (
      <Tooltip key={index}>
        <TooltipTrigger asChild>
          <tr
            style={{
              backgroundImage: `linear-gradient(to right,${bgColor} ${barWidth}%,white ${barWidth}%)`,
              backgroundBlendMode: "lighten",
              backgroundColor: "rgba(255,255,255,0.7)",
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
            <p>Sum DEEP:</p>
            <p>{aggregateData[index].amount}</p>
          </div>
          <div className="flex w-full justify-between gap-2">
            <p>Sum SUI:</p>
            <p>{aggregateData[index].value.toFixed(5)}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  });
}

export default function OrderBook() {
  const contractContext = useContract();
  if (!contractContext) return

  const { data, isLoading } = useOrderbook(contractContext.poolKey);

  if (isLoading) return <div></div>;
  if (!data) return <div>Error</div>;

  return (
    <table className="h-full w-full text-xs">
      <thead className="sticky top-0 z-10 h-6 bg-background text-gray-500 shadow-[0_0_0_1px_rgb(229,231,235)]">
        <tr>
          <th className="w-full text-nowrap pr-6 text-right">{`Amount (${contractContext.baseAsset.baseAssetSymbol})`}</th>
          <th className="w-auto text-nowrap pr-3">{`Price (${contractContext.quoteAsset.quoteAssetSymbol})`}</th>
        </tr>
      </thead>
      <tbody>
        <OrderbookEntries entries={data!.asks} type="ask" />
        <tr className="border-y">
          <td
            colSpan={2}
            className="text-small w-full items-center justify-center py-1 text-center"
          >
            <span className="text-gray-500">SPREAD</span>
            <span className="mx-6">{data!.spreadAmount.toFixed(5)}</span>
            <span className="">{data!.spreadPercent.toFixed(4)}%</span>
          </td>
        </tr>
        <OrderbookEntries entries={data!.bids} type="bid" />
      </tbody>
    </table>
  );
}
