type supportedToken = "SUI" | "USDC" | "DEEP"

import suiLogo from '@/assets/sui.png'
import usdcLogo from '@/assets/usdc.png'
import deepLogo from '@/assets/deep.png'

const tokenImages = {
  SUI: suiLogo,
  USDC: usdcLogo,
  DEEP: deepLogo
}

export function getTokenImage(symbol: string): string {
  const upperSymbol = symbol.toUpperCase()
  return tokenImages[upperSymbol as supportedToken]
}

