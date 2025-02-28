import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useToast } from "@/hooks/useToast";
import { useCurrentPool } from "@/contexts/pool";
import { useDeepBook } from "@/contexts/deepbook";
import { useBalanceManager } from "@/contexts/balanceManager";
import { useOrders } from "@/hooks/account/useOrders";

import { BookX, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useManagerBalance } from "@/hooks/account/useBalances";

export default function OpenOrders() {
  const [loadingCancelOrders, setloadingCancelOrders] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const pool = useCurrentPool();
  const dbClient = useDeepBook();
  const { balanceManagerKey, balanceManagerAddress } = useBalanceManager();
  const { refetch: refetchManagerBalance } = useManagerBalance(balanceManagerKey, pool.pool_name);
  const orders = useOrders(pool.pool_name, balanceManagerAddress!, "Open");
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await dbClient?.client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showEffects: true,
          showObjectChanges: true,
        },
      }),
  });

  if (!dbClient) return;

  const orderMap = new Map();
  orders.data?.pages.forEach(page => {
    const sortedOrders = page.sort((a, b) => a.timestamp - b.timestamp);
    sortedOrders.forEach(order => {
      const orderId = order.order_id;
      const currentStatus = order.status;
    
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, order);
        return;
      }

      if (currentStatus === "Modified") {
        orderMap.set(orderId, order);
      } else if (currentStatus === "Canceled" || currentStatus === "Expired") {
        orderMap.delete(orderId);
      }
    })
  });

  const openOrders = Array.from(orderMap.values());

  const handleCancelOrder = (orderId: string) => {
    setloadingCancelOrders((prev) => new Set([...prev, orderId]));

    const tx = new Transaction();

    dbClient.deepBook.cancelOrder(
      pool.pool_name,
      balanceManagerKey,
      orderId,
    )(tx);

    signAndExecuteTransaction(
      {
        transaction: tx,
      },
      {
        onSuccess: async result => {
          if (result.effects?.status.status !== "success")  {
            console.error("tx failed\n", result)
            return toast({
              title: "❌ Failed to cancel order",
              description: "Check console for error details",
              duration: 3000
            });
          }

          await new Promise(resolve => setTimeout(resolve, 500));
          orders.refetch();
          refetchManagerBalance();

          
          console.log("canceled order\n", result);
          toast({
            title: "✅ Canceled order",
            duration: 3000,
          });
        },
        onError: (error) => {
          console.error("failed to cancel order\n", error);
          toast({
            title: "❌ Failed to cancel order",
            description: "Check console for error details",
            duration: 3000,
          });
        },
        onSettled: () => {
          setloadingCancelOrders((prev) => {
            const next = new Set(prev);
            next.delete(orderId);
            return next;
          });
        },
      },
    );
  };

  return (
    <div className="no-scrollbar relative h-[180px] overflow-y-auto [&>div]:static">
      <Table>
        <TableHeader className="sticky top-0 text-nowrap bg-background text-xs [&_tr]:border-none">
          <TableRow>
            <TableHead className="pl-4 text-left">TIME PLACED</TableHead>
            <TableHead>TYPE</TableHead>
            <TableHead>PRICE</TableHead>
            <TableHead>QUANTITY</TableHead>
            <TableHead>TOTAL</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead className="pr-4 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-nowrap text-xs [&_tr]:border-none [&_tr_td:first-child]:pl-4 [&_tr_td:first-child]:text-muted-foreground [&_tr_td:last-child]:pr-4 [&_tr_td:last-child]:text-right">
          {!openOrders || openOrders?.length === 0 ? (
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
              <BookX />
              <div>No orders</div>
            </div>
          ) : (
            openOrders.map((order, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(order.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{order.type}</TableCell>
                  <TableCell>{order.price}</TableCell>
                  <TableCell>{`${order.filled_quantity} / ${order.original_quantity}`}</TableCell>
                  <TableCell>
                    {order.filled_quantity * order.price}
                  </TableCell>
                  <TableCell>{order.order_id}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      className="text-xs"
                      disabled={loadingCancelOrders.has(order.order_id)}
                      onClick={() => handleCancelOrder(order.order_id)}
                    >
                      {loadingCancelOrders.has(order.order_id) ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Please wait
                        </>
                      ) : (
                        <span className="px-4">Cancel</span>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}