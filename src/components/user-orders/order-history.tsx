import { useCurrentPool } from "@/contexts/pool";
import { useCurrentManager } from "@/hooks/useCurrentManager";
import { useOrderHistory } from "@/hooks/useOrderHistory";

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
  const { balanceManagerAddress } = useCurrentManager();
  const orderHistory = useOrderHistory(pool.pool_name, balanceManagerAddress!);

  const history = orderHistory.data?.pages.flatMap((page) => page);

  return (
    <div className="no-scrollbar relative h-[180px] overflow-y-auto">
      <Table>
        <TableHeader className="sticky top-0 text-nowrap bg-background text-xs [&_tr]:border-none">
          <TableRow>
            <TableHead className="pl-4 text-left">TIME PLACED</TableHead>
            <TableHead>TYPE</TableHead>
            <TableHead>PRICE</TableHead>
            <TableHead>QUANTITY</TableHead>
            <TableHead>TOTAL</TableHead>
            <TableHead className="pr-4 text-right">ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-nowrap text-xs [&_tr]:border-none [&_tr_td:first-child]:pl-4 [&_tr_td:first-child]:text-muted-foreground [&_tr_td:last-child]:pr-4 [&_tr_td:last-child]:text-right">
          {!history || history.length === 0 ? (
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
              <BookX />
              <div>No orders</div>
            </div>
          ) : (
            history.map((order, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(order.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{order.type}</TableCell>
                  <TableCell>{order.price}</TableCell>
                  <TableCell>{order.quote_volume}</TableCell>
                  <TableCell>
                    {order.quote_volume * order.price}
                  </TableCell>
                  <TableCell>{order.trade_id}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}