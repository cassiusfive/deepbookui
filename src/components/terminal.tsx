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
    return <div>loading</div>;
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
        {/* Full-height container */}
        <div className="flex h-screen w-screen flex-col font-ubuntu-mono">
          {/* Header row (always at the top) */}
          <div className="h-[80px] shrink-0">
            <Header />
          </div>

          {/* Main content area (flex-1 so it fills remaining space) */}
          <div className="flex-1">
            {/* Mobile-first: single-column layout */}
            {/* On md screens: 3-column grid as before */}
            <div className="grid h-full w-full grid-cols-1 grid-rows-[400px_400px_auto_auto] md:grid-cols-[minmax(0,1fr)_270px_270px] md:grid-rows-[max(60vh,400px)_minmax(100px,1fr)]">
              {/* Chart */}
              <div className="col-span-1 border-b md:col-start-1 md:col-end-1 md:row-start-1 md:row-end-1 md:border-b-0">
                <Chart />
              </div>

              {/* Market Data */}
              <div className="col-span-1 border-b md:col-start-2 md:col-end-2 md:row-start-1 md:row-end-1 md:border-b-0 md:border-l">
                <MarketData />
              </div>

              {/* Trade */}
              <div className="col-span-1 border-b md:col-start-3 md:col-end-3 md:row-start-1 md:row-end-3 md:border-b-0 md:border-l">
                <Trade />
              </div>

              {/* User (spans the full width on md) */}
              <div className="col-span-1 w-full overflow-y-auto border-t md:col-start-1 md:col-end-4 md:border-t">
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
