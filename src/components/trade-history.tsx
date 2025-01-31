import { useCurrentPool } from "@/contexts/pool";
import { useTrades } from "@/hooks/useTrades";

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export default function TradeHistory() {
  const pool = useCurrentPool();
  const { data: trades, isLoading } = useTrades(pool.pool_name, 50);

  if (isLoading) return <div>loading</div>
  if (!trades) return <div>failed to fetch trade history</div>

  return (
    <table className="w-full text-xs">
      <thead className="sticky top-0 h-6 bg-background text-right text-muted-foreground shadow-[0_0_0_1px_hsl(var(--border))]">
        <tr>
          <th className="w-full text-nowrap pl-2 pr-4">{`AMOUNT (${pool.base_asset_symbol})`}</th>
          <th className="w-auto text-nowrap pr-6">{`AMOUNT (${pool.quote_asset_symbol})`}</th>
          <th className="w-auto text-nowrap pr-3">TIME</th>
        </tr>
      </thead>
      <tbody>
        {trades.map((trade, index) => (
          <tr key={index} className="text-right">
            <th className="text-nowrap pr-4">{trade.base_volume}</th>
            <th
              className={`text-nowrap pr-6 ${trade.type == "buy" ? "text-[#26a69a]" : "text-[#ef5350]"}`}
            >
              {trade.quote_volume}
            </th>
            <th className="text-nowrap pr-3 text-muted-foreground">
              {formatTime(new Date(trade.timestamp))}
            </th>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
