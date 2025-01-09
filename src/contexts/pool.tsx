import { Pool } from "@/hooks/usePools";
import { createContext, useContext } from "react";

export const PoolContext = createContext<Pool | null>(null);

export const useCurrentPool = () => {
  const context = useContext(PoolContext);

  if (!context) {
    throw Error("useCurrentPool must be used within PoolProvider");
  }

  return context;
};
