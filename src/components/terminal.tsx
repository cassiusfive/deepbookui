import { getRouteApi, useNavigate } from "@tanstack/react-router";

import Header from "@/components/header";
import Chart from "@/components/chart";
import Trade from "@/components/trade";
import MarketOverview from "@/components/market-overview";
import User from "@/components/user";
import { ContractProvider, ContractContextType } from "@/contexts/contract";
import { usePools } from "@/hooks/usePools";

const route = getRouteApi("/trade/$contractAddress")

export default function Terminal() {
  const navigate = useNavigate()
  const { data, isLoading, error } = usePools()
  const { contractAddress } = route.useParams()
   
  // hardcode default pools to reduce load times
  const defaultPools = [
    {
      pool_id: "0xb663828d6217467c8a1838a03793da896cbe745b150ebd57d82f814ca579fc22",
      pool_name: "DEEP_SUI",
      base_asset_id: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
      base_asset_decimals: 6,
      base_asset_symbol: "DEEP",
      base_asset_name: "DeepBook Token",
      quote_asset_id: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
      quote_asset_decimals: 9,
      quote_asset_symbol: "SUI",
      quote_asset_name: "Sui",
      min_size: 100000000,
      lot_size: 10000000,
      tick_size: 10000000
    },
    {
      pool_id: "0xf948981b806057580f91622417534f491da5f61aeaf33d0ed8e69fd5691c95ce",
      pool_name: "DEEP_USDC",
      base_asset_id: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
      base_asset_decimals: 6,
      base_asset_symbol: "DEEP",
      base_asset_name: "DeepBook Token",
      quote_asset_id: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
      quote_asset_decimals: 6,
      quote_asset_symbol: "USDC",
      quote_asset_name: "USDC",
      min_size: 100000000,
      lot_size: 10000000,
      tick_size: 10000
    },
    {
      pool_id: "0xe05dafb5133bcffb8d59f4e12465dc0e9faeaa05e3e342a08fe135800e3e4407",
      pool_name: "SUI_USDC",
      base_asset_id: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
      base_asset_decimals: 9,
      base_asset_symbol: "SUI",
      base_asset_name: "Sui",
      quote_asset_id: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
      quote_asset_decimals: 6,
      quote_asset_symbol: "USDC",
      quote_asset_name: "USDC",
      min_size: 1000000000,
      lot_size: 100000000,
      tick_size: 1000
    }
  ]

  // fetch pool from harcoded pools or from api
  function getSelectedPool() {
    var pool = defaultPools.find(pool => pool.pool_id == contractAddress)
    if (pool) return pool
    return data?.find(pool => pool.pool_id == contractAddress)
  }
  
  if (error) {
    console.log(error)
    return <div>{error.message}</div>
  }

  const selectedPool = getSelectedPool()

  if (isLoading && !selectedPool) {
    return <div>loading</div>
  }

  // if invalid contract address, route to Deep-Sui pool
  if (!selectedPool) {
    navigate({ 
      to: "/trade/$contractAddress",
      params: {
        contractAddress: "0xb663828d6217467c8a1838a03793da896cbe745b150ebd57d82f814ca579fc22"
      }
    })
    return null
  }

  const contractContext: ContractContextType = {
    contractAddress,
    poolKey: selectedPool.pool_name,
    baseAsset: {
      baseAssetId: selectedPool.base_asset_id,
      baseAssetSymbol: selectedPool.base_asset_symbol
    },
    quoteAsset: {
      quoteAssetId: selectedPool.quote_asset_id,
      quoteAssetSymbol: selectedPool.quote_asset_symbol
    }
  }

  console.log(contractContext)
  
  return (
    <ContractProvider contractContext={contractContext}>
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
