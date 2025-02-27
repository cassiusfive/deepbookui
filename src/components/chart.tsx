import { useRef, useEffect } from "react";
import { createChart } from "lightweight-charts";
import { useTheme } from "@/contexts/theme";
import { useCandleData } from "@/hooks/useCandleData";

export default function Chart() {
  const { theme } = useTheme();
  const { data: candles } = useCandleData();

  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    const chart = createChart(container.current, {
      autoSize: true,
      leftPriceScale: {
        borderVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderColor:
          theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      },
      crosshair: {
        mode: 0,
        vertLine: {
          labelBackgroundColor: "#a3a3a3"
        },
        horzLine: {
          labelBackgroundColor: "#a3a3a3"
        }
      },
      layout: {
        background: {
          color: theme === "dark" ? "hsl(0, 0%, 10%)" : "hsl(0, 0%, 100%)",
        },
        textColor: theme === "dark" ? "#ffffff" : "#000000",
      },
      grid: {
        vertLines: {
          color:
            theme === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
        },
        horzLines: {
          color:
            theme === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
        },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      priceFormat: {
        type: "price",
        precision: 4,
        minMove: .0001
      },
    });

    if (candles) {
      candlestickSeries.setData(candles);
    }

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [theme, candles]);

  return (
    <div ref={container} className="flex h-full w-full cursor-crosshair" />
  );
}
