import { useCurrentAccount } from "@mysten/dapp-kit";
import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";

type BalanceManagerContextType = {
  balanceManagerKey: string;
  balanceManagerAddress: string | undefined;
  setBalanceManager: (address: string) => void;
};

const BalanceManagerContext = createContext<BalanceManagerContextType | undefined>(undefined);

type BalanceManagerProviderProps = {
  children: ReactNode;
};

export function BalanceManagerProvider({ children }: BalanceManagerProviderProps) {
  const account = useCurrentAccount();

  const balanceManagerKey = useMemo(
    () => (account?.address ? `deepbookui:${account.address}` : ""),
    [account?.address],
  );

  const [balanceManagerAddress, setBalanceManagerAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!balanceManagerKey) {
      // if key changes to "" that means they logged out
      setBalanceManagerAddress(undefined);
      return;
    }

    // update on account change
    setBalanceManagerAddress(
      localStorage.getItem(balanceManagerKey) ?? undefined,
    );
  }, [balanceManagerKey]);

  useEffect(() => {
    if (!balanceManagerKey) return;

    const handleStorageChange = () => {
      setBalanceManagerAddress(
        localStorage.getItem(balanceManagerKey) ?? undefined,
      );
    };
  
    // this will only trigger if the event occurs in another tab / window
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setBalanceManager = useMemo(
    () => (address: string) => {
      if (!balanceManagerKey) return;
      localStorage.setItem(balanceManagerKey, address);
      setBalanceManagerAddress(address);
    },
    [balanceManagerKey]
  );

  const value = useMemo(
    () => ({
      balanceManagerKey,
      balanceManagerAddress,
      setBalanceManager,
    }),
    [balanceManagerKey, balanceManagerAddress, setBalanceManager]
  );

  return (
    <BalanceManagerContext.Provider value={value}>
      {children}
    </BalanceManagerContext.Provider>
  );
}

export function useBalanceManager() {
  const context = useContext(BalanceManagerContext);
  
  if (context === undefined) {
    throw new Error("useBalanceManager must be used within a BalanceManagerProvider");
  }
  
  return context;
}
