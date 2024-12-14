import { useState, useEffect } from "react";
import { useDeepBook } from '@/contexts/deepbook';

export function usePrice() {

  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const deepBook = useDeepBook();

  useEffect(() => {
    async function fetchPrice() {
      try {
        setIsLoading(true)
        setPrice(await deepBook!.midPrice("SUI_USDC"))
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch price"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 1000)
    return () => clearInterval(interval)
  }, [])
  
  return { price, isLoading, error };

  // const baseType = "0x2::sui::SUI"
  // const quoteType = "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC"
  // const poolId = await marketMaker.getPoolIdByAssets(baseType, quoteType)
  // console.log(poolId)
}
