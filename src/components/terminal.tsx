import { getRouteApi, useNavigate } from "@tanstack/react-router";

import { usePools } from "@/hooks/market/usePools";
import { PoolContext } from "@/contexts/pool";

import Header from "@/components/header/header";
import Chart from "@/components/chart";
import MarketData from "@/components/market-data/market-data";
import Trade from "@/components/trade/trade";
import User from "@/components/user/user";
import { Toaster } from "@/components/ui/toaster";

const route = getRouteApi("/trade/$contractAddress");

export default function Terminal() {
  const navigate = useNavigate();
  const { data: poolsData, isLoading: isPoolsLoading } = usePools();
  const { contractAddress } = route.useParams();

  const selectedPool = poolsData?.find(
    (pool) => pool.pool_id == contractAddress,
  );

  if (isPoolsLoading && !selectedPool) {
    return <div></div>;
  }

  if (!poolsData) return <div>loading</div>;

  // if invalid contract address, route to Deep-Sui pool
  if (!selectedPool) {
    navigate({
      to: "/trade/$contractAddress",
      params: {
        contractAddress:
          "0xf948981b806057580f91622417534f491da5f61aeaf33d0ed8e69fd5691c95ce",
      },
    });
    return null;
  }

  return (
    <>
      <PoolContext.Provider value={selectedPool}>
        <div className="flex h-screen w-screen flex-col font-ubuntu-mono">
          <div>
            <Header />
          </div>
          <div className="flex-1">
           <div className="grid grid-cols-1 grid-rows-[400px_400px_auto_auto] md:grid-cols-[minmax(0,1fr)_270px_270px] md:grid-rows-[max(60vh,400px)_minmax(100px,1fr)]">
             <div className="col-span-1 md:col-start-1 md:col-end-1">
               <Chart />
             </div>
             <div className="col-span-1 md:col-start-2 md:col-end-2 border-l">
               <MarketData />
             </div>
             <div className="col-span-1 md:col-start-3 md:col-end-3 md:row-start-1 md:row-end-3 border-l">
               <Trade />
             </div>
             <div className="overflow-y-auto col-span-1 md:col-start-1 md:col-end-3 border-t">
               <User />
              </div>
            </div>
          </div>
        </div>
      </PoolContext.Provider>
      <Toaster />
    </>
  );
}
