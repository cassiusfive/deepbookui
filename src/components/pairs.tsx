import sui from "@/assets/sui-symbol.png";
import usdc from "@/assets/usdc.png";

export default function Pairs() {
  return (
    <div className="flex h-min items-center justify-center gap-2 rounded-full bg-gray-400 px-3 py-2">
      <div className="flex">
        <img src={sui} alt="SUI symbol" className="w-6" />
        <img src={usdc} alt="USDC symbol" className="w-6" />
      </div>
      <div className="whitespace-nowrap">SUI-USD</div>
    </div>
  );
}
