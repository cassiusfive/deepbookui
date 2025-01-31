import { Pool } from "@/hooks/usePools";
import { createContext, useContext } from "react";

export const PoolContext = createContext<Pool | null>(null);

function roundToPlace(number: number, precision: number) {
  if (isNaN(number)) {
    throw new Error("Input must be a valid number");
  }

  // Handle precision of 0 separately
  if (precision === 0) {
    return Math.round(number).toString();
  }

  // For negative precision (left of decimal)
  if (precision < 0) {
    const scale = Math.pow(10, -precision);
    return (Math.round(number / scale) * scale).toString();
  }

  // For positive precision (right of decimal)
  const scale = Math.pow(10, precision);
  return (Math.round(number * scale) / scale).toString();
}

export function useCurrentPool() {
  const context = useContext(PoolContext);

  if (!context) {
    throw Error("useCurrentPool must be used within PoolProvider");
  }

  const quotePrecision =
    9 -
    Math.log10(context.tick_size) +
    context.quote_asset_decimals -
    context.base_asset_decimals;
  const basePrecision =
    context.base_asset_decimals - Math.log10(context.lot_size);
  const displayPrecision = Math.max(quotePrecision, basePrecision);

  const round = {
    quote: (value: number) => roundToPlace(value, quotePrecision),
    base: (value: number) => roundToPlace(value, basePrecision),
    display: (value: number) => roundToPlace(value, displayPrecision),
  };

  return { ...context, quotePrecision, basePrecision, displayPrecision, round };
}
