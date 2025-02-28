import { useMemo, useEffect, useRef, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useCurrentPool } from "@/contexts/pool";
import { useDeepBook } from "@/contexts/deepbook";
import { useBalanceManager } from "@/contexts/balanceManager";
import { useManagerBalance } from "@/hooks/account/useBalances";
import { useOpenOrders } from "@/hooks/account/useOpenOrders";
import { useMidPrice } from "@/hooks/market/useMidPrice";
import { useQuantityOut } from "@/hooks/market/useQuantityOut";
import { useOrderbook } from "@/hooks/market/useOrderbook";
import { useToast } from "@/hooks/useToast";
import { PositionType, OrderExecutionType } from "./trade";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormProps = {
  positionType: PositionType;
  orderExecutionType: OrderExecutionType;
};

export default function OrderForm({ positionType, orderExecutionType }: FormProps) {
  const { toast } = useToast();
  const pool = useCurrentPool();
  const dbClient = useDeepBook();
  const { data: orderbook } = useOrderbook();
  const { data: priceData } = useMidPrice(pool.pool_name);
  const { balanceManagerKey, balanceManagerAddress } = useBalanceManager();
  const { data: managerBaseAssetBalance, refetch: refetchManagerBaseAssetBalance } = useManagerBalance(balanceManagerKey, pool.base_asset_symbol);
  const { data: managerQuoteAssetBalance, refetch: refetchManagerQuoteAssetBalance } = useManagerBalance(balanceManagerKey, pool.quote_asset_symbol);
  const { refetch: refetchOpenOrders } = useOpenOrders(pool.pool_name, balanceManagerKey);
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

  const balanceManagerBalance = {
    baseAsset: managerBaseAssetBalance ? managerBaseAssetBalance.balance : 0,
    quoteAsset: managerQuoteAssetBalance ? managerQuoteAssetBalance.balance : 0
  }

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
        data.amount * data.limitPrice > balanceManagerBalance.quoteAsset
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Insufficient ${pool.quote_asset_symbol} balance`,
          path: ["amount"],
        });
      }

      if (positionType == "sell" && data.amount > balanceManagerBalance.baseAsset) {
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

  function onSubmit(
    values: z.infer<typeof formSchema>,
    type: OrderExecutionType,
  ) {
    const tx = new Transaction();

    if (type === "limit") {
      dbClient?.deepBook.placeLimitOrder({
        poolKey: pool.pool_name,
        balanceManagerKey: balanceManagerKey,
        clientOrderId: Date.now().toString(), // client side order number
        price: values.limitPrice,
        quantity: values.amount,
        isBid: positionType === "buy",
      })(tx);
    } else {
      dbClient?.deepBook.placeMarketOrder({
        poolKey: pool.pool_name,
        balanceManagerKey: balanceManagerKey,
        clientOrderId: Date.now().toString(), // client side order number
        quantity: values.amount,
        isBid: positionType === "buy",
      })(tx);
    }

    signAndExecuteTransaction(
      {
        transaction: tx,
      },
      {
        onSuccess: async result => {
          if (result.effects?.status.status !== "success") {
            console.error("tx failed\n", result)
            return toast({
              title: `❌ Failed to place ${type} order`,
              description: "Check console for error details",
              duration: 3000
            });
          }

          // slight delay is needed for data to update before refetch
          await new Promise(resolve => setTimeout(resolve, 400)); 
          refetchOpenOrders();
          refetchManagerBaseAssetBalance();
          refetchManagerQuoteAssetBalance();

          console.log(`placed ${type} order\n`, result);
          toast({
            title: `✅ Placed ${type} order`,
            duration: 3000,
          });
        },
        onError: (error) => {
          console.error(`error placing ${type} order`, error);
          toast({
            title: `❌ Failed to place ${type} order`,
            description: "Check console for error details",
            duration: 3000,
          });
        },
      },
    );
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
        const newAmount = ((percent * balanceManagerBalance.quoteAsset) / limitPrice) * 0.99;
        const integerAmount = newAmount * 10 ** pool.base_asset_decimals;
        const rounded =
          Math.floor(integerAmount / pool.lot_size) * pool.lot_size;
        form.setValue("amount", rounded / 10 ** pool.base_asset_decimals, {
          shouldValidate: true,
        });
      } else {
        form.setValue("amount", percent * balanceManagerBalance.baseAsset, {
          shouldValidate: true,
        });
      }
    },
    [pool, limitPrice, positionType, balanceManagerBalance.baseAsset, balanceManagerBalance.quoteAsset, form],
  );

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            onSubmit(data, orderExecutionType),
          )}
          id="order"
          className="flex flex-col gap-3 space-y-8 px-3 py-3"
        >
          {orderExecutionType == "limit" && (
            <FormField
              disabled={!balanceManagerAddress}
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
                      disabled={!balanceManagerAddress}
                      className="h-8 rounded-sm hover:border-gray-300"
                      variant="outline"
                      type="button"
                      onClick={() => updateLimitPrice("mid")}
                    >
                      MID
                    </Button>
                    <Button
                      disabled={!balanceManagerAddress}
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
            disabled={!balanceManagerAddress}
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
                    disabled={!balanceManagerAddress}
                    className="h-8 w-1/3 rounded-sm hover:border-gray-300"
                    variant="outline"
                    type="button"
                    onClick={() => updateAmount(0.25)}
                  >
                    25%
                  </Button>
                  <Button
                    disabled={!balanceManagerAddress}
                    className="h-8 w-1/3 rounded-sm hover:border-gray-300"
                    variant="outline"
                    type="button"
                    onClick={() => updateAmount(0.5)}
                  >
                    50%
                  </Button>
                  <Button
                    disabled={!balanceManagerAddress}
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
            !balanceManagerAddress ||
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