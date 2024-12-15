import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Settings, Sun, Moon } from "lucide-react";
import { usePrice } from "@/hooks/usePrice";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"


import sui from "@/assets/sui-symbol.png";
import usdc from "@/assets/usdc.png";

export default function Navbar() {

  const account = useCurrentAccount();
  if (account) console.log(`connected to ${account.address}`);

  const { price, isLoading, error } = usePrice()

  return (
    <div className="flex w-full items-center justify-between p-4 border-b">
      <div className="flex gap-8">
        <div className="flex items-center justify-center gap-2 rounded-full bg-gray-200 px-3 py-2">
          <div className="flex">
            <img src={sui} alt="SUI symbol" className="z-10 w-6" />
            <img src={usdc} alt="USDC symbol" className="ml-[-8px] w-6" />
          </div>
          <div className="whitespace-nowrap">SUI-USD</div>
        </div>

        <div className="flex gap-8">
          <div className="flex flex-col">
            <div className="text-gray-500 text-sm">LAST PRICE (24H)</div>
            <div className="">${price} <span className="text-red-500">-10.29%</span></div>
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
                  <Moon className="w-4"/>
                  <Switch />
                  <Sun className="w-4"/>
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
        <ConnectButton className=""/>
      </div>
    </div>
  )
}