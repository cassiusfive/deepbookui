import { ConnectButton } from "@mysten/dapp-kit";

import { useNetwork } from "@/contexts/network";
import { useTheme } from "@/contexts/theme";
import { useCurrentPool } from "@/contexts/pool";

import { useMidPrice } from "@/hooks/useMidPrice";
import { useSummary } from "@/hooks/useSummary";
import { usePoolAssetMetadata } from "@/hooks/usePoolAssetMetadata";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import PairTable from "@/components/pair-table";

import { Settings, Sun, Moon } from "lucide-react";
import suiImg from "@/assets/sui.png";
import usdcImg from "@/assets/usdc.png";
import notFound from "@/assets/not-found.png";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { network, setNetwork } = useNetwork()

  const pool = useCurrentPool();
  const { data: summary, isLoading: isSummaryLoading } = useSummary();
  const { data: price, isLoading: isPriceLoading } = useMidPrice(pool.pool_name);

  const pair = summary?.find((pair) => pair.trading_pairs == pool.pool_name);

  const { baseAssetMetadata, quoteAssetMetadata, isLoading: isPoolAssetMetadataLoading } = usePoolAssetMetadata(pool?.base_asset_id, pool?.quote_asset_id)

  if (isPoolAssetMetadataLoading) return
  if (!baseAssetMetadata || !quoteAssetMetadata) return

  let baseAssetImg = baseAssetMetadata.iconUrl;
  if (!baseAssetImg) {
    if (pair?.base_currency.includes("SUI")) baseAssetImg = suiImg;
    else if (pair?.base_currency.includes("USDC")) baseAssetImg = usdcImg;
    else baseAssetImg = notFound;
  }
  let quoteAssetImg = quoteAssetMetadata.iconUrl;
  if (!quoteAssetImg) {
    if (pair?.quote_currency.includes("SUI")) quoteAssetImg = suiImg;
    else if (pair?.quote_currency.includes("USDC")) quoteAssetImg = usdcImg;
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
          <SheetTrigger>
            <div className="flex items-center justify-center gap-2 rounded-full bg-secondary px-3 py-2">
              <div className="flex">
                <img
                  src={baseAssetImg}
                  alt={`${pool.base_asset_symbol} symbol`}
                  className="z-10 w-6"
                />
                <img
                  src={quoteAssetImg}
                  alt={`${pool.quote_asset_symbol} symbol`}
                  className="ml-[-8px] w-6"
                />
              </div>
              <div className="whitespace-nowrap">{`${baseAssetMetadata.symbol}-${quoteAssetMetadata.symbol}`}</div>
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
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground">
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
            <div className="text-sm text-muted-foreground">24H VOLUME</div>
            <div className="">
              ${(pair.base_volume + pair.quote_volume).toFixed(0)}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground">24H HIGH</div>
            <div className="">${pair.highest_price_24h.toFixed(4)}</div>
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground">24H LOW</div>
            <div className="">${pair.lowest_price_24h.toFixed(4)}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Dialog>
          <DialogTrigger>
            <Settings className="w-5" strokeWidth={1.5} />
          </DialogTrigger>
          <DialogContent>
            <div className="flex flex-col gap-6">
              <div className="border-b pb-4">
                <h2>Theme</h2>
                <p className="pb-4 text-xs text-muted-foreground">
                  Change the theme of the application
                </p>
                <div className="flex items-center gap-2">
                  <Sun className="w-4" />
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                    aria-label="Toggle theme"
                  />
                  <Moon className="w-4" />
                </div>
              </div>
              <div>
                <h2 className="pb-2">Network</h2>
                <RadioGroup defaultValue="option-one"
                  value={network}
                  onValueChange={value => setNetwork(value as "mainnet" | "testnet")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-one" id="option-one" />
                    <Label htmlFor="option-one">Mainnet</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option-two" id="option-two" />
                    <Label htmlFor="option-two">Testnet</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <ConnectButton connectText="Connect" />
      </div>
    </div>
  );
}
