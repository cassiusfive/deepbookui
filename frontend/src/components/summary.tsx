export default function Summary() {
  return (
    <div className="flex gap-8">
      <div className="flex flex-col">
        <div className="text-sm text-gray-500">LAST PRICE (24H)</div>
        <div className="">
          $3.7669 <span className="text-red-500">-10.29%</span>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="text-sm text-gray-500">24H VOLUME</div>
        <div className="">$144,299,494.98465</div>
      </div>
      <div className="flex flex-col">
        <div className="text-sm text-gray-500">24H HIGH</div>
        <div className="">$4.27360</div>
      </div>
      <div className="flex flex-col">
        <div className="text-sm text-gray-500">24H LOW</div>
        <div className="">$3.36130</div>
      </div>
    </div>
  );
}

// fetch from indexed db for price, volume, high, and low
