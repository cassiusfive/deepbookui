import { usePrice } from "@/hooks/usePrice"

export default function Summary() {

  const { price, isLoading, error } = usePrice()

  return (
    <div className="flex gap-8">
      <div className="flex flex-col">
        <div className="text-gray-500 text-sm">LAST PRICE (24H)</div>
        <div className="">${price} <span className="text-red-500">-10.29%</span></div>
      </div>
      <div className="flex flex-col">
        <div className="text-gray-500 text-sm">24H VOLUME</div>
        <div className="">$144,299,494.98465</div>
      </div>
      <div className="flex flex-col">
        <div className="text-gray-500 text-sm">24H HIGH</div>
        <div className="">$4.27360</div>
      </div>
      <div className="flex flex-col">
        <div className="text-gray-500 text-sm">24H LOW</div>
        <div className="">$3.36130</div>
      </div>
    </div>
  )
}

// fetch from indexed db for price, volume, high, and low