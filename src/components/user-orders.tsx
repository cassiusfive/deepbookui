import { useState } from "react"
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useCurrentPool } from "@/contexts/pool";
import { useDeepBook } from "@/contexts/deepbook";
import { useOpenOrders } from "@/hooks/useOpenOrders";
import { useToast } from "@/hooks/use-toast";
import { useBalanceManagerAccount } from "@/hooks/useBalanceManagerAccount";
import { BALANCE_MANAGER_KEY } from "@/constants/deepbook";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export default function OpenOrders() {
  const { toast } = useToast()
  const dbClient = useDeepBook();
  const pool = useCurrentPool()
  const { data: openOrders } = useOpenOrders(pool.pool_name, BALANCE_MANAGER_KEY)
  const { data: balanceManagerAccount } = useBalanceManagerAccount(pool.pool_name, BALANCE_MANAGER_KEY)
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [loadingCancelOrders, setloadingCancelOrders] = useState<Set<string>>(new Set())
  const [loadingClaimSettledBalances, setLoadingClaimSettledBalances] = useState<Set<string>>(new Set())

  if (!dbClient) return

  const handleCancelOrder = (orderId: string) => {
    setloadingCancelOrders(prev => new Set([...prev, orderId]));

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
        console.log("canceled order", result);
        toast({
          title: `✅ Canceled order ${orderId}`,
          duration: 3000
        })
      },
      onError: error => {
        console.error("failed to cancel order", error)
        toast({
          title: `❌ Failed to cancel order ${orderId}`,
          description: error.message,
          duration: 3000
        })
      }
    })

    setloadingCancelOrders(prev => {
      const next = new Set(prev);
      next.delete(orderId);
      return next;
    });
  }

  const handleClaimSettledFunds = (poolKey: string) => {
    setLoadingClaimSettledBalances(prev => new Set([...prev, poolKey]));

    const tx = new Transaction()

    dbClient.deepBook.withdrawSettledAmounts(pool.pool_name, BALANCE_MANAGER_KEY)(tx)

    signAndExecuteTransaction({
      transaction: tx
    }, {
      onSuccess: result => {
        console.log("withdrew settled balances", result);
        toast({
          title: "✅ Withdrew settled balances",
          duration: 3000
        })
      },
      onError: error => {
        console.error("failed to withdraw settled balances", error)
        toast({
          title: "❌ Failed to withdraw settled balances",
          description: error.message,
          duration: 3000
        })
      }
    })

    setLoadingClaimSettledBalances(prev => {
      const next = new Set(prev);
      next.delete(poolKey);
      return next;
    });
  }

  return (
    <div className="h-full">
      <Tabs defaultValue="open-orders">
        <TabsList className="w-full justify-start rounded-none bg-background px-4 pt-8 pb-6">
          <TabsTrigger className="data-[state=active]:shadow-none" value="open-orders">Open Orders{!openOrders || openOrders.length === 0 ? "" : `(${openOrders.length})`}</TabsTrigger>
          <TabsTrigger className="data-[state=active]:shadow-none" value="trade-history">Trade History</TabsTrigger>
          <TabsTrigger className="data-[state=active]:shadow-none" value="settled-balance">Settled Balance</TabsTrigger>
        </TabsList>
        <div className="mx-4 border-b"></div>
        <TabsContent value="open-orders" className="mt-0">
          <div className="relative no-scrollbar h-[180px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 text-nowrap bg-background text-xs [&_tr]:border-none">
                <TableRow>
                  <TableHead className="pl-4 text-left">TIME PLACED</TableHead>
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
                {!openOrders || openOrders?.length === 0 ? (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2 items-center justify-center text-xs text-muted-foreground">
                    <BookX />
                    <div>No orders</div>
                  </div>
                ): openOrders.map((order) => {
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
                      <TableCell>
                        <Button variant="outline" className="text-xs" disabled={loadingCancelOrders.has(order.order_id)} onClick={() => handleCancelOrder(order.order_id)}>
                          { loadingCancelOrders.has(order.order_id) ? 
                            (
                              <>
                                <Loader2 className="animate-spin" />
                                Please wait
                              </>
                            ): <span className="px-4">Cancel</span>
                          }
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="trade-history" className="mt-0">
          <Table>
            <TableHeader className="sticky top-0 text-nowrap bg-background text-xs [&_tr]:border-none">
                <TableRow>
                  <TableHead className="pl-4 text-left">TIME PLACED</TableHead>
                  <TableHead>PAIR</TableHead>
                  <TableHead>TYPE</TableHead>
                  <TableHead>SIDE</TableHead>
                  <TableHead>PRICE</TableHead>
                  <TableHead>AMOUNT</TableHead>
                  <TableHead className="pr-4 text-right">TOTAL</TableHead>
                </TableRow>
            </TableHeader>
          </Table>
        </TabsContent>
        <TabsContent value="settled-balance" className="mt-0">
          <Table>
              <TableHeader className="sticky top-0 text-nowrap bg-background text-xs [&_tr]:border-none">
                <TableRow>
                  <TableHead className="pl-4 text-left">PAIR</TableHead>
                  <TableHead>BASE ASSET AMOUNT</TableHead>
                  <TableHead>QUOTE ASSET AMOUNT</TableHead>
                  <TableHead className="pr-4 text-right">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-nowrap text-xs [&_tr]:border-none [&_tr_td:first-child]:pl-4 [&_tr_td:first-child]:text-muted-foreground [&_tr_td:last-child]:pr-4 [&_tr_td:last-child]:text-right">
                <TableRow>
                  <TableCell>{pool.pool_name}</TableCell>
                  <TableCell>{balanceManagerAccount?.settled_balances.base}</TableCell>
                  <TableCell>{balanceManagerAccount?.settled_balances.quote}</TableCell>
                  <TableCell>
                        <Button variant="outline" className="text-xs" disabled={loadingClaimSettledBalances.has(pool.pool_name)} onClick={() => handleClaimSettledFunds(pool.pool_name)}>
                          { loadingClaimSettledBalances.has(pool.pool_name) ? 
                            (
                              <>
                                <Loader2 className="animate-spin" />
                                Please wait
                              </>
                            ): <span className="px-4">Claim</span>
                          }
                        </Button>
                      </TableCell>
                </TableRow>
              </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
