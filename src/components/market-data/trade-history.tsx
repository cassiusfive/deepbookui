import { useCurrentPool } from "@/contexts/pool";
import { useTradeHistory } from "@/hooks/useOrderHistory";

export default function TradeHistory() {
  const pool = useCurrentPool();
  const { data: trades } = useTradeHistory(pool.pool_name);

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
        {trades && (trades.map((trade, index) => (
          <tr key={index} className="text-right">
            <td className="text-nowrap pr-4">{trade.base_volume}</td>
            <td
              className={`text-nowrap pr-6 ${trade.type == "buy" ? "text-[#26a69a]" : "text-[#ef5350]"}`}
            >
              {trade.quote_volume}
            </td>
            <td className="text-nowrap pr-3 text-muted-foreground">
              {new Date(trade.timestamp).toLocaleTimeString([], { hour12: false })}
            </td>
          </tr>
        )))}
      </tbody>
    </table>
  );
}
