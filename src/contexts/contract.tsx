import { createContext, useContext, ReactNode } from "react";

export type ContractContextType = {
  contractAddress: string,
  poolKey: string
  baseAsset: {
    baseAssetId: string,
    baseAssetSymbol: string
  },
  quoteAsset: {
    quoteAssetId: string,
    quoteAssetSymbol: string
  }
}

const ContractContext = createContext<ContractContextType | null>(null)

export function ContractProvider({ 
  children, 
  contractContext 
}: { 
  children: ReactNode, 
  contractContext: ContractContextType 
}) {
  return (
    <ContractContext.Provider value={contractContext}>
      {children}
    </ContractContext.Provider>
  )
}

export function useContract() {
  const context = useContext(ContractContext)
  return context
}