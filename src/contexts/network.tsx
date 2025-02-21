import { createContext, useState, useContext } from "react";

type Network = "mainnet" | "testnet";

type NetworkProviderProps = {
  children: React.ReactNode;
  defaultNetwork?: Network;
  storageKey?: string;
};

type NetworkProviderState = {
  network: Network;
  setNetwork: (network: Network) => void;
  storageKey?: string;
};

const initialState: NetworkProviderState = {
  network: "mainnet",
  setNetwork: () => null,
};

const NetworkProviderContext = createContext<NetworkProviderState>(initialState);

export function NetworkProvider({
  children,
  defaultNetwork = "mainnet",
  storageKey = "network",
  ...props
}: NetworkProviderProps) {
  const [network, setNetwork] = useState<Network>(
    () => (localStorage.getItem(storageKey) as Network) || defaultNetwork,
  );

  const value = {
    network,
    setNetwork: (network: Network) => {
      localStorage.setItem(storageKey, network);
      setNetwork(network);
    }
  }
  
  return (
    <NetworkProviderContext.Provider {...props} value={value}>
      {children}
    </NetworkProviderContext.Provider>
  );
}

export const useNetwork = () => {
  const context = useContext(NetworkProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
