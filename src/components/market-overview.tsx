import OrderBook from "@/components/orderbook";
import TradeHistory from "@/components/trade-history";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MarketOverview() {
  return (
    <Tabs defaultValue="orderbook" className="flex h-full w-full flex-col">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="orderbook">Order book</TabsTrigger>
        <TabsTrigger value="trade-history">Trade history</TabsTrigger>
      </TabsList>
      <div className="flex h-[9999px] min-h-0 min-w-[260px]">
        <TabsContent value="orderbook" className="grow">
          <OrderBook />
        </TabsContent>
        <TabsContent value="trade-history" className="grow">
          <TradeHistory />
        </TabsContent>
      </div>
    </Tabs>
  );
}
