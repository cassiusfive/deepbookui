import { useRef, useEffect } from "react";
import { createChart, UTCTimestamp } from "lightweight-charts";

export default function Chart() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const chart = createChart(container.current, {
      autoSize: true,
      leftPriceScale: {
        borderVisible: false
      },
      rightPriceScale: {
        borderVisible: false
      },
      timeScale: {
        borderColor: "#e5e7eb"
      },
      crosshair: {
        mode: 0
      }
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a", downColor: "#ef5350", borderVisible: false,
      wickUpColor: "#26a69a", wickDownColor: "#ef5350",
    });

    candlestickSeries.setData([
      { time: "2018-12-22", open: 75.16, high: 82.84, low: 36.16, close: 45.72 as UTCTimestamp},
      { time: "2018-12-23", open: 45.12, high: 53.90, low: 45.12, close: 48.09 },
      { time: "2018-12-24", open: 60.71, high: 60.71, low: 53.39, close: 59.29 },
      { time: "2018-12-25", open: 68.26, high: 68.26, low: 59.04, close: 60.50 },
      { time: "2018-12-26", open: 67.71, high: 105.85, low: 66.67, close: 91.04 },
      { time: "2018-12-27", open: 91.04, high: 121.40, low: 82.70, close: 111.40 },
      { time: "2018-12-28", open: 111.51, high: 142.83, low: 103.34, close: 131.25 },
      { time: "2018-12-29", open: 131.33, high: 151.17, low: 77.68, close: 96.43 },
      { time: "2018-12-30", open: 106.33, high: 110.20, low: 90.39, close: 98.10 },
      { time: "2018-12-31", open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
    ]);

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    }
  }, [])
  
  return <div ref={container} className="w-full h-full min-h-[400px] cursor-crosshair" />
}