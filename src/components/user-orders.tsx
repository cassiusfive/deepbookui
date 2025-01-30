import { Transaction } from "@mysten/sui/transactions";
import { useCurrentPool } from "@/contexts/pool";
import { useDeepBook } from "@/contexts/deepbook";
import { useOpenOrders } from "@/hooks/useOpenOrders";
import { BALANCE_MANAGER_KEY } from "@/constants/deepbook";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BookX } from "lucide-react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export default function OpenOrders() {
  const dbClient = useDeepBook();
  const pool = useCurrentPool()
  const { data: openOrders, isLoading } = useOpenOrders(pool.pool_name, BALANCE_MANAGER_KEY)
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  if (!dbClient) return
  if (isLoading) return <div>loading</div>
  if (!openOrders) return

  const handleCancelOrder = async(orderId: string) => {
    const tx = new Transaction();
    
    dbClient.deepBook.cancelOrder(
      pool.pool_name,
      BALANCE_MANAGER_KEY,
      orderId
    )(tx);

    signAndExecuteTransaction({
      transaction: tx
    }, {
      onSuccess: result => {
        console.log('executed transaction', result);
      }
    })
  }

  return (
    <div className="h-full">
      <div className="border-b p-4">Orders</div>
      <div className="no-scrollbar h-[180px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 text-nowrap bg-background text-xs shadow-[0_0_0_1px_hsl(var(--border))] [&_tr]:border-none">
            <TableRow>
              <TableHead className="w-[100px] pl-4">TIME PLACED</TableHead>
              <TableHead>PAIR</TableHead>
              <TableHead>TYPE</TableHead>
              <TableHead>SIDE</TableHead>
              <TableHead>PRICE</TableHead>
              <TableHead>AMOUNT</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead className="pr-4 text-right">STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-nowrap text-xs [&_tr]:border-none [&_tr_td:first-child]:pl-4 [&_tr_td:first-child]:text-muted-foreground [&_tr_td:last-child]:pr-4 [&_tr_td:last-child]:text-right">
          {openOrders.length > 0 &&
            openOrders.map((order) => {
              console.log(order)
              return (
                <TableRow>
                  <TableCell>{formatTime(new Date(order.expire_timestamp))}</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell>USDC</TableCell>
                  <TableCell></TableCell>
                  <TableCell>USDC</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell><Button onClick={() => handleCancelOrder(order.order_id)}>Cancel</Button></TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {!openOrders.length && (
          <div className="flex h-[calc(100%-40px)] flex-col items-center justify-center text-xs text-muted-foreground">
            <BookX />
            <div>No orders</div>
          </div>
        )}
      </div>
    </div>
  );
}
