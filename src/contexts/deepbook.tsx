import { createContext, useContext, ReactNode } from "react";
import DeepBookMarketMaker from "@/lib/deepbook";
import {
  useCurrentAccount,
  useSuiClient,
  useSuiClientContext,
} from "@mysten/dapp-kit";

const DeepBookContext = createContext<DeepBookMarketMaker | null>(null);

export function DeepBookProvider({ children }: { children: ReactNode }) {
  const account = useCurrentAccount();
  const ctx = useSuiClientContext();
  const suiClient = useSuiClient();

  const value = new DeepBookMarketMaker(
    account?.address || "",
    ctx.network as "testnet" | "mainnet",
    suiClient,
  );

  return (
    <DeepBookContext.Provider value={value}>
      {children}
    </DeepBookContext.Provider>
  );
}

export function useDeepBook() {
  const context = useContext(DeepBookContext);
  return context;
}
