import { ConnectButton, useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { Settings, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/theme";
import { useContract } from '@/contexts/contract';
import { usePrice } from "@/hooks/usePrice";
import { useSummary } from "@/hooks/useSummary";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

import { columns } from "./pairs/columns"
import { DataTable } from "./pairs/data-table"

import notFound from "@/assets/not-found.png"


export default function Navbar() {
  const { theme, toggleTheme } = useTheme()

  const contractContext = useContract()
  if (!contractContext) return

  const { data: summary, isLoading: isSummaryLoading } = useSummary();
  const { data: baseAssetMetadata, isLoading: isBaseAssetMetadataLoading } = useSuiClientQuery("getCoinMetadata", { coinType: contractContext.baseAsset.baseAssetId })
  const { data: quoteAssetMetadata, isLoading: isQuoteAssetMetadataLoading } = useSuiClientQuery("getCoinMetadata", { coinType: contractContext.quoteAsset.quoteAssetId })
  const { data: price, isLoading: isPriceLoading } = usePrice(contractContext.poolKey);

  const account = useCurrentAccount();
  if (account) console.log(`connected to ${account.address}`);

  if (isSummaryLoading || isPriceLoading || isBaseAssetMetadataLoading || isQuoteAssetMetadataLoading) return <div className="border-b"></div>
  if (!summary || !price || !baseAssetMetadata || !quoteAssetMetadata) return <div className="border-b">failed to load pairs</div>

  const pool = summary.find(pool => pool.trading_pairs == `${contractContext.baseAsset.baseAssetSymbol}_${contractContext.quoteAsset.quoteAssetSymbol}`)

  if (!pool) return <div className="border-b">failed to find pool</div>

  console.log(baseAssetMetadata, quoteAssetMetadata)

  return (
    <div className="flex w-full items-center justify-between p-4 border-b">
      <div className="flex gap-8">
        <Sheet>
          <SheetTrigger>
            <div className="flex items-center justify-center gap-2 rounded-full bg-gray-200 px-3 py-2">
              <div className="flex">
                <img src={baseAssetMetadata.iconUrl ?? notFound} alt={`${contractContext.baseAsset.baseAssetSymbol} symbol`} className="z-10 w-6" />
                <img src={quoteAssetMetadata.iconUrl ?? notFound} alt={`${contractContext.quoteAsset.quoteAssetSymbol} symbol`} className="ml-[-8px] w-6" />
              </div>
              <div className="whitespace-nowrap">{`${baseAssetMetadata.symbol}-${quoteAssetMetadata.symbol}`}</div>
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
            <div className="text-gray-500 text-sm">LAST PRICE (24H)</div>
            <div className="">${price} <span className="text-red-500">{pool.price_change_percent_24h.toFixed(2)}%</span></div>
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-gray-500">24H VOLUME</div>
            <div className="">${(pool.base_volume + pool.quote_volume).toFixed(0)}</div>
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
            <Settings className="w-5" strokeWidth={1.5}/>
          </DialogTrigger>
          <DialogContent>
            <div className="flex flex-col gap-6">
              <div className="border-b pb-4">
                <h2>Theme</h2>
                <p className="pb-4 text-xs text-gray-500">Change the theme of the application</p>
                <div className="flex items-center gap-2">
                  <Sun className="w-4"/>
                  <Switch 
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                    aria-label="Toggle theme"
                  />
                  <Moon className="w-4"/>
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
        <ConnectButton connectText="Connect" />
      </div>
    </div>
  )
}