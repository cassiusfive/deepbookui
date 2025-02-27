import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState, useMemo } from "react";

export function useCurrentManager() {
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
  }, [balanceManagerKey])

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
  }, [balanceManagerKey, setBalanceManagerAddress]);

  const setBalanceManager = useMemo(
    () => (address: string) => {
      if (!balanceManagerKey) return;
      localStorage.setItem(balanceManagerKey, address);
      setBalanceManagerAddress(address)
    },
    [balanceManagerKey, setBalanceManagerAddress]
  );

  return { balanceManagerKey, balanceManagerAddress, setBalanceManager };
}
