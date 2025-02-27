import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useToast } from "@/hooks/useToast";
import { useCurrentPool } from "@/contexts/pool";
import { useDeepBook } from "@/contexts/deepbook";
import { useBalanceManager } from "@/contexts/balanceManager";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useDeepBookAccount } from "@/hooks/account/useDeepBookAccount";

export default function SettledBalance() {
  const { toast } = useToast()
  const pool = useCurrentPool();
  const dbClient = useDeepBook();
  const { balanceManagerKey } = useBalanceManager();
  const { data: account } = useDeepBookAccount(pool.pool_name, balanceManagerKey);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [loadingClaimSettledBalances, setLoadingClaimSettledBalances] = useState<Set<string>>(new Set());

  if (!dbClient) return;

  const handleClaimSettledFunds = (poolKey: string) => {
    setLoadingClaimSettledBalances((prev) => new Set([...prev, poolKey]));

    const tx = new Transaction();

    dbClient.deepBook.withdrawSettledAmounts(
      pool.pool_name,
      balanceManagerKey,
    )(tx);

    signAndExecuteTransaction(
      {
        transaction: tx,
      },
      {
        onSuccess: (result) => {
          console.log("withdrew settled balances", result);
          toast({
            title: "✅ Withdrew settled balances",
            duration: 3000,
          });
        },
        onError: (error) => {
          console.error("failed to withdraw settled balances\n", error);
          toast({
            title: "❌ Failed to withdraw settled balances",
            description: "Check console for error details",
            duration: 3000,
          });
        },
        onSettled: () => {
          setLoadingClaimSettledBalances((prev) => {
            const next = new Set(prev);
            next.delete(poolKey);
            return next;
          });
        },
      },
    );
  };

  return (
    <div className="no-scrollbar relative h-[180px] overflow-y-auto">
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
            <TableCell>
              {account?.settled_balances.base}
            </TableCell>
            <TableCell>
              {account?.settled_balances.quote}
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                className="text-xs"
                disabled={loadingClaimSettledBalances.has(pool.pool_name)}
                onClick={() => handleClaimSettledFunds(pool.pool_name)}
              >
                {loadingClaimSettledBalances.has(pool.pool_name) ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Please wait
                  </>
                ) : (
                  <span className="px-4">Claim</span>
                )}
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}