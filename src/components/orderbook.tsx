// https://docs.sui.io/standards/deepbookv3-sdk/pools#getlevel2ticksfrommid

interface OrderBookEntry {
  price: number;
  amount: number;
}

const ASKS: OrderBookEntry[] = [
  { price: 0.01901, amount: 242270 },
  { price: 0.01897, amount: 368270 },
  { price: 0.01894, amount: 195650 },
  { price: 0.01891, amount: 47830 },
  { price: 0.01889, amount: 370010 },
  { price: 0.01887, amount: 321310 },
  { price: 0.01888, amount: 43770 },
  { price: 0.01884, amount: 5150 },
  { price: 0.01882, amount: 150 },
];

const BIDS: OrderBookEntry[] = [
  { price: 0.01879, amount: 150 },
  { price: 0.01877, amount: 5150 },
  { price: 0.01875, amount: 48100 },
  { price: 0.01873, amount: 373080 },
  { price: 0.01872, amount: 48110 },
  { price: 0.01869, amount: 97060 },
  { price: 0.01865, amount: 374590 },
  { price: 0.01863, amount: 32131 },
  { price: 0.01862, amount: 2313 },
  { price: 0.01861, amount: 193402 },
  { price: 0.01859, amount: 1904 },
  { price: 0.01856, amount: 19302 },
  { price: 0.01853, amount: 1102 },
];

const MIDPOINT = 0.01881;

interface OrderBookEntriesProps {
  entries: OrderBookEntry[];
  type: "ask" | "bid";
}

function OrderBookEntries({ entries, type }: OrderBookEntriesProps) {
  const textColor = type === "ask" ? "text-[#ef5350]" : "text-[#26a69a]";
  const bgColor = type === "ask" ? "bg-[#ef5350]" : "bg-[#26a69a]";
  // it might be nice to create custom utility class for these colors
  // these are the ones from trading view lightweight chart docs

  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);

  return entries.map((entry, index) => (
    <tr key={index}>
      <td className="relative pr-6 text-right">
        <span className="relative z-10">{entry.amount}</span>
        <div
          className={`absolute top-0 h-full transition-all ${bgColor}`}
          style={{ width: `${(entry.amount / totalAmount) * 100}%` }}
        ></div>
      </td>
      <td className={textColor}>{entry.price}</td>
    </tr>
  ));
}

export default function OrderBook() {
  return (
    <div className="no-scrollbar h-full min-w-fit overflow-y-auto">
      <table className="max-h-full w-full text-sm">
        <thead
          className="sticky top-0 z-20 border-gray-400 bg-gray-200 text-gray-500"
          style={{ boxShadow: "0px 1px 0px rgba(156, 163, 175, 1)" }}
        >
          <tr>
            <th className="w-full text-nowrap pr-6 text-right">
              Amount (DEEP)
            </th>
            <th className="w-auto text-nowrap pr-2">Price (SUI)</th>
          </tr>
        </thead>
        <tbody className="">
          <OrderBookEntries entries={ASKS} type="ask" />
          <tr className="border-y border-gray-400">
            <td className="text-center text-gray-500">Midpoint</td>
            <td>{MIDPOINT}</td>
          </tr>
          <OrderBookEntries entries={BIDS} type="bid" />
        </tbody>
      </table>
    </div>
  );
}
