import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import DeepBookMarketMaker from "@/lib/deepbook";
import {
  useCurrentAccount,
  useSuiClient,
  useSuiClientContext,
} from "@mysten/dapp-kit";
import { BALANCE_MANAGER_STORAGE_KEY } from "@/hooks/useDeepbook";

export const DeepBookContext = createContext<DeepBookMarketMaker | null>(null);

export function DeepBookProvider({ children }: { children: ReactNode }) {
  const [balanceManagerAddress, setBalanceManagerAddress] = useState(() =>
    localStorage.getItem(BALANCE_MANAGER_STORAGE_KEY),
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setBalanceManagerAddress(
        localStorage.getItem(BALANCE_MANAGER_STORAGE_KEY),
      );
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const account = useCurrentAccount();
  const ctx = useSuiClientContext();
  const suiClient = useSuiClient();

  const value = new DeepBookMarketMaker(
    account?.address || "",
    ctx.network as "testnet" | "mainnet",
    suiClient,
    balanceManagerAddress
      ? {
          ["MANAGER_1"]: {
            address: balanceManagerAddress,
            tradeCap: undefined,
          },
        }
      : {},
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
