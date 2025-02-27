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

import Terminal from "@/components/terminal.tsx";
import { DeepBookProvider } from "@/contexts/deepbook";
import { BalanceManagerProvider } from "@/contexts/balanceManager";
import { NetworkProvider } from "@/contexts/network";
import { useTheme, ThemeProvider } from "@/contexts/theme";
import { TooltipProvider } from "@/components/ui/tooltip";

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
          "0xf948981b806057580f91622417534f491da5f61aeaf33d0ed8e69fd5691c95ce",
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
  testnet: { url: getFullnodeUrl("testnet") },
  mainnet: { url: getFullnodeUrl("mainnet") },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider storageKey="vite-ui-theme">
      <NetworkProvider>
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networks}>
            <WalletProviderWrapper>
              <BalanceManagerProvider>
                <DeepBookProvider>
                  <TooltipProvider delayDuration={0}>
                    <RouterProvider router={router} />
                  </TooltipProvider>
                </DeepBookProvider>
              </BalanceManagerProvider>
            </WalletProviderWrapper>
          </SuiClientProvider>
        </QueryClientProvider>
      </NetworkProvider>
    </ThemeProvider>
  </StrictMode>
);

function WalletProviderWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <WalletProvider autoConnect theme={themes[theme]}>
      {children}
    </WalletProvider>
  );
}
