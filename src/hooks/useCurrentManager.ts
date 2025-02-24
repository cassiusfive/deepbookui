import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState, useMemo } from "react";

export function useCurrentManager() {
  const account = useCurrentAccount();

  const balanceManagerKey = useMemo(
    () => (account?.address ? `deepbookui:${account.address}` : ""),
    [account?.address],
  );

  const [balanceManagerAddress, setBalanceManagerAddress] = useState<
    string | undefined
  >(undefined);

  // Update state when account changes
  useEffect(() => {
    if (!balanceManagerKey) {
      setBalanceManagerAddress(undefined);
      return;
    }

    // Get latest value from localStorage
    setBalanceManagerAddress(
      localStorage.getItem(balanceManagerKey) ?? undefined,
    );
  }, [balanceManagerKey]); // Depend on balanceManagerKey to refresh state on account change

  useEffect(() => {
    if (!balanceManagerKey) return;

    const handleStorageChange = () => {
      setBalanceManagerAddress(
        localStorage.getItem(balanceManagerKey) ?? undefined,
      );
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [balanceManagerKey]);

  const setBalanceManager = (address: string) => {
    if (!balanceManagerKey) return;
    localStorage.setItem(balanceManagerKey, address);
    setBalanceManagerAddress(address);
  };

  return { balanceManagerKey, balanceManagerAddress, setBalanceManager };
}
