import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  RouterProvider,
  Outlet,
  createRouter,
  createRootRoute,
  createRoute,
  Navigate,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

import Terminal from "@/components/terminal.tsx";
import { initializeDeepBook } from "@/lib/deepbook/client";
import { DeepBookProvider } from "@/contexts/deepbook";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useTheme, ThemeProvider } from "@/contexts/theme";
import { lightTheme } from "@/theme/light";
import { darkTheme } from "@/theme/dark";
import "@mysten/dapp-kit/dist/index.css";
import "./index.css";

const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export const rootRoute = createRootRoute({
  component: () => <Outlet />, // This renders child routes
});

const redirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <Navigate
      to="/trade/$contractAddress"
      params={{
        contractAddress:
          "0xb663828d6217467c8a1838a03793da896cbe745b150ebd57d82f814ca579fc22",
      }}
    />
  ),
});

const tradingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "trade/$contractAddress",
  component: Terminal,
});

const routeTree = rootRoute.addChildren([redirectRoute, tradingRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();
const networks = {
  devnet: { url: getFullnodeUrl("devnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
};

const keypair_ed25519 = new Ed25519Keypair();
const dbClient = initializeDeepBook(keypair_ed25519.getSecretKey(), "mainnet");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networks} defaultNetwork="mainnet">
          <DeepBookProvider client={dbClient}>
            <WalletProviderWrapper>
              <TooltipProvider delayDuration={0}>
                <RouterProvider router={router} />
              </TooltipProvider>
            </WalletProviderWrapper>
          </DeepBookProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);

function WalletProviderWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return <WalletProvider theme={themes[theme]}>{children}</WalletProvider>;
}
