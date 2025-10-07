import { useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeftRight, X } from "lucide-react";
import TokenIcon from "./TokenIcon";
import type { RewardToken } from "@shared/schema";
import { useApp } from "@/state";
import { formatDetailedUSD } from "@/lib/format";

const SUPPORTED_TOKENS: RewardToken[] = ["BTC", "ETH", "SUI", "USDC"];

export default function SwapWidget() {
  const { state } = useApp();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [fromToken, setFromToken] = useState<RewardToken>("BTC");
  const [amount, setAmount] = useState<string>("0");

  const amountNumber = useMemo(() => {
    const parsed = parseFloat(amount);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount]);

  const estimatedUsdc = useMemo(() => {
    const price = state.settings[fromToken] ?? 0;
    if (!price || amountNumber <= 0) return 0;
    if (fromToken === "USDC") {
      return amountNumber;
    }
    return amountNumber * price;
  }, [amountNumber, fromToken, state.settings]);

  const fromBalance = useMemo(() => {
    if (fromToken === "USDC") {
      return state.wallet.usdc;
    }
    return state.wallet.rewards[fromToken] ?? 0;
  }, [fromToken, state.wallet.rewards, state.wallet.usdc]);

  const handleSwap = () => {
    if (amountNumber <= 0) return;

    toast({
      title: "Swap submitted",
      description: `Mock swap of ${amountNumber} ${fromToken} to ${formatDetailedUSD(
        estimatedUsdc,
        2
      )} USDC routed via Keltra DEX aggregator.`,
    });

    setAmount("0");
    setOpen(false);
  };

  const resetAndClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <Button
          size="icon"
          className="rounded-full h-12 w-12 shadow-lg"
          onClick={() => setOpen(true)}
          data-testid="button-open-swap"
        >
          <ArrowLeftRight className="h-5 w-5" />
        </Button>
      </div>

      <DialogContent className="sm:max-w-[360px] bg-slate-950 border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Quick Swap</h2>
            <p className="text-xs text-muted-foreground">
              Trade any supported asset into USDC via Keltra router (mock).
            </p>
          </div>
          <Button size="icon" variant="ghost" onClick={resetAndClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/80 p-3">
            <label className="text-xs font-medium text-slate-300">
              You pay
            </label>
            <div className="flex items-center gap-3">
              <Select
                value={fromToken}
                onValueChange={(value) => setFromToken(value as RewardToken)}
              >
                <SelectTrigger className="w-36 bg-slate-900 border-slate-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border border-slate-800 text-white">
                  {SUPPORTED_TOKENS.map((token) => (
                    <SelectItem
                      key={token}
                      value={token}
                      className="focus:bg-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <TokenIcon token={token} size="sm" />
                        <span>{token}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="bg-slate-900 border-slate-800 text-white"
                data-testid="input-swap-amount"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Balance: {fromBalance.toLocaleString("en-US", { maximumFractionDigits: 4 })}{" "}
              {fromToken}
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/80 p-3">
            <label className="text-xs font-medium text-slate-300">
              You receive
            </label>
            <div className="flex items-center justify-between rounded-md bg-slate-950/60 px-3 py-2">
              <div className="flex items-center gap-2 text-base font-semibold text-white">
                {formatDetailedUSD(estimatedUsdc)}
                <span className="text-xs text-muted-foreground uppercase">
                  USDC
                </span>
              </div>
              <TokenIcon token="USDC" size="sm" />
            </div>
            <p className="text-xs text-muted-foreground">
              Quote uses on-chain oracle prices from Keltra (mock data).
            </p>
          </div>

          <Button
            className="w-full"
            disabled={amountNumber <= 0}
            onClick={handleSwap}
            data-testid="button-confirm-swap"
          >
            Swap to USDC
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
