import { getRouteApi } from "@tanstack/react-router";

import Header from "@/components/header";
import Chart from "@/components/chart";
import Trade from "@/components/trade";
import MarketOverview from "@/components/market-overview";
import User from "@/components/user";
import { ContractProvider } from "@/contexts/contract";

const route = getRouteApi("/trade/$contractAddress")

export default function Terminal() {

  const { contractAddress } = route.useParams()
  
  // check if contract address exists, otherwise, route to sui-usd

  return (
    <ContractProvider contractAddress={contractAddress}>
      <div className="grid h-screen w-screen grid-rows-[80px_1fr] font-ubuntu-mono">
        <Header />
        <div className="grid w-screen grid-cols-[minmax(0,1fr)_270px_270px] grid-rows-[max(60vh,400px)_minmax(100px,1fr)]">
          <div className="col-start-1 col-end-1 h-full">
            <Chart />
          </div>
          <div className="col-start-2 col-end-2 h-full border-l">
            <MarketOverview />
          </div>
          <div className="col-start-3 col-end-3 row-start-1 row-end-3 border-l">
            <Trade />
          </div>
          <div className="col-start-1 col-end-3 h-full border-t">
            <User />
          </div>
        </div>
      </div>
    </ContractProvider>
  );
}
