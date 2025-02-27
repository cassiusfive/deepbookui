import { ConnectButton } from "@mysten/dapp-kit";
import { Settings as SettingsIcon } from "lucide-react";
import { useCurrentPool } from "@/contexts/pool";

import { useMidPrice } from "@/hooks/useMidPrice";
import { useSummary } from "@/hooks/useSummary";
import { usePoolAssetMetadata } from "@/hooks/usePoolAssetMetadata";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTrigger, 
  DialogDescription, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import PairTable from "@/components/header/pair-table";
import Settings from "@/components/header/settings";

import suiImg from "@/assets/sui.png";
import usdcImg from "@/assets/usdc.png";
import usdtImg from "@/assets/usdt.png";
import notFound from "@/assets/not-found.png";

export default function Header() {
  const pool = useCurrentPool();
  const { data: summary, isLoading: isSummaryLoading } = useSummary();
  const { data: price, isLoading: isPriceLoading } = useMidPrice(
    pool.pool_name,
  );

  const pair = summary?.find((pair) => pair.trading_pairs == pool.pool_name);

  const { baseAssetMetadata, quoteAssetMetadata } = usePoolAssetMetadata(
    pool.base_asset_id,
    pool.quote_asset_id,
  );

  let baseAssetImg = baseAssetMetadata?.iconUrl;
  if (!baseAssetImg) {
    if (pair?.base_currency.includes("SUI")) baseAssetImg = suiImg;
    else if (pair?.base_currency.includes("USDC")) baseAssetImg = usdcImg;
    else if (pair?.base_currency.includes("USDT")) baseAssetImg = usdtImg;
    else baseAssetImg = notFound;
  }
  let quoteAssetImg = quoteAssetMetadata?.iconUrl;
  if (!quoteAssetImg) {
    if (pair?.quote_currency.includes("SUI")) quoteAssetImg = suiImg;
    else if (pair?.quote_currency.includes("USDC")) quoteAssetImg = usdcImg;
    else if (pair?.quote_currency.includes("USDT")) quoteAssetImg = usdtImg;
    else quoteAssetImg = notFound;
  }

  if (isSummaryLoading || isPriceLoading) {
    return <div className="border-b"></div>;
  }

  if (!summary || !price) {
    return <div className="border-b">failed to load pairs</div>;
  }
  if (!pair) return <div className="border-b">failed to find pair</div>;
  if (!pool) return <div className="border-b">failed to find pool</div>;

  return (
    <div className="flex w-full items-center justify-between border-b p-4">
      <div className="flex gap-8">
        <Sheet>
          <SheetTrigger className="shrink-0">
            <div className="flex items-center justify-center gap-2 rounded-full bg-secondary px-3 py-2">
              <div className="flex shrink-0">
                <img
                  src={baseAssetImg}
                  alt={`${pool.base_asset_symbol} symbol`}
                  className="z-10 w-6 rounded-full"
                />
                <img
                  src={quoteAssetImg}
                  alt={`${pool.quote_asset_symbol} symbol`}
                  className="ml-[-8px] w-6 rounded-full"
                />
              </div>
              <div className="whitespace-nowrap">{`${pair.base_currency}-${pair.quote_currency}`}</div>
            </div>
          </SheetTrigger>
          <SheetContent
            className="top-[80px] h-[calc(100vh-80px)] w-[330px]"
            side="left"
          >
            <PairTable />
          </SheetContent>
        </Sheet>

        <div className="flex gap-8">
          <div className="flex shrink-0 flex-col">
            <div className="text-nowrap text-sm text-muted-foreground">
              LAST PRICE (24H)
            </div>
            <div className="">
              ${price}{" "}
              <span className="text-red-500">
                {pair.price_change_percent_24h.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-nowrap text-sm text-muted-foreground">
              24H VOLUME
            </div>
            <div className="">
              ${(pair.base_volume + pair.quote_volume).toFixed(0)}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-nowrap text-sm text-muted-foreground">
              24H HIGH
            </div>
            <div className="">${pair.highest_price_24h.toFixed(4)}</div>
          </div>
          <div className="flex flex-col">
            <div className="text-nowrap text-sm text-muted-foreground">
              24H LOW
            </div>
            <div className="">${pair.lowest_price_24h.toFixed(4)}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Dialog>
          <DialogTrigger>
            <SettingsIcon className="w-5" strokeWidth={1.5} />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="sr-only">
              <DialogTitle className="sr-only">Settings</DialogTitle>
              <DialogDescription className="sr-only">Change theme, network, or balance manager</DialogDescription>
            </DialogHeader>
            <Settings />
          </DialogContent>
        </Dialog>
        <ConnectButton connectText="Connect" />
      </div>
    </div>
  );
}
