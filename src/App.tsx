import Pairs from "@/components/pairs";
import Summary from "@/components/summary";
import urm from "@/assets/urm.png";
import Account from "@/components/account";
import Chart from "@/components/chart";
import Trade from "@/components/trade";
import MarketOverview from "@/components/market-overview";

export default function App() {
  return (
    <div className="grid h-screen w-screen grid-rows-[auto_1fr] font-ubuntu-mono">
      <div className="col-start-1 col-end-2 flex justify-between border-b">
        <div className="flex items-center gap-4 p-4">
          <img src={urm} alt="logo" className="w-12 shrink" />
          <Pairs />
          <Summary />
        </div>
        <div className="flex items-center p-4 shrink">
          <Account />
        </div>
      </div>
      
      <div className="grid h-full w-screen grid-cols-[minmax(0,1fr)_270px_270px] grid-rows-[2fr_1fr]">
        <div className="col-start-1 col-end-1">
          <Chart />
        </div>
        <div className="h-full col-start-2 col-end-2 border-l">
          <MarketOverview />
        </div>
        <div className="col-start-3 col-end-3 row-start-1 row-end-3 border-l">
          <Trade />
        </div>
        <div className="col-start-1 col-end-3 border-t">user orders</div>
      </div>
    </div>
  );
}
