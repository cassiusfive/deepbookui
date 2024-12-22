import { useContract } from "@/contexts/contract";

type Trade = {
  amount: number;
  price: number;
  type: "buy" | "sell";
  time: Date;
}

const TRADE_HISTORY: Trade[] = [];
for (let i = 0; i < 50; i++) {
  TRADE_HISTORY.push({
    amount: parseFloat((Math.random() * 20).toFixed(2)), // Random amount
    price: parseFloat((Math.random() * 0.01).toFixed(8)), // Random price
    type: Math.random() < 0.5 ? "buy" : "sell",
    time: new Date(new Date().getTime() - Math.random() * 25 * 60 * 60 * 1000),
  });
}
TRADE_HISTORY.sort((a, b) => b.time.getTime() - a.time.getTime());

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export default function TradeHistory() {
  const contractContext = useContract();
  if (!contractContext) return

  return (
    <table className="w-full text-xs">
      <thead className="h-6 sticky top-0 bg-background shadow-[0_0_0_1px_rgb(229,231,235)] text-gray-500 text-right">
        <tr>
          <th className="w-full text-nowrap pl-2 pr-4">{`AMOUNT (${contractContext.baseAsset.baseAssetSymbol})`}</th>
          <th className="w-auto text-nowrap pr-6">{`AMOUNT (${contractContext.quoteAsset.quoteAssetSymbol})`}</th>
          <th className="w-auto text-nowrap pr-3">TIME</th>
        </tr>
      </thead>
      <tbody>
        {TRADE_HISTORY.map((trade, index) => (
          <tr key={index} className="text-right">
            <th className="text-nowrap pr-4">
              {trade.amount}
            </th>
            <th className={`text-nowrap pr-6 ${trade.type == "buy" ? "text-[#26a69a]" : "text-[#ef5350]"}`}>
              {trade.price.toFixed(4)}
            </th>
            <th className="text-nowrap pr-3 text-muted-foreground">
              {formatTime(trade.time)}
            </th>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
