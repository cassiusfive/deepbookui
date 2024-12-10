import sui from "@/assets/sui-symbol.png"
import usdc from "@/assets/usdc.png"

export default function Pairs() {
  return (
    <div className="flex gap-2 h-min py-2 px-3 rounded-full items-center justify-center bg-gray-400">
      <div className="flex">
        <img src={sui} alt="SUI symbol" className="w-6" />
        <img src={usdc} alt="USDC symbol" className="w-6" />
      </div>
      <div className="whitespace-nowrap">SUI-USD</div>
    </div>
  )
}