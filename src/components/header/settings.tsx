import { useCurrentAccount } from "@mysten/dapp-kit";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useTheme } from "@/contexts/theme";
import { useNetwork } from "@/contexts/network";
import { useDeepBook } from "@/contexts/deepbook";
import { useBalanceManager } from "@/contexts/balanceManager";

import { useToast } from "@/hooks/useToast";

import { mainnetPackageIds, testnetPackageIds } from "@/constants/deepbook";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Sun, Moon, Copy } from "lucide-react";

const formSchema = z.object({
  balanceManagerAddress: z
    .string()
    .min(1, "Manager address is required")
    .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid Sui address format"),
});

function ImportBalanceManagerForm() {
  const { toast } = useToast();
  const { network } = useNetwork();
  const account = useCurrentAccount();
  const dbClient = useDeepBook();
  const { setBalanceManager } = useBalanceManager();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      balanceManagerAddress: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const res = await dbClient?.client.getObject({
      id: values.balanceManagerAddress,
      options: {
        showType: true,
        showContent: true,
      },
    });

    if (!res || res?.error) {
      console.error(res?.error);
      toast({
        title: "❌ Failed to import balance manager",
        description: res?.error?.code || "unknown",
        duration: 3000,
      });
    } else if (
      res.data?.type !==
      `${
        network === "testnet"
          ? testnetPackageIds.DEEPBOOK_PACKAGE_ID
          : mainnetPackageIds.DEEPBOOK_PACKAGE_ID
      }::balance_manager::BalanceManager`
    ) {
      toast({
        title: "❌ Balance manager does not exist",
        duration: 3000,
      });
      //@ts-ignore
    } else if (res.data?.content?.fields.owner !== account?.address) {
      toast({
        title: "❌ You don't own this balance manager",
        duration: 3000,
      });
    } else {
      setBalanceManager(values.balanceManagerAddress);
      toast({
        title: "✅ Imported balance manager",
        description: values.balanceManagerAddress,
        duration: 3000,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-row gap-2"
        onSubmit={form.handleSubmit(onSubmit)}
      >
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
        <Button type="submit" variant="outline">
          Import
        </Button>
      </form>
    </Form>
  );
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { network, setNetwork } = useNetwork();

  const { balanceManagerAddress } = useBalanceManager();

  return (
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
        <RadioGroup
          defaultValue="testnet"
          value={network}
          onValueChange={(value) =>
            setNetwork(value as "mainnet" | "testnet")
          }
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
        <h2 className="pb-2 pt-4">Export balance manager</h2>
        <div className="flex gap-2">
          <Input
            className="truncate"
            disabled={true}
            value={balanceManagerAddress || "No balance manager"}
          />
          <Button
            disabled={!balanceManagerAddress}
            variant="outline"
            size="icon"
            onClick={() => {
              navigator.clipboard.writeText(balanceManagerAddress!);
            }}
          >
            <Copy />
          </Button>
        </div>
      </div>
    </div>
  )
}