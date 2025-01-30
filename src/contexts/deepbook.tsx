import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useMemo
} from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { DeepBookClient } from "@mysten/deepbook-v3";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { BALANCE_MANAGER_KEY, mainnetCoins, testnetCoins, mainnetPools, testnetPools } from "@/constants/deepbook";
import { useNetwork } from "@/contexts/network";

export const DeepBookContext = createContext<DeepBookClient | null>(null);

export function DeepBookProvider({ children }: { children: ReactNode }) {

  // get network and connected account
  const { network } = useNetwork()
  const account = useCurrentAccount()

  // fetch balance manager from local storage
  const [balanceManagerAddress, setBalanceManagerAddress] = useState(() =>
    localStorage.getItem(BALANCE_MANAGER_KEY),
  );

  // reinitialize if user connects wallet or changes network
  const deepBookClient = useMemo(() => {
    return new DeepBookClient({
      client: new SuiClient({ url: getFullnodeUrl(network) }),
      env: network,
      address: account?.address || "",
      balanceManagers: balanceManagerAddress ? {["BALANCE_MANAGER_KEY"]: {
        address: balanceManagerAddress,
        tradeCap: undefined
      }} : {},
      coins: network == "mainnet" ? mainnetCoins : testnetCoins,
      pools: network == "mainnet" ? mainnetPools : testnetPools
    })
  }, [account?.address, network, balanceManagerAddress]);


  // watch for updates to balance manager
  // ie balance manager is created while submitting tx
  useEffect(() => {
    const handleStorageChange = () => {
      setBalanceManagerAddress(
        localStorage.getItem(BALANCE_MANAGER_KEY),
      );
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <DeepBookContext.Provider value={deepBookClient}>
      {children}
    </DeepBookContext.Provider>
  );
}

export function useDeepBook() {
  return useContext(DeepBookContext);
}
