import { useCurrentPool } from "@/contexts/pool";
import { useBalanceManager } from "@/contexts/balanceManager";
import { useOrderHistory } from "@/hooks/account/useOrderHistory";

import { BookX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function OrderHistory() {
  const pool = useCurrentPool();
  const { balanceManagerAddress } = useBalanceManager();
  const orders = useOrderHistory(pool.pool_name, balanceManagerAddress!);

  const allOrders = orders.data?.pages.flatMap((page) => page) || [];
  const sortedOrders = allOrders.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="no-scrollbar relative h-[180px] min-w-fit overflow-y-auto [&>div]:static">
      <Table>
        <TableHeader className="sticky top-0 text-nowrap bg-background text-xs [&_tr]:border-none">
          <TableRow className="">
            <TableHead className="pl-4 text-left">TIME PLACED</TableHead>
            <TableHead>TYPE</TableHead>
            <TableHead>PRICE ({pool.quote_asset_symbol})</TableHead>
            <TableHead>QUANTITY ({pool.base_asset_symbol})</TableHead>
            <TableHead>TOTAL ({pool.quote_asset_symbol})</TableHead>
            <TableHead>ID</TableHead>
            <TableHead className="pr-4 text-right">STATUS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-nowrap text-xs [&_tr]:border-none [&_tr_td:first-child]:pl-4 [&_tr_td:first-child]:text-muted-foreground [&_tr_td:last-child]:pr-4 [&_tr_td:last-child]:text-right">
          {!sortedOrders || sortedOrders.length === 0 ? (
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
              <BookX />
              <div>No orders</div>
            </div>
          ) : (
            sortedOrders.map((order, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(order.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{order.type}</TableCell>
                  <TableCell>{order.price}</TableCell>
                  <TableCell>{`${order.filled_quantity} / ${order.original_quantity}`}</TableCell>
                  <TableCell>{order.filled_quantity * order.price} </TableCell>
                  <TableCell>{order.order_id}</TableCell>
                  <TableCell>{order.status}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
