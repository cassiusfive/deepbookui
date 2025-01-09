"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useDeepBook } from "@/contexts/deepbook";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentPool } from "@/contexts/pool";

type PositionType = "buy" | "sell";
type OrderExecutionType = "limit" | "market";

type FormProps = {
  baseAsset: string;
  quoteAsset: string;
  baseAssetBalance: number;
  quoteAssetBalance: number;
  positionType: PositionType;
  orderExecutionType: OrderExecutionType;
};

function OrderForm({
  baseAsset,
  quoteAsset,
  baseAssetBalance,
  quoteAssetBalance,
  positionType,
  orderExecutionType,
}: FormProps) {
  const deepbook = useDeepBook();
  if (!deepbook) return;

  const formSchema = z
    .object({
      limitPrice: z.string().refine(
        (val) => {
          if (!val) return true;
          return parseFloat(val) > 0;
        },
        {
          message: "Invalid limit price",
        },
      ),
      amount: z.string().refine(
        (val) => {
          if (!val) return true;
          return parseFloat(val) > 0;
        },
        {
          message: "Invalid amount",
        },
      ),
    })
    .superRefine((data, ctx) => {
      if (
        positionType == "buy" &&
        parseFloat(data.amount) * (parseFloat(data.limitPrice) || 4.6) >
          quoteAssetBalance
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Insufficient ${quoteAsset} balance`,
          path: ["amount"],
        });
      }

      if (
        positionType == "sell" &&
        parseFloat(data.amount) > baseAssetBalance
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Insufficient ${baseAsset} balance`,
          path: ["amount"],
        });
      }
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      limitPrice: "",
      amount: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    (async function () {
      const price = await deepbook.midPrice(`${baseAsset}_${quoteAsset}`);
      form.setValue("limitPrice", price.toFixed(4));
    })();
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("SUBMIT", values);
  }

  async function updateLimitPrice(type: "bid" | "mid") {
    if (type == "mid") {
      const price = await deepbook!.midPrice(`${baseAsset}_${quoteAsset}`);
      form.setValue("limitPrice", price.toFixed(4));
    } else {
      // fetch highest bid
      form.setValue("limitPrice", "4.0000");
    }
  }

  function updateAmount(percent: 0.25 | 0.5 | 1) {
    if (positionType == "buy") {
      form.setValue(
        "amount",
        (percent * quoteAssetBalance).toFixed(4).toString(),
      );
    } else {
      form.setValue(
        "amount",
        (percent * baseAssetBalance).toFixed(4).toString(),
      );
    }
  }

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id="order"
          className="flex flex-col gap-3 space-y-8 px-3 py-3"
        >
          {orderExecutionType == "limit" && (
            <FormField
              control={form.control}
              name="limitPrice"
              render={({ field }) => (
                <FormItem className="relative m-0">
                  <FormLabel className="absolute left-2 top-2 text-xs">
                    LIMIT
                  </FormLabel>
                  <FormLabel className="absolute right-2 text-xs">
                    {quoteAsset}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="!mt-0 h-8 rounded-sm pr-10 text-right shadow-none [appearance:textfield] hover:border-gray-300 focus:!outline-2 focus:!outline-offset-[-1px] focus:!outline-gray-400 focus:!ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      type="number"
                      placeholder="0.0000"
                      {...field}
                    />
                  </FormControl>
                  <div className="!mt-1 flex gap-1">
                    <Button
                      className="h-8 rounded-sm hover:border-gray-300"
                      variant="outline"
                      type="button"
                      onClick={() => updateLimitPrice("mid")}
                    >
                      MID
                    </Button>
                    <Button
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
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="relative !m-0">
                <FormLabel className="absolute left-2 top-2 text-xs">
                  AMOUNT
                </FormLabel>
                <FormLabel className="absolute right-2 text-xs">
                  {baseAsset}
                </FormLabel>
                <FormControl>
                  <Input
                    className="!mt-0 h-8 rounded-sm pr-10 text-right shadow-none [appearance:textfield] hover:border-gray-300 focus:!outline-2 focus:!outline-offset-[-1px] focus:!outline-gray-400 focus:!ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    type="number"
                    placeholder="0.0000"
                    {...field}
                  />
                </FormControl>
                <div className="!mt-1 flex gap-1">
                  <Button
                    className="h-8 w-1/3 rounded-sm hover:border-gray-300"
                    variant="outline"
                    type="button"
                    onClick={() => updateAmount(0.25)}
                  >
                    25%
                  </Button>
                  <Button
                    className="h-8 w-1/3 rounded-sm hover:border-gray-300"
                    variant="outline"
                    type="button"
                    onClick={() => updateAmount(0.5)}
                  >
                    50%
                  </Button>
                  <Button
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
          <div className="flex justify-between text-gray-500">
            <div>SUBTOTAL</div>
            <div>--</div>
          </div>

          <div className="flex justify-between text-gray-500">
            <div>FEE</div>
            <div>--</div>
          </div>
          <div className="flex justify-between">
            <div>TOTAL</div>
            <div>
              {parseFloat(form.watch("limitPrice")) *
                parseFloat(form.watch("amount")) || "--"}
            </div>
          </div>
        </div>
        <Button
          className={`w-full ${positionType == "buy" ? "bg-[#26a69a]" : "bg-[#ef5350]"}`}
          type="submit"
          form="order"
          disabled={
            !form.formState.isValid ||
            !form.getValues("amount") ||
            (orderExecutionType === "limit" && !form.getValues("limitPrice"))
          }
        >
          {positionType == "buy" ? "Buy" : "Sell"} SUI
        </Button>
      </div>
    </div>
  );
}

export default function Trade() {
  const pool = useCurrentPool();

  const [positionType, setPositionType] = useState<PositionType>("buy");
  const [orderType, setOrderType] = useState<OrderExecutionType>("limit");

  var baseAssetBalance, quoteAssetBalance;

  const account = useCurrentAccount();

  const { data, isLoading, error } = useSuiClientQuery(
    "getAllBalances",
    { owner: account?.address ?? "" },
    { enabled: !!account },
  );

  if (!account) {
    baseAssetBalance = 0;
    quoteAssetBalance = 0;
  } else {
    if (isLoading) return <div></div>;
    if (error) console.log(error);
    if (!data) return <div>failed to fetch balance</div>;

    // normalize pool id
    const baseAsset = data.find((coin) => {
      const [address, ...rest] = pool.base_asset_id.split("::");
      const normalizedAddress = BigInt(address).toString(16);
      console.log(`0x${normalizedAddress}::${rest.join("::")}`);
      return `0x${normalizedAddress}::${rest.join("::")}` == coin.coinType;
    });

    const quoteAsset = data.find((coin) => {
      const [address, ...rest] = pool.quote_asset_id.split("::");
      const normalizedAddress = BigInt(address).toString(16);
      console.log(`0x${normalizedAddress}::${rest.join("::")}`);
      return `0x${normalizedAddress}::${rest.join("::")}` == coin.coinType;
    });

    baseAssetBalance = baseAsset
      ? parseFloat(baseAsset.totalBalance) / 1000000000
      : 0;
    quoteAssetBalance = quoteAsset
      ? parseFloat(quoteAsset.totalBalance) / 1000000000
      : 0;
  }

  console.log(
    "base asset balance",
    baseAssetBalance,
    "quote asset balance",
    quoteAssetBalance,
  );

  console.log(positionType, orderType);

  return (
    <div className="flex h-full w-full min-w-fit shrink-0 flex-col">
      <div className="border-b p-3">
        <h1 className="pb-2">Available to trade</h1>
        <div className="flex justify-between text-sm">
          <div>{pool.base_asset_symbol}</div>
          <div className="text-right">{baseAssetBalance.toFixed(4)}</div>
        </div>
        <div className="flex justify-between text-sm">
          <div>{pool.quote_asset_symbol}</div>
          <div className="text-right">${quoteAssetBalance.toFixed(4)}</div>
        </div>
      </div>

      <Tabs defaultValue={positionType} className="h-full">
        <TabsList className="h-12 w-full rounded-none p-0">
          <TabsTrigger
            className="h-full w-1/2 rounded-none bg-gray-100 text-gray-500 shadow-none data-[state=active]:bg-gray-200 data-[state=active]:text-[#26a69a] data-[state=active]:shadow-none"
            value="buy"
            onClick={() => setPositionType("buy")}
          >
            Buy
          </TabsTrigger>
          <TabsTrigger
            className="h-full w-1/2 rounded-none bg-gray-100 text-gray-500 shadow-none data-[state=active]:bg-gray-200 data-[state=active]:text-[#ef5350] data-[state=active]:shadow-none"
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
                className="w-1/4 text-xs shadow-none data-[state=active]:bg-gray-100 data-[state=active]:shadow-none"
                value="limit"
                onClick={() => setOrderType("limit")}
              >
                LIMIT
              </TabsTrigger>
              <TabsTrigger
                className="w-1/4 text-xs shadow-none data-[state=active]:bg-gray-100 data-[state=active]:shadow-none"
                value="market"
                onClick={() => setOrderType("market")}
              >
                MARKET
              </TabsTrigger>
            </TabsList>
            <TabsContent value="limit" className="m-0">
              <OrderForm
                baseAsset={pool.base_asset_symbol}
                quoteAsset={pool.quote_asset_symbol}
                baseAssetBalance={baseAssetBalance}
                quoteAssetBalance={quoteAssetBalance}
                positionType={positionType}
                orderExecutionType={orderType}
              />
            </TabsContent>
            <TabsContent value="market" className="m-0">
              <OrderForm
                baseAsset={pool.base_asset_symbol}
                quoteAsset={pool.quote_asset_symbol}
                baseAssetBalance={baseAssetBalance}
                quoteAssetBalance={quoteAssetBalance}
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
                className="w-1/4 text-xs shadow-none data-[state=active]:bg-gray-100 data-[state=active]:shadow-none"
                value="limit"
                onClick={() => setOrderType("limit")}
              >
                LIMIT
              </TabsTrigger>
              <TabsTrigger
                className="w-1/4 text-xs shadow-none data-[state=active]:bg-gray-100 data-[state=active]:shadow-none"
                value="market"
                onClick={() => setOrderType("market")}
              >
                MARKET
              </TabsTrigger>
            </TabsList>
            <TabsContent value="limit" className="m-0">
              <OrderForm
                baseAsset={pool.base_asset_name}
                quoteAsset={pool.quote_asset_symbol}
                baseAssetBalance={baseAssetBalance}
                quoteAssetBalance={quoteAssetBalance}
                positionType={positionType}
                orderExecutionType={orderType}
              />
            </TabsContent>
            <TabsContent value="market" className="m-0">
              <OrderForm
                baseAsset={pool.base_asset_symbol}
                quoteAsset={pool.quote_asset_symbol}
                baseAssetBalance={baseAssetBalance}
                quoteAssetBalance={quoteAssetBalance}
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
