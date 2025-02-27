import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

import { useToast } from "@/hooks/useToast";
import { useCurrentPool } from "@/contexts/pool";
import { useDeepBook } from "@/contexts/deepbook";
import { useBalanceManager } from "@/contexts/balanceManager";
import { useBalancesFromCurrentPool, useManagerBalance } from "@/hooks/account/useBalances";
import { mainnetPackageIds, testnetPackageIds } from "@/constants/deepbook";

import { Button } from "@/components/ui/button";
import ManageBalanceModal from "./balance-manager";

export default function AccountSummary() {
  const { toast } = useToast()
  const pool = useCurrentPool();
  const dbClient = useDeepBook();
  const account = useCurrentAccount();
  const { balanceManagerKey, balanceManagerAddress, setBalanceManager } = useBalanceManager();
  const { baseAssetBalance, quoteAssetBalance } = useBalancesFromCurrentPool();
  const { data: baseAssetManagerBalance } = useManagerBalance(balanceManagerKey, pool.base_asset_symbol);
  const { data: quoteAssetManagerBalance } = useManagerBalance(balanceManagerKey, pool.quote_asset_symbol);

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    // @ts-expect-error
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

  const handleCreateBalanceManager = () => {
    const tx = new Transaction();
    dbClient?.balanceManager.createAndShareBalanceManager()(tx);

    signAndExecuteTransaction(
      {
        transaction: tx,
      },
      {
        onSuccess: (result) => {
          console.log("created balance manager\n", result);

          // @ts-ignore https://docs.sui.io/standards/deepbookv3-sdk#balance-manager
          const managerAddress: string = result.objectChanges?.find(
            (change) => {
              return (
                change.type === "created" &&
                (change.objectType === `${mainnetPackageIds.DEEPBOOK_PACKAGE_ID}::balance_manager::BalanceManager` || 
                 change.objectType === `${testnetPackageIds.DEEPBOOK_PACKAGE_ID}::balance_manager::BalanceManager`)
              );
            },
          )?.["objectId"];
          setBalanceManager(managerAddress);

          toast({
            title: "✅ Created balance manager",
            description: managerAddress,
            duration: 3000,
          });
        },
        onError: (error) => {
          console.error("error creating balance manager\n", error);
          toast({
            title: "❌ Failed to create balance manager",
            description: "Check console for error details",
            duration: 3000,
          });
        },
      },
    );
  };

  return (
    <div className="border-b p-3">
      <h1 className="pb-2">Available to trade</h1>
      <div className="flex justify-between text-sm">
        <div>{pool.base_asset_symbol}</div>
        <div className="text-right">
          {pool.round.display(baseAssetBalance)}
        </div>
      </div>
      <div className="flex justify-between pb-8 text-sm">
        <div>{pool.quote_asset_symbol}</div>
        <div className="text-right">
          {pool.round.display(quoteAssetBalance)}
        </div>
      </div>
      {!account ? (
        <div>Connect your wallet</div>
      ) : !balanceManagerAddress ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleCreateBalanceManager}
        >
          Create a balance manager
        </Button>
      ) : (
        <>
          <h1 className="pb-2">Balance Manager Funds</h1>
          <div className="flex justify-between text-sm">
            <div>{pool.base_asset_symbol}</div>
            <div className="text-right">
              {pool.round.display(baseAssetManagerBalance?.balance || 0)}
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <div>{pool.quote_asset_symbol}</div>
            <div className="text-right">
              {pool.round.display(quoteAssetManagerBalance?.balance || 0)}
            </div>
          </div>
          <div className="flex w-full justify-center gap-4">
            <ManageBalanceModal />
          </div>
        </>
      )}
    </div>
  )
}