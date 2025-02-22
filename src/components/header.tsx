import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useNetwork } from "@/contexts/network";
import { useTheme } from "@/contexts/theme";
import { useCurrentPool } from "@/contexts/pool";
import { useDeepBook } from "@/contexts/deepbook";

import { useMidPrice } from "@/hooks/useMidPrice";
import { useSummary } from "@/hooks/useSummary";
import { usePoolAssetMetadata } from "@/hooks/usePoolAssetMetadata";
import { useToast } from "@/hooks/useToast";

import { BALANCE_MANAGER_KEY, mainnetPackageIds, testnetPackageIds } from "@/constants/deepbook";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import PairTable from "@/components/pair-table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Settings, Sun, Moon, Copy } from "lucide-react";
import suiImg from "@/assets/sui.png";
import usdcImg from "@/assets/usdc.png";
import notFound from "@/assets/not-found.png";

const formSchema = z.object({
  balanceManagerAddress: z.string()
    .min(1, "Manager address is required")
    .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid Sui address format")
})

function ImportBalanceManagerForm() {
  const { toast } = useToast()
  const { network } = useNetwork()
  const account = useCurrentAccount()
  const dbClient = useDeepBook()
  

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      balanceManagerAddress: "",
    },
  })

  const onSubmit = async(values: z.infer<typeof formSchema>) => {
    const res = await dbClient?.client.getObject({ 
      id: values.balanceManagerAddress, 
      options: { 
        showType: true,
        showContent: true
      }
    })

    if (!res || res?.error) {
      console.error(res?.error)
      toast({
        title: "❌ Failed to import balance manager",
        description: res?.error?.code || "unknown",
        duration: 3000
      })
    } else if (res.data?.type !== 
      `${network === "testnet" ? 
      testnetPackageIds.DEEPBOOK_PACKAGE_ID : 
      mainnetPackageIds.DEEPBOOK_PACKAGE_ID}::balance_manager::BalanceManager`) 
    {
      toast({
        title: "❌ Balance manager does not exist",
        duration: 3000
      })
    } else if (res.data?.content?.fields.owner !== account?.address) {
      toast({
        title: "❌ You don't own this balance manager",
        duration: 3000
      })
    } else {
      localStorage.setItem(BALANCE_MANAGER_KEY, values.balanceManagerAddress)
      toast({
        title: "✅ Imported balance manager",
        description: values.balanceManagerAddress,
        duration: 3000
      })
    }
  }

  return (
    <Form {...form}>
      <form className="flex flex-row gap-2" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="balanceManagerAddress"
          render={({ field }) => (
            <FormItem className="grow">
              <FormControl>
                <Input placeholder="address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="outline">Import</Button>
      </form>
    </Form>
  )
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { network, setNetwork } = useNetwork()

  const pool = useCurrentPool();
  const { data: summary, isLoading: isSummaryLoading } = useSummary();
  const { data: price, isLoading: isPriceLoading } = useMidPrice(pool.pool_name);
  
  const pair = summary?.find((pair) => pair.trading_pairs == pool.pool_name);

  const { baseAssetMetadata, quoteAssetMetadata } = usePoolAssetMetadata(pool?.base_asset_id, pool?.quote_asset_id)

  let baseAssetImg = baseAssetMetadata?.iconUrl;
  if (!baseAssetImg) {
    if (pair?.base_currency.includes("SUI")) baseAssetImg = suiImg;
    else if (pair?.base_currency.includes("USDC")) baseAssetImg = usdcImg;
    else baseAssetImg = notFound;
  }
  let quoteAssetImg = quoteAssetMetadata?.iconUrl;
  if (!quoteAssetImg) {
    if (pair?.quote_currency.includes("SUI")) quoteAssetImg = suiImg;
    else if (pair?.quote_currency.includes("USDC")) quoteAssetImg = usdcImg;
    else quoteAssetImg = notFound;
  }

  const balanceManagerAddress = localStorage.getItem(BALANCE_MANAGER_KEY) 

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
              <div className="whitespace-nowrap">{`${baseAssetMetadata?.symbol}-${quoteAssetMetadata?.symbol}`}</div>
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
          <div className="flex flex-col shrink-0">
            <div className="text-sm text-muted-foreground text-nowrap">LAST PRICE (24H)</div>
            <div className="">
              ${price}{" "}
              <span className="text-red-500">
                {pair.price_change_percent_24h.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground text-nowrap">24H VOLUME</div>
            <div className="">
              ${(pair.base_volume + pair.quote_volume).toFixed(0)}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground text-nowrap">24H HIGH</div>
            <div className="">${pair.highest_price_24h.toFixed(4)}</div>
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground text-nowrap">24H LOW</div>
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
            <div className="flex flex-col gap-4">
              <div className="border-b pb-6">
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
              <div className="border-b pb-6">
                <h2 className="pb-2">Network</h2>
                <RadioGroup defaultValue="testnet"
                  value={network}
                  onValueChange={value => setNetwork(value as "mainnet" | "testnet")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mainnet" id="mainnet" />
                    <Label htmlFor="mainnet">Mainnet</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="testnet" id="testnet" />
                    <Label htmlFor="testnet">Testnet</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <h2 className="pb-2">Import balance manager</h2>
                <ImportBalanceManagerForm />
                <h2 className="pt-4 pb-2">Export balance manager</h2>
                <div className="flex gap-2">
                  <Input className="truncate" disabled={true} value={balanceManagerAddress || "No balance manager"}/>
                  <Button disabled={!balanceManagerAddress} variant="outline" size="icon" onClick={() => {navigator.clipboard.writeText(balanceManagerAddress!)}}>
                    <Copy />
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <ConnectButton connectText="Connect" />
      </div>
    </div>
  );
}
