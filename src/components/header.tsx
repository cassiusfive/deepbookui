import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Link } from "@tanstack/react-router";
import { getTokenImage } from "@/utils/token-images";
import { Settings, Sun, Moon } from "lucide-react";
import { useContract } from "@/contexts/contract";
import { usePrice } from "@/hooks/usePrice";
import { useSummary } from "@/hooks/useSummary";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { columns } from "./pairs/columns";
import { DataTable } from "./pairs/data-table";

export default function Navbar() {
  const contractContext = useContract();
  if (!contractContext) return;

  const { data: summary, isLoading: isSummaryLoading } = useSummary();
  const { data: price, isLoading: isPriceLoading } = usePrice(
    contractContext.poolKey,
  );

  const account = useCurrentAccount();
  if (account) console.log(`connected to ${account.address}`);

  if (isSummaryLoading || isPriceLoading)
    return <div className="border-b"></div>;
  if (!summary) return <div className="border-b">failed to load pairs</div>;

  const pool = summary.find(
    (pool) =>
      pool.trading_pairs ==
      `${contractContext.baseAsset.baseAssetSymbol}_${contractContext.quoteAsset.quoteAssetSymbol}`,
  );
  const baseLogo = getTokenImage(contractContext.baseAsset.baseAssetSymbol);
  const quoteLogo = getTokenImage(contractContext.quoteAsset.quoteAssetSymbol);

  if (!pool) return <div className="border-b">failed to find pool</div>;

  return (
    <div className="flex w-full items-center justify-between border-b p-4">
      <div className="flex gap-8">
        <Sheet>
          <SheetTrigger>
            <div className="flex items-center justify-center gap-2 rounded-full bg-gray-200 px-3 py-2">
              <div className="flex">
                <img
                  src={baseLogo}
                  alt={`${contractContext.baseAsset.baseAssetSymbol} symbol`}
                  className="z-10 w-6"
                />
                <img
                  src={quoteLogo}
                  alt={`${contractContext.quoteAsset.quoteAssetSymbol} symbol`}
                  className="ml-[-8px] w-6"
                />
              </div>
              <div className="whitespace-nowrap">{`${contractContext.baseAsset.baseAssetSymbol}-${contractContext.quoteAsset.quoteAssetSymbol}`}</div>
            </div>
          </SheetTrigger>
          <SheetContent className="top-[80px] w-[330px]" side="left">
            <div className="container mx-auto pt-6">
              <DataTable columns={columns} data={summary} />
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex gap-8">
          <div className="flex flex-col">
            <div className="text-sm text-gray-500">LAST PRICE (24H)</div>
            <div className="">
              ${price}{" "}
              <span className="text-red-500">
                {pool.price_change_percent_24h.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-gray-500">24H VOLUME</div>
            <div className="">
              ${(pool.base_volume + pool.quote_volume).toFixed(0)}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-gray-500">24H HIGH</div>
            <div className="">${pool.highest_price_24h.toFixed(4)}</div>
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-gray-500">24H LOW</div>
            <div className="">${pool.lowest_price_24h.toFixed(4)}</div>
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
                <p className="pb-4 text-xs text-gray-500">
                  Change the theme of the application
                </p>
                <div className="flex items-center gap-2">
                  <Moon className="w-4" />
                  <Switch />
                  <Sun className="w-4" />
                </div>
              </div>
              <div>
                <h2 className="pb-2">Network</h2>
                <RadioGroup defaultValue="option-one">
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
        <ConnectButton className="" />
      </div>
    </div>
  );
}
