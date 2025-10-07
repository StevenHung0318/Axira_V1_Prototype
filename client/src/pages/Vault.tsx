import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronDown, Calculator, History, ExternalLink } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TokenIcon from "../components/TokenIcon";
import LineAprChart from "../components/LineAprChart";
import MermaidFlow from "../components/MermaidFlow";
import {
  vaults,
  formatUSD,
  formatTokenAmount,
  calculateTotalAPR,
  calculateAverageAPR,
  rewardHistories,
} from "../data";
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatDetailedUSD,
} from "../lib/format";
import { useApp } from "../state";
import { useToast } from "@/hooks/use-toast";

export default function Vault() {
  const [, params] = useRoute("/vault/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isRiskOpen, setIsRiskOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");

  const {
    state,
    connectWallet,
    disconnectWallet,
    deposit,
    withdraw,
    claimRewards,
    updateAccrual,
  } = useApp();

  const vaultId = params?.id as string;
  const vault = vaults.find((v) => v.id === vaultId);
  const position = state.positions[vaultId];

  useEffect(() => {
    if (!vault || !position) return;

    const interval = setInterval(() => {
      updateAccrual(vaultId);
    }, 1000);

    return () => clearInterval(interval);
  }, [vault, position, vaultId, updateAccrual]);

  if (!vault) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Vault Not Found</h1>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const totalAPR = calculateTotalAPR(vault);
  const totalTVL = vaults.reduce((sum, v) => sum + v.tvl, 0);
  const totalYields = 156_000;
  const averageAPR = calculateAverageAPR(vault.dailyApr);

  const userStaked = position ? position.principalUsdc : 0;
  const accruedUsd = position ? position.accruedUsd : 0;
  const accruedTokens = position ? position.accruedTokens : 0;
  
  // Use same values as "Total earned rewards" from homepage
  const lifetimeTokens = (() => {
    switch (vault.id) {
      case "btcUSD": return 2.3415;
      case "suiUSD": return 2334;
      case "ethUSD": return 0;
      case "usdcUSD": return 9_112_334_556.03;
      default: return 0;
    }
  })();
  const formattedLifetimeTokens =
    vault.reward === "SUI"
      ? lifetimeTokens.toFixed(1)
      : vault.reward === "USDC"
        ? formatCompactNumber(lifetimeTokens)
        : formatTokenAmount(lifetimeTokens);
  const claimableTokens = accruedTokens;
  const formattedClaimableTokens =
    vault.reward === "USDC"
      ? claimableTokens.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : formatTokenAmount(claimableTokens);
  const formattedAccruedUsd =
    vault.reward === "USDC"
      ? formatDetailedUSD(accruedUsd)
      : formatCompactCurrency(accruedUsd);

  const formatUsdcAmount = (value: number) =>
    value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const formatRewardAmountLabel = (amount: number) =>
    vault.reward === "USDC"
      ? `${formatUsdcAmount(amount)} USDC`
      : `${formatHistoryAmount(amount)} ${vault.reward}`;

  const historyEntries = rewardHistories[vault.id] ?? [];
  const totalClaimed = historyEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const unclaimedTotal = claimableTokens;
  const totalEarned = totalClaimed + unclaimedTotal;
  const formatHistoryAmount = (amount: number) => {
    if (vault.reward === "USDC") {
      return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    const decimals = vault.reward === "SUI" ? 4 : 6;
    return amount.toFixed(decimals);
  };
  const formatHistoryTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${month}-${day}-${year} ${hours}:${minutes}:${seconds}`;
  };
  const shortenHash = (hash: string) =>
    hash.length <= 12 ? hash : `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  const renderSummaryValue = (amount: number) => {
    const formatted =
      vault.reward === "USDC" ? formatDetailedUSD(amount) : formatHistoryAmount(amount);
    return (
      <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
        <span>{formatted}</span>
        <div className="flex items-center gap-1 text-sm text-slate-300">
          <TokenIcon token={vault.reward} size="sm" />
          <span>{vault.reward}</span>
        </div>
      </div>
    );
  };

  const rewardPrice = state.settings[vault.reward];

  // APR Calculator functions
  const marketPrice = state.settings[vault.reward] || 0;
  const calculateFinalAPR = () => {
    const target = parseFloat(targetPrice);
    if (!target || target <= 0 || marketPrice <= 0) return 0;
    return (target / marketPrice) * totalAPR;
  };

  const handleCalculatorClose = (open: boolean) => {
    setIsCalculatorOpen(open);
    if (!open) {
      setTargetPrice("");
    }
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        title: "Unable to deposit",
        description: "Enter a valid USDC amount greater than zero.",
        variant: "destructive",
      });
      return;
    }
    if (amount > state.wallet.usdc) {
      toast({
        title: "Deposit failed",
        description: "Insufficient USDC balance for this deposit.",
        variant: "destructive",
      });
      return;
    }
    deposit(vaultId, amount);
    setDepositAmount("");
    toast({
      title: "Deposit submitted",
      description: `Deposited ${formatUsdcAmount(amount)} USDC into ${vault.name}.`,
    });
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        title: "Unable to withdraw",
        description: "Enter a valid USDC amount greater than zero.",
        variant: "destructive",
      });
      return;
    }
    if (amount > userStaked) {
      toast({
        title: "Withdrawal failed",
        description: "You cannot withdraw more than your deposited USDC.",
        variant: "destructive",
      });
      return;
    }
    withdraw(vaultId, amount);
    setWithdrawAmount("");
    toast({
      title: "Withdrawal submitted",
      description: `Requested ${formatUsdcAmount(amount)} USDC from ${vault.name}.`,
    });
  };

  const handleClaim = () => {
    if (claimableTokens <= 0) {
      toast({
        title: "No rewards to claim",
        description: "Accrue more rewards before claiming again.",
        variant: "destructive",
      });
      return;
    }
    const netTokens =
      claimableTokens * (1 - vault.performanceFeePct / 100);
    claimRewards(vaultId);
    toast({
      title: "Rewards claimed",
      description: `Claimed ${formatRewardAmountLabel(
        netTokens
      )} from ${vault.name} after ${vault.performanceFeePct}% fee.`,
    });
  };

  const setMaxDeposit = () => {
    setDepositAmount(state.wallet.usdc.toString());
  };

  const setMaxWithdraw = () => {
    setWithdrawAmount(userStaked.toString());
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isConnected={state.wallet.connected}
        walletAddress={state.wallet.address}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 text-sm text-muted-foreground">
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            ← Back to Vaults
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    Your Position
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-2xl font-bold"
                    data-testid="text-user-position"
                  >
                    {formatCompactCurrency(userStaked)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
                    APR
                    <Dialog open={isCalculatorOpen} onOpenChange={handleCalculatorClose}>
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid="button-apr-calculator"
                        >
                          <Calculator className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">APR Calculator</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Estimate potential APR based on target token price
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">
                              Current APR
                            </label>
                            <div className="p-3 bg-gray-800 border border-gray-700 rounded-md">
                              <span className="font-medium text-white">{totalAPR.toFixed(1)}%</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">
                              Current Market Price
                            </label>
                            <div className="flex items-center gap-2 p-3 bg-gray-800 border border-gray-700 rounded-md" data-testid="text-market-price">
                              <TokenIcon token={vault.reward} size="sm" />
                              <span className="font-medium text-white">
                                ${marketPrice.toLocaleString()}
                              </span>
                              <span className="text-gray-400">{vault.reward}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">
                              Target Price ($)
                            </label>
                            <Input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="Enter target price..."
                              value={targetPrice}
                              onChange={(e) => setTargetPrice(e.target.value)}
                              data-testid="input-target-price"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            />
                            {targetPrice && parseFloat(targetPrice) <= 0 && (
                              <p className="text-xs text-red-400">Please enter a valid price greater than 0</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">
                              Final APR
                            </label>
                            <div className="p-3 bg-green-900/30 border border-green-700/50 rounded-md" data-testid="text-final-apr">
                              <span className="text-lg font-bold text-green-400">
                                {calculateFinalAPR().toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xl font-bold"
                      data-testid="text-vault-apr"
                    >
                      {totalAPR.toFixed(1)}%
                    </span>
                    <TokenIcon token={vault.reward} size="sm" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    Total earned rewards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-2xl font-bold"
                      data-testid="text-lifetime-yields"
                    >
                      {formattedLifetimeTokens} {vault.reward}
                    </span>
                    <TokenIcon token={vault.reward} size="sm" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* APR Chart */}
            <Card>
              <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between pb-2">
                <CardTitle className="text-base font-semibold">
                  Strategy APR
                </CardTitle>
                <span className="text-lg font-semibold text-emerald-400">
                  +{averageAPR.toFixed(2)}%
                </span>
              </CardHeader>
              <CardContent>
                <LineAprChart dailyApr={vault.dailyApr} />
              </CardContent>
            </Card>

            {/* Strategy Flow */}
            <Card>
              <CardHeader>
                <CardTitle>Strategy Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <MermaidFlow id={`flow-${vault.id}`} rewardToken={vault.reward} />
              </CardContent>
            </Card>

            {/* Risk & Breakdown */}
            <Card>
              <Collapsible open={isRiskOpen} onOpenChange={setIsRiskOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader
                    className="hover-elevate cursor-pointer"
                    data-testid="button-risk-breakdown"
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle>Risk & Breakdown</CardTitle>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isRiskOpen ? "transform rotate-180" : ""}`}
                      />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3">
                    <div>
                      <strong>Risk Level:</strong> Low Risk
                    </div>
                    <div>
                      <strong>Nature of Strategies:</strong> Incentive from High
                      Yield Assets
                    </div>
                    <div>
                      <strong>Complexity:</strong> Low
                    </div>
                    <div>
                      <strong>Underlying Protocols:</strong> StableLayer
                      (Bucket), NAVI
                    </div>
                    <div>
                      <strong>Entry Cost:</strong> 0%
                    </div>
                    <div>
                      <strong>Performance Fee:</strong> 10% charged by Keltra
                    </div>
                    <div>
                      <strong>Contract Link:</strong>{" "}
                      <span
                        className="font-mono text-primary cursor-pointer hover:underline"
                        data-testid="link-contract"
                      >
                        {vault.contract}
                      </span>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>

          {/* Right Panel - Actions */}
          <div className="space-y-6">
            {/* Deposit/Withdraw */}
            <Card>
              <CardHeader>
                <CardTitle>Manage Position</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="deposit">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="deposit" data-testid="tab-deposit">
                      Deposit
                    </TabsTrigger>
                    <TabsTrigger value="withdraw" data-testid="tab-withdraw">
                      Withdraw
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="deposit" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Amount (USDC)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          data-testid="input-deposit-amount"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={setMaxDeposit}
                          data-testid="button-max-deposit"
                        >
                          MAX
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Balance: {formatUSD(state.wallet.usdc)} USDC
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleDeposit}
                      disabled={
                        !state.wallet.connected ||
                        !depositAmount ||
                        parseFloat(depositAmount) <= 0
                      }
                      data-testid="button-deposit"
                    >
                      Deposit
                    </Button>
                  </TabsContent>

                  <TabsContent value="withdraw" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Amount (USDC)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          data-testid="input-withdraw-amount"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={setMaxWithdraw}
                          data-testid="button-max-withdraw"
                        >
                          MAX
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Deposited: {formatUSD(userStaked)} USDC
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleWithdraw}
                      disabled={
                        !state.wallet.connected ||
                        !withdrawAmount ||
                        parseFloat(withdrawAmount) <= 0
                      }
                      data-testid="button-withdraw"
                    >
                      Withdraw
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Your Rewards */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <Card>
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Your Rewards</CardTitle>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="inline-flex items-center gap-2"
                      data-testid="button-reward-history"
                    >
                      <History className="h-4 w-4" />
                      History
                    </Button>
                  </DialogTrigger>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Claimable
                      </span>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <span className="text-xs">APR</span>
                        <span className="font-medium">
                          {totalAPR.toFixed(1)}%
                        </span>
                        <TokenIcon token={vault.reward} size="sm" />
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xl font-bold"
                      data-testid="text-claimable-rewards"
                    >
                      {formattedClaimableTokens} {vault.reward}
                    </span>
                    <TokenIcon token={vault.reward} size="sm" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ≈ {formattedAccruedUsd} (before {vault.performanceFeePct}% fee)
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleClaim}
                  disabled={!state.wallet.connected || claimableTokens <= 0}
                  data-testid="button-claim"
                >
                  Claim Rewards
                </Button>
                </CardContent>
              </Card>

              <DialogContent className="sm:max-w-2xl bg-slate-950 border border-slate-800">
                <DialogHeader className="space-y-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <DialogTitle className="text-2xl font-semibold text-white">
                          Account history
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-400">
                          Review your previously claimed rewards for this vault.
                        </DialogDescription>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                          Claimed rewards
                        </p>
                        {renderSummaryValue(totalClaimed)}
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                          Unclaimed rewards
                        </p>
                        {renderSummaryValue(unclaimedTotal)}
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                          Total earned
                        </p>
                        {renderSummaryValue(totalEarned)}
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <Tabs defaultValue="rewards" className="space-y-4">
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="rewards">Reward history</TabsTrigger>
                  </TabsList>
                  <TabsContent value="rewards">
                    {historyEntries.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
                        No claimed rewards yet. Once you claim, your history will appear here.
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-800">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-900/60 text-slate-400">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                              <th className="px-4 py-3 text-left font-medium">Claim reward</th>
                              <th className="px-4 py-3 text-left font-medium">Txn</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historyEntries.map((entry) => (
                              <tr
                                key={`${entry.txHash}-${entry.timestamp}`}
                                className="border-t border-slate-800/80 text-slate-200"
                              >
                                <td className="px-4 py-3 font-medium">
                                  {formatHistoryTimestamp(entry.timestamp)}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2 font-semibold">
                                    <span>{formatHistoryAmount(entry.amount)}</span>
                                    <TokenIcon token={vault.reward} size="sm" />
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2 font-mono text-xs text-primary">
                                    {shortenHash(entry.txHash)}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-primary hover:text-primary-foreground hover:bg-primary/10"
                                      aria-label="View transaction (mock)"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
      
      <Footer
        totalTVL={totalTVL}
        totalYields={totalYields}
      />
    </div>
  );
}
