import { Pool } from "@/hooks/usePools";
import { createContext, useContext, ReactNode } from "react";

export type PoolsContextType = Pool[]

const PoolsContext = createContext<PoolsContextType | null>(null);

export function PoolsProvider({
  children,
  poolsContext,
}: {
  children: ReactNode;
  poolsContext: PoolsContextType;
}) {
  return (
    <PoolsContext.Provider value={poolsContext}>
      {children}
    </PoolsContext.Provider>
  );
}

export function usePoolsContext() {
  const context = useContext(PoolsContext);
  return context;
}
