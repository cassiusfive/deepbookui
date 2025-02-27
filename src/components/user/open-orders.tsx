import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useToast } from "@/hooks/useToast";
import { useCurrentPool } from "@/contexts/pool";
import { useDeepBook } from "@/contexts/deepbook";
import { useOrders } from "@/hooks/useUserOrders";
import { useCurrentManager } from "@/hooks/useCurrentManager";

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


export default function OpenOrders() {
  const { toast } = useToast();
  const pool = useCurrentPool();
  const dbClient = useDeepBook();
  const { balanceManagerKey, balanceManagerAddress } = useCurrentManager();
  const orders = useOrders(pool.pool_name, balanceManagerAddress!);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [loadingCancelOrders, setloadingCancelOrders] = useState<Set<string>>(new Set());

  if (!dbClient) return;

  const openOrders = orders.data?.pages.flatMap((page) =>
    page.filter(
      (order) => order.status === "Placed" || order.status === "Modified",
    ),
  );

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
        onSuccess: (result) => {
          console.log("canceled order", result);
          toast({
            title: `✅ Canceled order ${orderId}`,
            duration: 3000,
          });
        },
        onError: (error) => {
          console.error("failed to cancel order", error);
          toast({
            title: `❌ Failed to cancel order ${orderId}`,
            description: error.message,
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
      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => orders.fetchPreviousPage()}
                disabled={
                  !orders.hasPreviousPage || orders.isFetchingPreviousPage
                }
              />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink></PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                onClick={() => orders.fetchNextPage()}
                disabled={
                  !orders.hasNextPage || orders.isFetchingNextPage
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}