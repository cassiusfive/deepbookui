"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountSummary from "./account-summary";
import OrderForm from "./order-form";

export type PositionType = "buy" | "sell";
export type OrderExecutionType = "limit" | "market";

export default function Trade() {
  const [positionType, setPositionType] = useState<PositionType>("buy");
  const [orderType, setOrderType] = useState<OrderExecutionType>("limit");

  return (
    <div className="flex h-full w-full min-w-fit shrink-0 flex-col">
      <AccountSummary />

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
