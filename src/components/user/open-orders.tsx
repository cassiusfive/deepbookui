import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useToast } from "@/hooks/useToast";
import { useCurrentPool } from "@/contexts/pool";
import { useDeepBook } from "@/contexts/deepbook";
import { useBalanceManager } from "@/contexts/balanceManager";
import { useManagerBalance } from "@/hooks/account/useBalances";
import { useOpenOrders } from "@/hooks/account/useOpenOrders";
import { useTradeHistory } from "@/hooks/account/useTradeHistory";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { BookX, Loader2 } from "lucide-react";

export default function OpenOrders() {
  const [loadingCancelOrders, setloadingCancelOrders] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const pool = useCurrentPool();
  const dbClient = useDeepBook();
  const { balanceManagerKey, balanceManagerAddress } = useBalanceManager();
  const { refetch: refetchManagerBaseAssetBalance } = useManagerBalance(balanceManagerKey, pool.base_asset_symbol);
  const { refetch: refetchManagerQuoteAssetBalance } = useManagerBalance(balanceManagerKey, pool.quote_asset_symbol);
  const { refetch: refetchMakerTradeHistory } = useTradeHistory(pool.pool_name, balanceManagerAddress);
  const { refetch: refetchTakerTradeHistory } = useTradeHistory(pool.pool_name, undefined, balanceManagerAddress);

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

  const orders = useOpenOrders(pool.pool_name, balanceManagerKey);

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

          // slight delay is needed for data to update before refetch
          await new Promise(resolve => setTimeout(resolve, 400));
          orders.refetch();
          refetchManagerBaseAssetBalance();
          refetchManagerQuoteAssetBalance();
          refetchMakerTradeHistory();
          refetchTakerTradeHistory();

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
            <TableHead className="pl-4 text-left">EXPIRATION</TableHead>
            <TableHead>QUANTITY</TableHead>
            <TableHead>ID</TableHead>
            <TableHead className="pr-4 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-nowrap text-xs [&_tr]:border-none [&_tr_td:first-child]:pl-4 [&_tr_td:first-child]:text-muted-foreground [&_tr_td:last-child]:pr-4 [&_tr_td:last-child]:text-right">
          {!orders.data || orders.data?.length === 0 ? (
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
              <BookX />
              <div>No orders</div>
            </div>
          ) : (
            orders.data?.map((order, index) => {
              if (!order) return;
              return (
                <TableRow key={index}>
                  <TableCell>{new Date(Number(order.expire_timestamp) / 1000000).toLocaleString()}</TableCell>
                  <TableCell>{`${order.filled_quantity} / ${order.quantity}`}</TableCell>
                  <TableCell>{order.order_id}</TableCell>
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