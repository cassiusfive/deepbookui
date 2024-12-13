interface Trade {
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
  return (
    <div className="no-scrollbar h-full min-w-fit overflow-y-auto">
      <table className="max-h-full w-full">
        <thead
          className="sticky top-0 z-20 border-gray-400 bg-background text-gray-500"
          style={{ boxShadow: "0px 1px 0px rgba(156, 163, 175, 1)" }}
        >
          <tr>
            <th className="w-full text-nowrap pl-2 pr-4 text-right">
              Amount (DEEP)
            </th>
            <th className="w-auto text-nowrap pr-2">Price (SUI)</th>
            <th className="w-auto text-nowrap pr-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {TRADE_HISTORY.map((trade, index) => (
            <tr key={index}>
              <th className="w-full text-nowrap pr-6 text-right">
                {trade.amount}
              </th>
              <th
                className={`w-auto text-nowrap pr-2 ${trade.type == "buy" ? "text-[#26a69a]" : "text-[#ef5350]"}`}
              >
                {trade.price}
              </th>
              <th className="w-auto text-nowrap pr-2 text-muted-foreground">
                {formatTime(trade.time)}
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
