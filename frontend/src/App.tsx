import Pairs from "@/components/pairs";
import Summary from "@/components/summary";
import Header from "@/components/header";
import OrderBook from "./components/orderbook";
import urm from "@/assets/urm.png";

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
          <Header />
        </div>
      </div>

      <div className="flex h-screen w-screen bg-gray-100">
        <div className="flex w-5/6 flex-col bg-gray-200">
          <div className="flex h-2/3 bg-gray-300">
            <div className="flex w-3/4 bg-gray-400">chart</div>
            <div className="grow bg-gray-200">
              <OrderBook></OrderBook>
            </div>
          </div>
          <div className="flex h-1/3">user orders</div>
        </div>
        <div className="flex w-1/6">order creation</div>
      </div>
    </div>
  );
}
