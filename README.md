# Sui DeepBoook DEX

A demonstration React application showcasing Sui's Deepbook protocol implementation using the [v3 SDK](https://docs.sui.io/standards/deepbookv3-sdk) and [indexer](https://docs.sui.io/standards/deepbookv3-indexer). This project serves as a learning resource for developers looking to understand how to integrate with Deepbook.

> [!NOTE]
> This is a demonstration project and should not be used in production environments.

# Features
- Real time order book visualization
- Interactive candlestick chart
- Navigation between different pools
- Full trading functionality
  - Limit orders
  - Market orders
  - Order cancellation
- Order management
  - Open orders
  - Trade history
- Balance manager system
  - Deposit and withdraw
  - Settled balance view
  - Import / export balance manager address
- Support for Mainnet and Testnet
- Light and dark mode
 
# Tech Stack
- React
- Sui Deepbook v3 SDK and Indexer
- Tanstack router + query
- Typescript
- Tailwind CSS

# Getting Started

### Installation
1. Clone the repository
```bash
git clone https://github.com/cassiusfive/deepbookui.git
cd deepbook-ui
```
2. Install dependencies
```bash
npm install
```
3. Start the development server
```bash
npm run dev
```

# Resources
### Project structure
```
src/
  ├── components/           # Reusable UI components
  ├── contexts/             # React Context providers
  │   ├── deepbook.tsx      # DeepBook client provider
  ├── hooks/                # Hooks for Sui/Deepbook interaction
  └── lib/                  # Core utilities and clients
      ├── indexer-client.ts # DeepBook indexer API client
      └── utils.ts          # General utility functions
```

# Code Examples
### Initializing DeepBook Client
```typescript
// reinitialize if user connects wallet or changes network
const deepBookClient = useMemo(() => {
  return new DeepBookClient({
    client: new SuiClient({ url: getFullnodeUrl(network) }),
    env: network,
    address: account?.address || "",
    balanceManagers: balanceManagerAddress ? {[BALANCE_MANAGER_KEY]: {
      address: balanceManagerAddress,
      tradeCap: undefined
    }} : {},
    coins: network == "mainnet" ? mainnetCoins : testnetCoins,
    pools: network == "mainnet" ? mainnetPools : testnetPools
  })
}, [account?.address, network, balanceManagerAddress]);
```

### Using TanStack Query
```typescript
export function useManagerBalance(managerKey: string, coinKey: string) {
  const dbClient = useDeepBook();

  return useQuery({
    queryKey: ["managerBalance", managerKey, coinKey],
    queryFn: () => dbClient?.checkManagerBalance(managerKey, coinKey),
    enabled: !!dbClient
  });
}
```
# Additional Resources
- [Sui Docs](https://docs.sui.io/)
- [DeepBook v3 SDK](https://docs.sui.io/standards/deepbookv3-sdk)
- [DeepBook v3 Indexer](https://docs.sui.io/standards/deepbookv3-indexer)


  


