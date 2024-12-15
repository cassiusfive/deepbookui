import OrderBook from "@/components/orderbook";
import TradeHistory from "@/components/trade-history";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MarketOverview() {
  return (
    <Tabs defaultValue="orderbook" className="flex h-full flex-col">
      <TabsList className="w-full justify-center rounded-none border-b bg-transparent p-0 py-6">
        <TabsTrigger
          value="orderbook"
          className="text-md min-w-min justify-start rounded-none shadow-none data-[state=active]:shadow-none"
        >
          Order book
        </TabsTrigger>
        <TabsTrigger
          value="trade-history"
          className="text-md min-w-min justify-start rounded-none shadow-none data-[state=active]:shadow-none"
        >
          Trade history
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value="orderbook"
        className="no-scrollbar m-0 w-full overflow-y-auto"
      >
        <OrderBook />
      </TabsContent>
      <TabsContent
        value="trade-history"
        className="no-scrollbar m-0 w-full overflow-y-auto"
      >
        <TradeHistory />
      </TabsContent>
    </Tabs>
  );
}
