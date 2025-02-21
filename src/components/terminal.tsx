import { getRouteApi, useNavigate } from "@tanstack/react-router";

import { usePools } from "@/hooks/usePools";
import { PoolContext } from "@/contexts/pool";
import Header from "@/components/header";
import Chart from "@/components/chart";
import Trade from "@/components/trade";
import MarketOverview from "@/components/market-overview";
import User from "@/components/user-orders";
import { Toaster } from "@/components/ui/toaster";
import { ManageBalanceModal } from "./manage-balance-modal";

const route = getRouteApi("/trade/$contractAddress");

export default function Terminal() {
  const navigate = useNavigate();
  const {
    data: poolsData,
    isLoading: poolsIsLoading,
    error: poolsError,
  } = usePools();
  const { contractAddress } = route.useParams();

  function getSelectedPool() {
    return poolsData?.find((pool) => pool.pool_id == contractAddress);
  }

  if (poolsError) {
    console.log(poolsError);
    return <div>{poolsError.message}</div>;
  }

  const selectedPool = getSelectedPool();

  if (poolsIsLoading && !selectedPool) {
    return <div>loading</div>;
  }

  if (!poolsData) return <div>loading</div>;

  // if invalid contract address, route to Deep-Sui pool
  if (!selectedPool) {
    navigate({
      to: "/trade/$contractAddress",
      params: {
        contractAddress:
          "0xb663828d6217467c8a1838a03793da896cbe745b150ebd57d82f814ca579fc22",
      },
    });
    return null;
  }

  return (
    <>
      <PoolContext.Provider value={selectedPool}>
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
              <ManageBalanceModal transferType="withdraw" />
              <Trade />
            </div>
            <div className="col-start-1 col-end-3 h-full border-t">
              <User />
            </div>
          </div>
        </div>
      </PoolContext.Provider>
      <Toaster />
    </>
  );
}
