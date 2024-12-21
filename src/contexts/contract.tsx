import { createContext, useContext, ReactNode } from "react";

const ContractContext = createContext<string | null>(null)

export function ContractProvider({ 
  children, 
  contractAddress 
}: { 
  children: ReactNode, 
  contractAddress: string 
}) {
  return (
    <ContractContext.Provider value={contractAddress}>
      {children}
    </ContractContext.Provider>
  )
}

export function useContract() {
  const context = useContext(ContractContext)
  return context
}