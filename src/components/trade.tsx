"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeepBook } from "@/contexts/deepbook";
import { useCurrentPool } from "@/contexts/pool";
import { useMidPrice } from "@/hooks/useMidPrice";
import { useQuantityOut } from "@/hooks/useQuantityOut";
import { useOrderbook } from "@/hooks/useOrderbook";
import {
  useBalancesFromCurrentPool,
  useManagerBalance,
} from "@/hooks/useBalances";
import { Transaction } from "@mysten/sui/transactions";
import { BALANCE_MANAGER_KEY } from "@/constants/deepbook";
import { useToast } from "@/hooks/use-toast";

type PositionType = "buy" | "sell";
type OrderExecutionType = "limit" | "market";

type FormProps = {
  positionType: PositionType;
  orderExecutionType: OrderExecutionType;
};

function OrderForm({ positionType, orderExecutionType }: FormProps) {
  const { toast } = useToast()
  const account = useCurrentAccount();
  const dbClient = useDeepBook();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  if (!dbClient || !account) return

  const { baseAssetBalance, quoteAssetBalance } = useBalancesFromCurrentPool();

  const { data: orderbook } = useOrderbook();
  const pool = useCurrentPool();
  const { data: priceData } = useMidPrice(pool.pool_name);

  const bestBid = useMemo(() => orderbook?.bids[0].price, [orderbook]);
  const midPrice = useMemo(() => priceData, [priceData]);

  const formSchema = z
    .object({
      limitPrice: z.coerce.number().refine(
        (val) => {
          if (!val) return true;
          return val > 0;
        },
        {
          message: "Invalid limit price",
        },
      ),
      amount: z.coerce.number().refine(
        (val) => {
          if (!val) return true;
          return val > 0;
        },
        {
          message: "Invalid amount",
        },
      ),
    })
    .superRefine((data, ctx) => {
      if (
        positionType == "buy" &&
        data.amount * data.limitPrice > quoteAssetBalance
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Insufficient ${pool.quote_asset_symbol} balance`,
          path: ["amount"],
        });
      }

      if (positionType == "sell" && data.amount > baseAssetBalance) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Insufficient ${pool.base_asset_symbol} balance`,
          path: ["amount"],
        });
      }
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      limitPrice: undefined,
      amount: undefined,
    },
    mode: "onChange",
  });

  const limitPrice = form.watch("limitPrice");
  const amount = form.watch("amount");
  const total = limitPrice * amount;
  const { data: quantityOut } = useQuantityOut(0, total);

  function onSubmit(values: z.infer<typeof formSchema>, type: OrderExecutionType) {
    const tx = new Transaction()

    if (type === "limit") {
      dbClient?.deepBook.placeLimitOrder({
        poolKey: pool.pool_name,
        balanceManagerKey: BALANCE_MANAGER_KEY,
        clientOrderId: Date.now().toString(), // client side order number
        price: values.limitPrice,
        quantity: values.amount,
        isBid: positionType === "buy"
      })(tx)
    } else {
      dbClient?.deepBook.placeMarketOrder({
        poolKey: pool.pool_name,
        balanceManagerKey: BALANCE_MANAGER_KEY,
        clientOrderId: Date.now().toString(), // client side order number
        quantity: values.amount,
        isBid: positionType === "buy"
      })(tx)
    }

    signAndExecuteTransaction({
      transaction: tx
    }, {
      onSuccess: result => {
        console.log(`placed ${type} order`, result);
        toast({
          title: `✅ Placed ${type} order`,
          duration: 3000
        })
      },
      onError: error => {
        console.error(`error placing ${type} order`, error)
        toast({
          title: `❌ Failed to place ${type} order`,
          description: error.message,
          duration: 3000
        })
      }
    })
  }

  const updateLimitPrice = useCallback(
    (type: "bid" | "mid") => {
      if (type == "mid" && midPrice) {
        form.setValue("limitPrice", Number(pool.round.quote(midPrice)));
      } else if (bestBid) {
        form.setValue("limitPrice", Number(pool.round.quote(bestBid)));
      }
    },
    [midPrice, bestBid, form, pool.round],
  );

  const limitPriceFilled = useRef(false);
  useEffect(() => {
    if (!limitPriceFilled.current && midPrice) {
      updateLimitPrice("mid");
      limitPriceFilled.current = true;
    }
  }, [updateLimitPrice, midPrice]);

  const updateAmount = useCallback(
    (percent: 0.25 | 0.5 | 1) => {
      if (positionType == "buy") {
        const newAmount = ((percent * quoteAssetBalance) / limitPrice) * 0.99;
        const integerAmount = newAmount * 10 ** pool.base_asset_decimals;
        const rounded =
          Math.floor(integerAmount / pool.lot_size) * pool.lot_size;
        form.setValue("amount", rounded / 10 ** pool.base_asset_decimals, {
          shouldValidate: true,
        });
      } else {
        form.setValue("amount", percent * baseAssetBalance, {
          shouldValidate: true,
        });
      }
    },
    [pool, limitPrice, positionType, baseAssetBalance, quoteAssetBalance, form],
  );

  const balanceManager = localStorage.getItem(BALANCE_MANAGER_KEY)

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(data => onSubmit(data, orderExecutionType))}
          id="order"
          className="flex flex-col gap-3 space-y-8 px-3 py-3"
        >
          {orderExecutionType == "limit" && (
            <FormField
              disabled={!balanceManager}
              control={form.control}
              name="limitPrice"
              render={({ field }) => (
                <FormItem className="relative m-0">
                  <FormLabel className="absolute left-2 top-2 text-xs">
                    LIMIT
                  </FormLabel>
                  <FormLabel className="absolute right-2 text-xs">
                    {pool.quote_asset_symbol}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="!mt-0 h-8 rounded-sm pr-10 text-right shadow-none [appearance:textfield] hover:border-gray-300 focus:!outline-2 focus:!outline-offset-[-1px] focus:!outline-gray-400 focus:!ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      type="number"
                      placeholder="0.0000"
                      step="any"
                      {...field}
                      onBlur={() => {
                        field.onBlur();
                        form.setValue(
                          field.name,
                          Number(pool.round.quote(field.value)),
                        );
                      }}
                    />
                  </FormControl>
                  <div className="!mt-1 flex gap-1">
                    <Button
                      disabled={!balanceManager}
                      className="h-8 rounded-sm hover:border-gray-300"
                      variant="outline"
                      type="button"
                      onClick={() => updateLimitPrice("mid")}
                    >
                      MID
                    </Button>
                    <Button
                      disabled={!balanceManager}
                      className="h-8 rounded-sm hover:border-gray-300"
                      variant="outline"
                      type="button"
                      onClick={() => updateLimitPrice("bid")}
                    >
                      BID
                    </Button>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          )}
          <FormField
            disabled={!balanceManager}
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="relative !m-0">
                <FormLabel className="absolute left-2 top-2 text-xs">
                  AMOUNT
                </FormLabel>
                <FormLabel className="absolute right-2 text-xs">
                  {pool.base_asset_symbol}
                </FormLabel>
                <FormControl>
                  <Input
                    className="!mt-0 h-8 rounded-sm pr-10 text-right shadow-none [appearance:textfield] hover:border-gray-300 focus:!outline-2 focus:!outline-offset-[-1px] focus:!outline-gray-400 focus:!ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    type="number"
                    placeholder="0.0000"
                    step="any"
                    {...field}
                    onBlur={() => {
                      field.onBlur();
                      form.setValue(
                        field.name,
                        Number(pool.round.base(field.value)),
                      );
                    }}
                  />
                </FormControl>
                <div className="!mt-1 flex gap-1">
                  <Button
                    disabled={!balanceManager}
                    className="h-8 w-1/3 rounded-sm hover:border-gray-300"
                    variant="outline"
                    type="button"
                    onClick={() => updateAmount(0.25)}
                  >
                    25%
                  </Button>
                  <Button
                    disabled={!balanceManager}
                    className="h-8 w-1/3 rounded-sm hover:border-gray-300"
                    variant="outline"
                    type="button"
                    onClick={() => updateAmount(0.5)}
                  >
                    50%
                  </Button>
                  <Button
                    disabled={!balanceManager}
                    className="h-8 w-1/3 rounded-sm hover:border-gray-300"
                    variant="outline"
                    type="button"
                    onClick={() => updateAmount(1.0)}
                  >
                    MAX
                  </Button>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div className="flex h-full flex-col justify-between gap-3 border-t p-3 text-xs">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-muted-foreground">
            <div>TOTAL</div>
            <div>
              {total
                ? `${pool.round.quote(total)} ${pool.quote_asset_symbol}`
                : "--"}
            </div>
          </div>

          <div className="flex justify-between text-muted-foreground">
            <div>FEE</div>
            <div>
              {quantityOut ? `${quantityOut?.deepRequired} DEEP` : "--"}
            </div>
          </div>
        </div>
        <Button
          className={`w-full ${positionType == "buy" ? "bg-[#26a69a]" : "bg-[#ef5350]"}`}
          type="submit"
          form="order"
          disabled={
            !balanceManager ||
            !form.formState.isValid ||
            !form.getValues("amount") ||
            (orderExecutionType === "limit" && !form.getValues("limitPrice"))
          }
        >
          {positionType == "buy" ? "Buy" : "Sell"} {pool.base_asset_symbol}
        </Button>
      </div>
    </div>
  );
}

export default function Trade() {
  const { toast } = useToast()
  const pool = useCurrentPool();
  const dbClient = useDeepBook();
  const account = useCurrentAccount();
  const { baseAssetBalance, quoteAssetBalance } = useBalancesFromCurrentPool();
  const { data: baseAssetManagerBalance, refetch: refetchBaseBalance } = useManagerBalance(BALANCE_MANAGER_KEY, pool.base_asset_symbol);
  const { data: quoteAssetManagerBalance, refetch: refetchQuoteBalance } = useManagerBalance(BALANCE_MANAGER_KEY, pool.quote_asset_symbol);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({ 
    // @ts-expect-error
    execute: async ({ bytes, signature }) => await dbClient?.client.executeTransactionBlock({
      transactionBlock: bytes,
      signature,
      options: {
        showRawEffects: true,
        showEffects: true,
        showObjectChanges: true,
      },
    }),
  });

  const [positionType, setPositionType] = useState<PositionType>("buy");
  const [orderType, setOrderType] = useState<OrderExecutionType>("limit");

  const balanceManager = localStorage.getItem(BALANCE_MANAGER_KEY)

  const handleCreateBalanceManager = () => {
    const tx = new Transaction()
    dbClient?.balanceManager.createAndShareBalanceManager()(tx)

    signAndExecuteTransaction({
      transaction: tx
    }, {
      onSuccess: result => {
        console.log("created balance manager", result);
        
        // @ts-expect-error https://docs.sui.io/standards/deepbookv3-sdk
        const managerAddress: string = result.objectChanges?.find((change) => {
          return (
            change.type === "created" &&
            change.objectType.includes("BalanceManager")
          );
        })?.["objectId"];
        localStorage.setItem(BALANCE_MANAGER_KEY, managerAddress)

        toast({
          title: "✅ Created balance manager",
          description: managerAddress,
          duration: 3000
        })
      },
      onError: error => {
        console.error("error depositing funds", error)
        toast({
          title: "❌ Failed to create Balance Manager",
          description: error.message,
          duration: 3000
        })
      }
    })
  }

  const handleDeposit = () => {
    const tx = new Transaction()

    dbClient?.balanceManager.depositIntoManager("MANAGER_1", pool.base_asset_symbol, 0)(tx)
    dbClient?.balanceManager.depositIntoManager("MANAGER_1", pool.quote_asset_symbol, 1)(tx)

    signAndExecuteTransaction({
      transaction: tx
    }, {
      onSuccess: async result => {
        console.log("deposited funds", result);

        if (result.effects.status.status !== "success")  {
          console.error("tx failed", result)
          return toast({
            title: "❌ Failed to deposit funds",
            description: result.effects.status.error,
            duration: 3000
          });
        }

        // wait for tx to settle
        await new Promise(resolve => setTimeout(resolve, 200));
        refetchBaseBalance();
        refetchQuoteBalance();

        toast({
          title: "✅ Deposited funds",
          description: result.digest,
          duration: 3000
        });
      },
      onError: error => {
        console.error("error depositing funds", error)
        toast({
          title: "❌ Failed to deposit funds",
          description: error.message,
          duration: 3000
        });
      }
    })
  }

  const handleWithdraw = () => {
    const tx = new Transaction()

    dbClient?.balanceManager.withdrawAllFromManager("MANAGER_1", pool.base_asset_symbol, account!.address)(tx);
    dbClient?.balanceManager.withdrawAllFromManager("MANAGER_1", pool.quote_asset_symbol, account!.address)(tx);

    signAndExecuteTransaction({
      transaction: tx
    }, {
      onSuccess: async result => {
        console.log("withdrew funds", result);

        // wait for tx to settle
        await new Promise(resolve => setTimeout(resolve, 200));
        refetchBaseBalance();
        refetchQuoteBalance();

        toast({
          title: "✅ Withdrew funds",
          description: result.digest,
          duration: 3000
        });
      },
      onError: error => {
        console.error("error withdrawing funds", error);
        toast({
          title: "❌ Failed to withdraw funds",
          description: error.message,
          duration: 3000
        });
      }
    });
  }

  return (
    <div className="flex h-full w-full min-w-fit shrink-0 flex-col">
      <div className="border-b p-3">
        <h1 className="pb-2">Available to trade</h1>
        <div className="flex justify-between text-sm">
          <div>{pool.base_asset_symbol}</div>
          <div className="text-right">
            {pool.round.display(baseAssetBalance)}
          </div>
        </div>
        <div className="flex justify-between text-sm pb-8">
          <div>{pool.quote_asset_symbol}</div>
          <div className="text-right">
            {pool.round.display(quoteAssetBalance)}
          </div>
        </div>
        {!account ? (
          <div>Connect your wallet</div>
        ) : !balanceManager ? (
          <Button variant="outline" className="w-full" onClick={handleCreateBalanceManager}>Create a balance manager</Button>
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
              <Button className="mt-3 grow" variant="outline" onClick={handleDeposit}>
                Deposit
              </Button>
              <Button className="mt-3 grow" variant="outline" onClick={handleWithdraw}>
                Withdraw
              </Button>
            </div>
          </>
        )}
      </div>

      <Tabs defaultValue={positionType} className="h-full">
        <TabsList className="h-12 w-full rounded-none p-0">
          <TabsTrigger
            className="h-full w-1/2 rounded-none bg-secondary text-muted-foreground shadow-none data-[state=active]:border-b data-[state=active]:bg-background data-[state=active]:text-[#26a69a] data-[state=active]:shadow-none"
            value="buy"
            onClick={() => setPositionType("buy")}
          >
            Buy
          </TabsTrigger>
          <TabsTrigger
            className="h-full w-1/2 rounded-none bg-secondary text-muted-foreground shadow-none data-[state=active]:border-b data-[state=active]:bg-background data-[state=active]:text-[#ef5350] data-[state=active]:shadow-none"
            value="sell"
            onClick={() => setPositionType("sell")}
          >
            Sell
          </TabsTrigger>
        </TabsList>
        <TabsContent value="buy" className="m-0">
          <Tabs defaultValue={orderType} className="w-full py-3">
            <TabsList className="w-full justify-start gap-3 bg-transparent p-0 pl-3">
              <TabsTrigger
                className="w-1/4 text-xs shadow-none data-[state=active]:bg-secondary data-[state=active]:shadow-none"
                value="limit"
                onClick={() => setOrderType("limit")}
              >
                LIMIT
              </TabsTrigger>
              <TabsTrigger
                className="w-1/4 text-xs shadow-none data-[state=active]:bg-secondary data-[state=active]:shadow-none"
                value="market"
                onClick={() => setOrderType("market")}
              >
                MARKET
              </TabsTrigger>
            </TabsList>
            <TabsContent value="limit" className="m-0">
              <OrderForm
                positionType={positionType}
                orderExecutionType={orderType}
              />
            </TabsContent>
            <TabsContent value="market" className="m-0">
              <OrderForm
                positionType={positionType}
                orderExecutionType={orderType}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
        <TabsContent value="sell" className="m-0">
          <Tabs defaultValue={orderType} className="w-full py-3">
            <TabsList className="w-full justify-start gap-3 bg-transparent p-0 pl-3">
              <TabsTrigger
                className="w-1/4 text-xs shadow-none data-[state=active]:bg-secondary data-[state=active]:shadow-none"
                value="limit"
                onClick={() => setOrderType("limit")}
              >
                LIMIT
              </TabsTrigger>
              <TabsTrigger
                className="w-1/4 text-xs shadow-none data-[state=active]:bg-secondary data-[state=active]:shadow-none"
                value="market"
                onClick={() => setOrderType("market")}
              >
                MARKET
              </TabsTrigger>
            </TabsList>
            <TabsContent value="limit" className="m-0">
              <OrderForm
                positionType={positionType}
                orderExecutionType={orderType}
              />
            </TabsContent>
            <TabsContent value="market" className="m-0">
              <OrderForm
                positionType={positionType}
                orderExecutionType={orderType}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
