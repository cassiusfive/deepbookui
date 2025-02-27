import { createContext, useContext, ReactNode, useMemo } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { DeepBookClient } from "@mysten/deepbook-v3";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import {
  mainnetCoins,
  testnetCoins,
  mainnetPools,
  testnetPools,
} from "@/constants/deepbook";
import { useNetwork } from "@/contexts/network";
import { useCurrentManager } from "@/hooks/useCurrentManager";

const DeepBookContext = createContext<DeepBookClient | null>(null);

export function DeepBookProvider({ children }: { children: ReactNode }) {
  // get network and connected account
  const { network } = useNetwork();
  const account = useCurrentAccount();
  const { balanceManagerKey, balanceManagerAddress } = useCurrentManager();

  // reinitialize if user connects wallet or changes network
  const deepBookClient = useMemo(() => {
    return new DeepBookClient({
      client: new SuiClient({ url: getFullnodeUrl(network) }),
      env: network,
      address: account?.address || "",
      balanceManagers: balanceManagerAddress
        ? {
            [balanceManagerKey]: {
              address: balanceManagerAddress,
              tradeCap: undefined,
            },
          }
        : {},
      coins: network == "mainnet" ? mainnetCoins : testnetCoins,
      pools: network == "mainnet" ? mainnetPools : testnetPools,
    });
  }, [account?.address, network, balanceManagerAddress, balanceManagerKey]);

  return (
    <DeepBookContext.Provider value={deepBookClient}>
      {children}
    </DeepBookContext.Provider>
  );
}

export function useDeepBook() {
  const context = useContext(DeepBookContext);

  if (context === undefined)
    throw new Error("useDeepBook must be used within a DeepBookProvider");

  return context;
}
