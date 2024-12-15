import OrderBook from "@/components/orderbook";
import TradeHistory from "@/components/trade-history";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MarketOverview() {
  return (
    <Tabs defaultValue="orderbook" className="h-full">
      <TabsList className="w-full rounded-none p-0 bg-transparent border-b py-6 justify-start">
        <TabsTrigger value="orderbook" className="text-md min-w-min justify-start rounded-none h-full shadow-none data-[state=active]:shadow-none">Order book</TabsTrigger>
        <TabsTrigger value="trade-history" className="text-md min-w-min justify-start rounded-none h-full shadow-none data-[state=active]:shadow-none">Trade history</TabsTrigger>
      </TabsList>
      <TabsContent value="orderbook" className="w-full m-0 overflow-y-auto max-h-[calc(100vh-240px-81px-49px)] no-scrollbar"> 
        <OrderBook />
      </TabsContent>
      <TabsContent value="trade-history" className="w-full m-0 overflow-y-auto max-h-[calc(100vh-240px-81px-49px)] no-scrollbar">
        <TradeHistory />
      </TabsContent>
    </Tabs>
  );
}
