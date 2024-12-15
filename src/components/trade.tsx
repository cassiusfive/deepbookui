"use client"

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


type PositionType = "buy" | "sell"
type OrderExecutionType = "limit" | "market"

type FormProps = {
  baseAssetBalance: number
  quoteAssetBalance: number
  positionType: PositionType
  orderExecutionType: OrderExecutionType
}

function OrderForm({ baseAssetBalance, quoteAssetBalance, positionType, orderExecutionType }: FormProps) {
  const deepbook = useDeepBook()
  if (!deepbook) return

  const formSchema = z.object({
    limitPrice: z.string().refine(val => {
      if (!val) return true;
      return parseInt(val) > 0
    }, {
      message: "Invalid limit price"
    }),
    amount: z.string().refine(val => {
      if (!val) return true;
      return parseInt(val) > 0
    }, {
      message: "Invalid amount"
    }),
  }).superRefine((data, ctx) => {
    if (positionType == "buy" && parseInt(data.amount) * (parseInt(data.limitPrice) || 4.6) > quoteAssetBalance) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Insufficient USDC balance",
        path: ["amount"],
      });
    }

    if (positionType == "sell" && parseInt(data.amount) > baseAssetBalance) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Insufficient SUI balance",
        path: ["amount"],
      });
    }
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      limitPrice: "",
      amount: ""
    },
    mode: "onChange"
  })

  useEffect(() => {
    (async function() {
      const price = await deepbook.midPrice("SUI_USDC")
      form.setValue("limitPrice", price.toFixed(4))
    })();
  }, [])

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("SUBMIT", values)
  }

  async function updateLimitPrice(type: "bid" | "mid") {
    if (type == "mid") {
      const price = await deepbook!.midPrice("SUI_USDC")
      form.setValue("limitPrice", price.toFixed(4))
    } else {
      // fetch highest bid
      form.setValue("limitPrice", "4.0000")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="border-b">
        {orderExecutionType == "limit" && (
          <FormField
            control={form.control}
            name="limitPrice"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel className="absolute left-2 top-2.5 text-xs">LIMIT</FormLabel>
                <FormLabel className="absolute right-2 top-[2px] text-xs">USDC</FormLabel>
                <FormControl>
                  <Input 
                    className="text-right pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    type="number" 
                    placeholder="0.0000" 
                    {...field} 
                  />
                </FormControl>
                <div className="flex">
                  <Button variant="outline" type="button" onClick={() => updateLimitPrice("mid")}>MID</Button>
                  <Button variant="outline" type="button" onClick={() => updateLimitPrice("bid")}>BID</Button>
                </div>
                
                <FormMessage className="text-xs"/>
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel className="absolute left-2 top-2.5 text-xs">AMOUNT</FormLabel>
              <FormLabel className="absolute right-2 top-[2px] text-xs">SUI</FormLabel>
              <FormControl>
                <Input 
                  className="text-right pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  type="number" 
                  placeholder="0.0000" 
                  {...field} 
                />
              </FormControl>
              <FormMessage className="text-xs"/>
            </FormItem>
          )}
        />
        </div>
        <div className="">
          <Button 
            className={`w-full ${positionType == "buy" ? "bg-[#26a69a]" : "bg-[#ef5350]"}`} 
            type="submit"
            disabled={
              !form.formState.isValid || 
              !form.getValues('amount') ||
              (orderExecutionType === 'limit' && !form.getValues('limitPrice'))
            }
          >
            {positionType == "buy" ? "Buy" : "Sell"} SUI
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default function Trade() {
  const [positionType, setPositionType] = useState<PositionType>("buy");
  const [orderType, setOrderType] = useState<OrderExecutionType>("limit");

  const account = useCurrentAccount()

  const { data, isLoading, error } = useSuiClientQuery("getAllBalances", 
    { owner: account?.address ?? "" },
    { enabled: !!account }
  );

  const sui = data?.find(coin => coin.coinType == "0x2::sui::SUI")
  const usdc = data?.find(coin => coin.coinType == "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC")

  const suiBalance = sui ? parseInt(sui.totalBalance) / 1000000000 : 0
  const usdcBalance = usdc ? parseInt(usdc.totalBalance) / 1000000000 : 0

  console.log("sui balance", suiBalance, "usdc balance", usdcBalance)

  return (
    <div className="w-full flex flex-col min-w-fit shrink-0">
      <div className="p-3 border-b">
        <h1>Available to trade</h1>
        <div className="flex justify-between">
          <div>SUI</div>
          <div className="text-right">{suiBalance}</div>
        </div>
        <div className="flex justify-between">
          <div>USDC</div>
          <div className="text-right">${usdcBalance}</div>
        </div>
      </div>

      <Tabs defaultValue="buy">
        <TabsList className="w-full rounded-none p-0">
          <TabsTrigger className="w-1/2 rounded-none h-full shadow-none data-[state=active]:shadow-none text-gray-500 data-[state=active]:text-[#26a69a] bg-gray-100 data-[state=active]:bg-gray-200" value="buy" onClick={() => setPositionType("buy")}>Buy</TabsTrigger>
          <TabsTrigger className="w-1/2 rounded-none h-full shadow-none data-[state=active]:shadow-none text-gray-500 data-[state=active]:text-[#ef5350] bg-gray-100 data-[state=active]:bg-gray-200" value="sell" onClick={() => setPositionType("sell")}>Sell</TabsTrigger>
        </TabsList>
        <TabsContent value="buy">
          <div className="flex gap-12">
            <Tabs defaultValue="limit" className="w-full p-3">
              <TabsList className="w-full bg-transparent justify-between">
                <TabsTrigger className="w-1/4 text-xs" value="limit" onClick={() => setOrderType("limit")}>LIMIT</TabsTrigger>
                <TabsTrigger className="w-1/4 text-xs" value="market" onClick={() => setOrderType("market")}>MARKET</TabsTrigger>
              </TabsList>
              <TabsContent value="limit">
                <OrderForm baseAssetBalance={suiBalance} quoteAssetBalance={usdcBalance} positionType={positionType} orderExecutionType={orderType} />
              </TabsContent>
              <TabsContent value="market">
                <OrderForm baseAssetBalance={suiBalance} quoteAssetBalance={usdcBalance} positionType={positionType} orderExecutionType={orderType} />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
        <TabsContent value="sell">
          <div className="flex gap-12">
            <Tabs defaultValue="limit" className="w-full p-3">
              <TabsList className="w-full bg-transparent justify-between">
                <TabsTrigger className="w-1/4 text-xs" value="limit" onClick={() => setOrderType("limit")}>LIMIT</TabsTrigger>
                <TabsTrigger className="w-1/4 text-xs" value="market" onClick={() => setOrderType("market")}>MARKET</TabsTrigger>
              </TabsList>
              <TabsContent value="limit">
                <OrderForm baseAssetBalance={suiBalance} quoteAssetBalance={usdcBalance} positionType={positionType} orderExecutionType={orderType} />
              </TabsContent>
              <TabsContent value="market">
                <OrderForm baseAssetBalance={suiBalance} quoteAssetBalance={usdcBalance} positionType={positionType} orderExecutionType={orderType} />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}