// https://docs.sui.io/standards/deepbookv3-sdk/pools#getlevel2ticksfrommid

import { useOrderbook, OrderbookEntry } from "@/hooks/useOrderbook";

type OrderbookEntriesProps = {
  entries: OrderbookEntry[];
  type: "ask" | "bid";
};

function OrderbookEntries({ entries, type }: OrderbookEntriesProps) {
  const textColor = type === "ask" ? "text-[#ef5350]" : "text-[#26a69a]";
  const bgColor = type === "ask" ? "bg-[#ef5350]" : "bg-[#26a69a]";
  // it might be nice to create custom utility class for these colors
  // these are the ones from trading view lightweight chart docs
  if (type === "ask") {
    entries.sort((a, b) => b.price - a.price);
  } else {
    // entries.sort((a, b) => a.price - b.price);
  }

  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);

  return entries.map((entry, index) => (
    <tr key={index}>
      <td className="relative pr-6 text-right">
        <span className="relative">{entry.amount}</span>
        <div
          className={`absolute left-[-1px] top-0 h-full ${bgColor}`}
          style={{ width: `${(entry.amount / totalAmount) * 100}%` }}
        />
      </td>
      <td className={`pr-3 text-right ${textColor}`}>
        {entry.price.toFixed(5)}
      </td>
    </tr>
  ));
}

export default function OrderBook() {
  const { data, isLoading } = useOrderbook("DEEP_SUI");

  if (isLoading) {
    return <p>Loading</p>;
  }

  if (!data) {
    return <p>Error</p>;
  }

  return (
    <table className="h-full w-full text-xs">
      <thead className="sticky top-0 z-10 h-6 bg-background text-gray-500 shadow-[0_0_0_1px_rgb(229,231,235)]">
        <tr>
          <th className="w-full text-nowrap pr-6 text-right">Amount (DEEP)</th>
          <th className="w-auto text-nowrap pr-3">Price (SUI)</th>
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
