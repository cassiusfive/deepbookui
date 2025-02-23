import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BALANCE_MANAGER_KEY, mainnetCoins } from "@/constants/deepbook";
import { useCoinsMetadata } from "@/hooks/useCoinMetadata";
import { useBalance, useManagerBalance } from "@/hooks/useBalances";
import { useCurrentPool } from "@/contexts/pool";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { useDeepBook } from "@/contexts/deepbook";
import { Transaction } from "@mysten/sui/transactions";

type TransferType = "deposit" | "withdraw";

export function ManageBalanceModal() {
  const pool = useCurrentPool();
  const dbClient = useDeepBook()!;
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const coinTypes = Object.values(mainnetCoins).map((coin) => coin.type);
  const coinMetadataQueries = useCoinsMetadata(coinTypes);
  const coins = Object.entries(mainnetCoins).map(([symbol, coin], index) => ({
    symbol,
    coin,
    metadata: coinMetadataQueries[index]?.data,
  }));

  const [selectedAsset, setSelectedAsset] = useState("DEEP");
  const { data: managerData } = useManagerBalance(
    BALANCE_MANAGER_KEY,
    selectedAsset,
  );
  const managerBalance = managerData?.balance;
  const asset = mainnetCoins[selectedAsset];
  const { data: walletBalance } = useBalance(asset.type, asset.scalar);

  const formSchema = useMemo(
    () =>
      z
        .object({
          type: z.enum(["deposit", "withdraw"]),
          asset: z.string(),
          amount: z.coerce
            .number()
            .positive("Amount must be greater than zero."),
        })
        .superRefine((values, ctx) => {
          if (values.type === "withdraw") {
            if (
              managerBalance !== undefined &&
              values.amount > managerBalance
            ) {
              ctx.addIssue({
                path: ["amount"],
                message: `Insufficient manager balance.`,
                code: "custom",
              });
            }
          } else {
            if (walletBalance !== undefined && values.amount > walletBalance) {
              ctx.addIssue({
                path: ["amount"],
                message: `Insufficient wallet balance.`,
                code: "custom",
              });
            }
          }
        }),
    [managerBalance, walletBalance],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      type: "deposit",
      asset: "DEEP",
      amount: 1.0,
    },
  });

  const watchedAsset = useWatch({
    control: form.control,
    name: "asset",
  });

  useEffect(() => {
    if (watchedAsset && watchedAsset !== selectedAsset) {
      setSelectedAsset(watchedAsset);
    }
  }, [watchedAsset, selectedAsset]);

  function handleDeposit(amount: number) {
    const tx = new Transaction();

    tx.add(
      dbClient.balanceManager.depositIntoManager(
        BALANCE_MANAGER_KEY,
        selectedAsset,
        amount,
      ),
    );

    signAndExecuteTransaction(
      {
        transaction: tx,
      },
      {
        onError: (err) => {
          console.log(err);
        },
      },
    );
  }

  function handleWithdraw(amount: number) {
    const tx = new Transaction();

    tx.add(
      dbClient.balanceManager.withdrawFromManager(
        BALANCE_MANAGER_KEY,
        selectedAsset,
        amount,
        account!.address,
      ),
    );

    signAndExecuteTransaction({
      transaction: tx,
    });
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.type === "deposit") {
      handleDeposit(values.amount);
    } else {
      handleWithdraw(values.amount);
    }
  }

  const [assetSelectorOpen, setAssetSelectorOpen] = useState(false);

  const transferType = form.watch("type");

  return (
    <Dialog>
      <DialogTrigger
        asChild
        onClick={() => {
          form.setValue("asset", pool.quote_asset_symbol);
          form.setValue("type", "deposit");
        }}
      >
        <Button className="mt-3 grow" variant="outline">
          Deposit
        </Button>
      </DialogTrigger>
      <DialogTrigger
        asChild
        onClick={() => {
          form.setValue("asset", pool.base_asset_symbol);
          form.setValue("type", "withdraw");
        }}
      >
        <Button className="mt-3 grow" variant="outline">
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent className="w-100">
        <Tabs
          className="mt-4"
          value={transferType}
          onValueChange={(value) => {
            form.setValue("type", value as TransferType);
            form.clearErrors();
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>
          <TabsContent value={transferType}>
            <Form {...form}>
              <form className="mt-4" onSubmit={form.handleSubmit(onSubmit)}>
                <p>
                  Wallet Balance:{" "}
                  {walletBalance !== undefined
                    ? `${walletBalance} ${selectedAsset}`
                    : "--"}
                </p>
                <p>
                  Manager Balance:{" "}
                  {managerBalance !== undefined
                    ? `${managerBalance} ${selectedAsset}`
                    : "--"}
                </p>
                <div className="relative my-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <Input
                            className="rounded-sm py-6 text-left !text-4xl shadow-none [appearance:textfield] hover:border-gray-300 focus:!outline-2 focus:!outline-offset-[-1px] focus:!outline-gray-400 focus:!ring-0 md:text-4xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            type="number"
                            step="any"
                            {...field}
                            onBlur={() => {
                              field.onBlur();
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="asset"
                    render={({ field }) => (
                      <FormItem className="absolute right-2 top-[7px]">
                        <FormControl>
                          <Popover
                            open={assetSelectorOpen}
                            onOpenChange={setAssetSelectorOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                aria-expanded={assetSelectorOpen}
                                className="border-none"
                              >
                                <div className="flex items-center gap-2">
                                  <img
                                    src={
                                      coins.find(
                                        (coin) => coin.symbol === field.value,
                                      )?.metadata?.iconUrl || ""
                                    }
                                    alt={field.value}
                                    className="-ml-1 h-6 w-6 rounded-full"
                                  />
                                  <p>{field.value}</p>
                                  <ChevronDown
                                    strokeWidth={3}
                                    className="text-muted-foreground"
                                  />
                                </div>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end">
                              <Command>
                                <CommandInput placeholder="Choose a token..." />
                                <CommandList>
                                  <ScrollArea className="h-40">
                                    <CommandEmpty>No token found.</CommandEmpty>
                                    <CommandGroup>
                                      {coins.map((coin) => (
                                        <CommandItem
                                          key={coin.symbol}
                                          value={coin.symbol}
                                          onSelect={(currentValue) => {
                                            form.setValue(
                                              "asset",
                                              currentValue,
                                            );
                                            form.clearErrors();
                                            setAssetSelectorOpen(false);
                                          }}
                                        >
                                          <div className="flex items-center">
                                            <img
                                              src={coin.metadata?.iconUrl || ""}
                                              alt={coin.metadata?.name || ""}
                                              className="mr-2 h-12 w-12 rounded-full"
                                            />
                                            <div>
                                              <p className="font-semibold">
                                                {coin.metadata?.name}
                                              </p>
                                              <p className="text-muted-foreground">
                                                {coin.symbol}
                                              </p>
                                            </div>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </ScrollArea>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex w-full justify-end">
                  <Button type="submit">
                    {form.watch("type") === "deposit" ? "Deposit" : "Withdraw"}{" "}
                    {form.watch("asset")}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
