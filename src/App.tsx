import Pairs from "@/components/pairs";
import Summary from "@/components/summary";
import OrderBook from "@/components/orderbook";
import TradeHistory from "@/components/trade-history";
import urm from "@/assets/urm.png";
import Account from "@/components/account";
import Chart from "@/components/chart";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function App() {
  return (
    <div className="flex h-screen w-screen flex-col font-ubuntu-mono">
      <div className="flex w-screen justify-between">
        <div className="flex items-center gap-4 p-4">
          <img src={urm} alt="logo" className="w-12" />
          <Pairs />
          <Summary />
        </div>
        <div className="flex items-center p-4">
          <Account />
        </div>
      </div>

      <div className="flex h-screen w-screen border">
        <div className="flex w-5/6 flex-col border-r">
          <div className="flex h-2/3">
            <div className="flex min-w-0 grow border-r">
              <Chart />
            </div>
            <div className="h-full min-w-fit">
              <Tabs
                defaultValue="orderbook"
                className="flex h-full w-full flex-col"
              >
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
            </div>
          </div>
          <div className="flex h-1/3 border-t">user orders</div>
        </div>
        <div className="flex w-1/6">order creation</div>
      </div>
    </div>
  );
}
