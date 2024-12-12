import Pairs from "@/components/pairs";
import Summary from "@/components/summary";
import OrderBook from "@/components/orderbook";
import urm from "@/assets/urm.png";
import Account from "@/components/account";
import Chart from "@/components/chart";

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

      <div className="flex w-screen h-screen border">
        <div className="flex flex-col w-5/6 border-r">
          <div className="flex h-2/3">
            <div className="flex w-3/4 border-r">
              <Chart />
            </div>
            <div className="grow">
              <OrderBook />
            </div>
          </div>
          <div className="flex h-1/3 border-t">user orders</div>
        </div>
        <div className="flex w-1/6">order creation</div>
      </div>
    </div>
  );
}
