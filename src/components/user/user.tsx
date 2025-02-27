import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OpenOrders from "./open-orders";
import OrderHistory from "./order-history";
import SettledBalance from "./settled-balance";

export default function User() {
  return (
    <div className="h-full">
      <Tabs defaultValue="open-orders">
        <TabsList className="w-full justify-start rounded-none bg-background px-4 py-6">
          <TabsTrigger
            className="data-[state=active]:shadow-none"
            value="open-orders"
          >
            Open Orders
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:shadow-none"
            value="trade-history"
          >
            Order History
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:shadow-none"
            value="settled-balance"
          >
            Settled Balance
          </TabsTrigger>
        </TabsList>
        <div className="mx-4 border-b"></div>
        <TabsContent value="open-orders" className="mt-0">
          <OpenOrders />
        </TabsContent>
        <TabsContent value="trade-history" className="mt-0">
          <OrderHistory />
        </TabsContent>
        <TabsContent value="settled-balance" className="mt-0">
          <SettledBalance />
        </TabsContent>
      </Tabs>
    </div>
  );
}
