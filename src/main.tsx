import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initializeDeepBook } from '@/lib/deepbook/client';
import { DeepBookProvider } from '@/contexts/deepbook';

import "@mysten/dapp-kit/dist/index.css";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient();
const networks = {
  devnet: { url: getFullnodeUrl("devnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
};

const keypair_ed25519 = new Ed25519Keypair();
const dbClient = initializeDeepBook(keypair_ed25519.getSecretKey(), "testnet");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="devnet">
        <DeepBookProvider client={dbClient}>
          <WalletProvider>
            <App />
          </WalletProvider>
        </DeepBookProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </StrictMode>,
);
