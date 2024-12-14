import { createContext, useContext, ReactNode } from "react";
import DeepBookMarketMaker from "@/lib/deepbook";

const DeepBookContext = createContext<DeepBookMarketMaker | null>(null);

export function DeepBookProvider({
  children,
  client,
}: {
  children: ReactNode;
  client: DeepBookMarketMaker
}) {
  return (
    <DeepBookContext.Provider value={client}>
      {children}
    </DeepBookContext.Provider>
  );
}

export function useDeepBook() {
  const context = useContext(DeepBookContext);
  return context
}