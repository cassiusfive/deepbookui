import { ConnectButton } from "@mysten/dapp-kit";
import { Settings as SettingsIcon } from "lucide-react";
import { useCurrentPool } from "@/contexts/pool";

import { useMidPrice } from "@/hooks/market/useMidPrice";
import { useSummary } from "@/hooks/market/useSummary";
import { usePoolAssetMetadata } from "@/hooks/assets/usePoolAssetMetadata";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
      <div className="flex flex-col w-full gap-4 md:gap-8 md:flex-row">
        <div className="flex justify-between">
          <Sheet>
            <SheetTrigger className="shrink-0">
              <div className="max-w-min flex items-center justify-center gap-2 rounded-full bg-secondary px-8 py-2">
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

          <div className="md:hidden flex items-center gap-4">
          <Dialog>
            <DialogTrigger>
              <SettingsIcon className="w-5" strokeWidth={1.5} />
            </DialogTrigger>
            <DialogContent>
              <Settings />
            </DialogContent>
          </Dialog>
          <ConnectButton connectText="Connect" />
        </div>

        </div>
        <div className="flex gap-8 bg-secondary rounded p-4 md:p-0 md:bg-inherit">
          <div className="flex flex-col gap-2 md:flex-row md:gap-8">
            <div className="flex flex-col">
              <div className="text-nowrap text-muted-foreground">
                LAST PRICE (24H)
              </div>
              <div className="text-nowrap text-2xl md:text-base">
                ${price.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}{" "}
                <span className={`text-base ${pair.price_change_percent_24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {pair.price_change_percent_24h.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}%
                </span>
              </div>
            </div>
            <div className="flex flex-row gap-4 md:gap-8">
              <div className="flex flex-col">
                <div className="text-nowrap text-muted-foreground">
                  24H VOLUME
                </div>
                <div>
                  ${(pair.base_volume + pair.quote_volume).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-nowrap text-muted-foreground">
                  24H HIGH
                </div>
                <div>${pair.highest_price_24h.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</div>
              </div>
              <div className="flex flex-col">
                <div className="text-nowrap text-muted-foreground">
                  24H LOW
                </div>
                <div>${pair.lowest_price_24h.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex md:items-center md:gap-4">
        <Dialog>
          <DialogTrigger>
            <SettingsIcon className="w-5" strokeWidth={1.5} />
          </DialogTrigger>
          <DialogContent>
            <Settings />
          </DialogContent>
        </Dialog>
        <ConnectButton connectText="Connect" />
      </div>
    </div>
  );
}
