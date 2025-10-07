import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import Header from "../components/Header";
import VaultCard from "../components/VaultCard";
import TokenIcon from "../components/TokenIcon";
import type { RewardToken } from "@shared/schema";
import { vaults, formatUSD, calculateTotalAPR, rewardHistories } from "../data";
import { formatCompactCurrency, formatDetailedUSD } from "../lib/format";
import { useApp } from "../state";
import { PieChart, Pie, Cell, Label } from "recharts";
import { ExternalLink, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const tokenColorMap: Record<RewardToken, string> = {
  BTC: "#f97316",
  SUI: "#38bdf8",
  ETH: "#a855f7",
  USDC: "#0ea5e9",
};

const getTokenColor = (token: RewardToken) => tokenColorMap[token] ?? "#6366f1";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { state, connectWallet, disconnectWallet, claimRewards } = useApp();

  const totalTVL = vaults.reduce((sum, vault) => sum + vault.tvl, 0);
  const totalYields = 15_340_000; // 15.34M mock yields

  const handleDeposit = (vaultId: string) => {
    setLocation(`/vault/${vaultId}`);
  };

  const hasPositions = Object.keys(state.positions).length > 0;
  const [isGlobalHistoryOpen, setIsGlobalHistoryOpen] = useState(false);

  const vaultMap = useMemo(
    () => new Map<string, (typeof vaults)[number]>(vaults.map((vault) => [vault.id, vault])),
    []
  );

  const overview = useMemo(() => {
    const totals = new Map<
      string,
      {
        token: RewardToken;
        vaultName: string;
        value: number;
        vaultId: (typeof vaults)[number]["id"];
      }
    >();

    Object.entries(state.positions).forEach(([vaultId, position]) => {
      const vault = vaultMap.get(vaultId);
      if (!vault || position.principalUsdc <= 0) return;

      const existing = totals.get(vault.id);
      if (existing) {
        existing.value += position.principalUsdc;
      } else {
        totals.set(vault.id, {
          token: vault.reward,
          vaultName: vault.name,
          value: position.principalUsdc,
          vaultId: vault.id,
        });
      }
    });

    const slices = Array.from(totals.values()).map((item) => ({
      ...item,
      label: item.vaultName,
      color: getTokenColor(item.token),
    }));

    const totalValue = slices.reduce((sum, slice) => sum + slice.value, 0);

    const enrichedSlices = slices
      .map((slice) => ({
        ...slice,
        percentage: totalValue ? (slice.value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      totalValue,
      slices: enrichedSlices,
    };
  }, [state.positions, vaultMap]);

  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};

    overview.slices.forEach((slice) => {
      config[slice.label] = { label: slice.label, color: slice.color };
    });

    if (overview.slices.length === 0) {
      config.placeholder = { label: "Value", color: "#6366f1" };
    }

    return config;
  }, [overview]);

  const rewardsSummary = useMemo(() => {
    const totals = new Map<
      RewardToken,
      { token: RewardToken; usd: number; tokens: number; color: string }
    >();

    Object.entries(state.positions).forEach(([vaultId, position]) => {
      const vault = vaultMap.get(vaultId);
      if (!vault) return;

      const existing = totals.get(vault.reward);
      const target =
        existing ??
        {
          token: vault.reward,
          usd: 0,
          tokens: 0,
          color: getTokenColor(vault.reward),
        };

      target.usd += position.accruedUsd;
      target.tokens += position.accruedTokens;

      if (!existing) {
        totals.set(vault.reward, target);
      }
    });

    const entries = Array.from(totals.values()).sort((a, b) => b.usd - a.usd);
    const totalUsd = entries.reduce((sum, item) => sum + item.usd, 0);

    const enrichedEntries = entries.map((item) => ({
      ...item,
      percentage: totalUsd ? (item.usd / totalUsd) * 100 : 0,
    }));

    return {
      entries: enrichedEntries,
      totalUsd,
    };
  }, [state.positions, state.settings, vaultMap]);

  const combinedRewardHistory = useMemo(() => {
    const rows: Array<{
      timestamp: string;
      amount: number;
      txHash: string;
      token: RewardToken;
      vaultName: string;
    }> = [];
    const totals = new Map<RewardToken, number>();

    Object.entries(rewardHistories).forEach(([vaultId, entries]) => {
      const vault = vaultMap.get(vaultId);
      if (!vault) return;

      entries.forEach((entry) => {
        rows.push({
          ...entry,
          token: vault.reward,
          vaultName: vault.name,
        });
        totals.set(
          vault.reward,
          (totals.get(vault.reward) ?? 0) + entry.amount
        );
      });
    });

    rows.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const summary = Array.from(totals.entries()).map(([token, amount]) => ({
      token,
      amount,
    }));

    return { rows, summary };
  }, [vaultMap]);

  const formatHistoryAmount = (token: RewardToken, amount: number) => {
    if (token === "USDC") {
      return amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    const decimals = token === "SUI" ? 4 : 6;
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

  const formatTokenAmountLabel = (token: RewardToken, amount: number) =>
    `${formatHistoryAmount(token, amount)} ${token}`;

  const claimedRewardsUsd = combinedRewardHistory.summary.reduce((sum, item) => {
    const price =
      item.token === "USDC" ? 1 : state.settings[item.token] ?? 0;
    return sum + item.amount * price;
  }, 0);
  const unclaimedRewardsUsd = rewardsSummary.totalUsd;
  const totalEarnedRewardsUsd = claimedRewardsUsd + unclaimedRewardsUsd;
  const formatUsdcBase = (value: number) =>
    value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const hasClaimableRewards = rewardsSummary.totalUsd > 0;

  const handleClaimAllRewards = () => {
    const pendingClaims: Array<{
      vaultId: string;
      vault: (typeof vaults)[number];
      amount: number;
    }> = [];

    Object.entries(state.positions).forEach(([vaultId, position]) => {
      if (position.accruedTokens > 0) {
        const vault = vaultMap.get(vaultId);
        if (vault) {
          pendingClaims.push({
            vaultId,
            vault,
            amount: position.accruedTokens,
          });
        }
      }
    });

    if (pendingClaims.length === 0) {
      toast({
        title: "Nothing to claim",
        description: "You have no unclaimed rewards right now.",
        variant: "destructive",
      });
      return;
    }

    const aggregated = new Map<RewardToken, number>();

    pendingClaims.forEach(({ vaultId, vault, amount }) => {
      claimRewards(vaultId);
      const net = amount * (1 - vault.performanceFeePct / 100);
      aggregated.set(vault.reward, (aggregated.get(vault.reward) ?? 0) + net);
    });

    const summary = Array.from(aggregated.entries())
      .map(([token, total]) => formatTokenAmountLabel(token, total))
      .join(" • ");

    toast({
      title: "Rewards claimed",
      description: `Claimed from ${pendingClaims.length} vault${
        pendingClaims.length > 1 ? "s" : ""
      }: ${summary}`,
    });
  };

  const handleClaimSingle = (
    vaultId: string,
    vault: (typeof vaults)[number],
    amount: number
  ) => {
    if (amount <= 0) {
      toast({
        title: "No rewards to claim",
        description: `You have no ${vault.reward} rewards ready in ${vault.name}.`,
        variant: "destructive",
      });
      return;
    }

    claimRewards(vaultId);
    const net = amount * (1 - vault.performanceFeePct / 100);
    toast({
      title: "Rewards claimed",
      description: `Claimed ${formatTokenAmountLabel(
        vault.reward,
        net
      )} from ${vault.name} after ${vault.performanceFeePct}% fee.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isConnected={state.wallet.connected}
        walletAddress={state.wallet.address}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />

      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Hero Section with Slogan */}
        <section className="text-center mb-8 md:mb-16 py-8 md:py-16 space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text text-transparent leading-tight">
            Earn without fear.
          </h1>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-300 bg-clip-text text-transparent leading-tight">
            Grow alongside the assets you believe in.
          </h1>
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-800/60 bg-slate-900/70 p-5 shadow-lg shadow-purple-500/10 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                Total Value Locked
              </p>
              <p className="mt-2 text-3xl font-bold text-white">
                {formatCompactCurrency(totalTVL)}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Across all Keltra strategies.
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-500/40 bg-emerald-600/10 p-5 shadow-lg shadow-emerald-500/20 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">
                Generated Yields
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-200">
                {formatCompactCurrency(totalYields)}
              </p>
              <p className="mt-1 text-sm text-emerald-200/80">
                Lifetime distributed to Keltra depositors.
              </p>
            </div>
          </div>
        </section>

        <Tabs defaultValue="vaults" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vaults">All Vaults</TabsTrigger>
            <TabsTrigger value="positions">Your Positions</TabsTrigger>
          </TabsList>

          <TabsContent value="vaults" className="space-y-8">
            {/* Featured Vault Cards */}
            <section className="mb-12">
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6 md:mb-8">
                <img
                  src="https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png"
                  alt="USDC"
                  className="w-6 h-6 md:w-8 md:h-8"
                />
                <h2
                  className="text-xl md:text-3xl font-bold text-muted-foreground"
                  data-testid="text-featured-vaults"
                >
                  USDC Vaults
                </h2>
                <Badge
                  variant="info"
                  data-testid="badge-low-risk"
                  className="text-xs md:text-sm"
                >
                  Low Risk
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {vaults.map((vault) => (
                  <VaultCard
                    key={vault.id}
                    vault={vault}
                    onDeposit={handleDeposit}
                  />
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="positions" className="space-y-6">
            {!hasPositions ? (
              <Card>
                <CardHeader>
                  <CardTitle>Your Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center text-muted-foreground">
                    You haven't opened any positions yet. Start by depositing in
                    one of the vaults above.
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Overview</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Allocation of your deposits
                      </p>
                    </CardHeader>
                    <CardContent className="grid items-center gap-6 lg:grid-cols-[minmax(0,240px)_1fr]">
                      {overview.slices.length ? (
                        <ChartContainer
                          config={chartConfig}
                          className="mx-auto aspect-square h-64 max-w-sm"
                        >
                          <PieChart>
                            <Pie
                              data={overview.slices}
                              dataKey="value"
                              nameKey="token"
                              innerRadius={70}
                              outerRadius={96}
                              stroke="#0f172a"
                              strokeWidth={4}
                            >
                              <Label
                                position="center"
                                content={({ viewBox }) => {
                                  if (!viewBox || !("cx" in viewBox)) {
                                    return null;
                                  }

                                  const { cx, cy } = viewBox as { cx: number; cy: number };

                                  return (
                                    <g>
                                      <text
                                        x={cx}
                                        y={cy - 12}
                                        textAnchor="middle"
                                        fill="#94a3b8"
                                        fontSize={12}
                                      >
                                        Total Value
                                      </text>
                                      <text
                                        x={cx}
                                        y={cy + 12}
                                        textAnchor="middle"
                                        fill="#f8fafc"
                                        fontSize={20}
                                        fontWeight={600}
                                      >
                                        {formatUSD(overview.totalValue)}
                                      </text>
                                    </g>
                                  );
                                }}
                              />
                              {overview.slices.map((slice) => (
                                <Cell key={slice.token} fill={slice.color} />
                              ))}
                            </Pie>
                            <ChartTooltip
                              cursor={false}
                              content={
                                <ChartTooltipContent
                                  hideLabel
                                  formatter={(value, name) => [
                                    formatUSD(value as number),
                                    name,
                                  ]}
                                />
                              }
                            />
                          </PieChart>
                        </ChartContainer>
                      ) : (
                        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-700 text-sm text-slate-500">
                          Add positions to see your allocation
                        </div>
                      )}
                      <div className="space-y-4">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-muted-foreground">
                            Total value
                          </span>
                          <span className="text-2xl font-semibold text-slate-100">
                            {formatCompactCurrency(overview.totalValue)}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {overview.slices.map((slice) => (
                            <div
                              key={slice.token}
                              className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/60 px-3 py-2.5"
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: slice.color }}
                                />
                                <div>
                                  <p className="text-sm font-medium text-slate-100">
                                    {slice.label}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {formatCompactCurrency(slice.value)}
                                  </p>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-slate-300">
                                {slice.percentage.toFixed(1)}%
                              </span>
                            </div>
                          ))}
                          {!overview.slices.length && (
                            <p className="text-sm text-slate-400">
                              Build a position to unlock personalized analytics.
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Dialog
                    open={isGlobalHistoryOpen}
                    onOpenChange={setIsGlobalHistoryOpen}
                  >
                    <Card>
                      <CardHeader className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <CardTitle>Rewards</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Track unclaimed incentive balances
                          </p>
                        </div>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="inline-flex items-center gap-2"
                            data-testid="button-global-reward-history"
                          >
                            <History className="h-4 w-4" />
                            History
                          </Button>
                        </DialogTrigger>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-muted-foreground">
                            Unclaimed total
                          </span>
                          <span className="text-2xl font-semibold text-slate-100">
                            {formatCompactCurrency(rewardsSummary.totalUsd)}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {rewardsSummary.entries.length ? (
                            rewardsSummary.entries.map((entry) => (
                              <div
                                key={entry.token}
                                className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/60 px-4 py-3"
                              >
                                <div className="flex items-center gap-3">
                                  <TokenIcon token={entry.token} size="md" />
                                  <div className="space-y-0.5">
                                    <p className="text-sm font-medium text-slate-100">
                                      {entry.token}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      {formatCompactCurrency(entry.usd)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-slate-100">
                                    {entry.tokens >= 1
                                      ? entry.tokens.toFixed(2)
                                      : entry.tokens.toFixed(4)}{" "}
                                    {entry.token}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {entry.percentage.toFixed(1)}% of total
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-xl border border-dashed border-slate-700/60 bg-slate-900/50 px-4 py-10 text-center text-sm text-slate-400">
                              Your rewards will appear here as they accrue.
                            </div>
                          )}
                        </div>
                        <Button
                          className="w-full"
                          onClick={handleClaimAllRewards}
                          disabled={!hasClaimableRewards}
                        >
                          Claim all
                        </Button>
                      </CardContent>
                    </Card>

                    <DialogContent className="sm:max-w-3xl bg-slate-950 border border-slate-800">
                      <DialogHeader className="space-y-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <DialogTitle className="text-2xl font-semibold text-white">
                                Account history
                              </DialogTitle>
                              <DialogDescription className="text-sm text-slate-400">
                                Review every reward claim across your Keltra vaults.
                              </DialogDescription>
                            </div>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                                Claimed rewards
                              </p>
                              <p className="mt-2 text-lg font-semibold text-white">
                                {formatDetailedUSD(claimedRewardsUsd)}
                              </p>
                            </div>
                            <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                                Unclaimed rewards
                              </p>
                              <p className="mt-2 text-lg font-semibold text-white">
                                {formatDetailedUSD(unclaimedRewardsUsd)}
                              </p>
                            </div>
                            <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                                Total earned
                              </p>
                              <p className="mt-2 text-lg font-semibold text-white">
                                {formatDetailedUSD(totalEarnedRewardsUsd)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {combinedRewardHistory.summary.map((item) => (
                              <div
                                key={item.token}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-white"
                              >
                                <TokenIcon token={item.token} size="sm" />
                                <span>
                                  {formatHistoryAmount(
                                    item.token,
                                    item.amount
                                  )}{" "}
                                  {item.token}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </DialogHeader>

                      <Tabs defaultValue="rewards" className="space-y-4">
                        <TabsList className="w-full sm:w-auto">
                          <TabsTrigger value="rewards">
                            Reward history
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="rewards">
                          {combinedRewardHistory.rows.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
                              No claimed rewards yet. Start depositing to build
                              your history.
                            </div>
                          ) : (
                            <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-800">
                              <table className="w-full text-sm">
                                <thead className="bg-slate-900/60 text-slate-400">
                                  <tr>
                                    <th className="px-4 py-3 text-left font-medium">
                                      Timestamp
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                      Vault
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                      Claim reward
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                      Txn
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {combinedRewardHistory.rows.map((row) => (
                                    <tr
                                      key={`${row.txHash}-${row.timestamp}`}
                                      className="border-t border-slate-800/80 text-slate-200"
                                    >
                                      <td className="px-4 py-3 font-medium">
                                        {formatHistoryTimestamp(
                                          row.timestamp
                                        )}
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                          <TokenIcon
                                            token={row.token}
                                            size="sm"
                                          />
                                          <span>{row.vaultName}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 font-semibold">
                                          <span>
                                            {formatHistoryAmount(
                                              row.token,
                                              row.amount
                                            )}
                                          </span>
                                          <TokenIcon
                                            token={row.token}
                                            size="sm"
                                          />
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 font-mono text-xs text-primary">
                                          {shortenHash(row.txHash)}
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
                <Card>
                  <CardHeader>
                    <CardTitle>Your Positions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Vault</th>
                            <th className="text-left py-3 px-4">Vault APR</th>
                            <th className="text-left py-3 px-4">Your Deposit (USDC)</th>
                            <th className="text-left py-3 px-4">Your Unclaimed Rewards</th>
                            <th className="text-left py-3 px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(state.positions).map(
                            ([vaultId, position]) => {
                              const vault = vaultMap.get(vaultId);
                              if (!vault) return null;

                              const totalAPR = calculateTotalAPR(vault);
                              const claimableTokens = position.accruedTokens;

                              return (
                                <tr
                                  key={vaultId}
                                  className="border-b hover-elevate"
                                  data-testid={`row-position-${vaultId}`}
                                >
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      <TokenIcon token={vault.reward} size="sm" />
                                      <span className="font-medium">
                                        {vault.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium text-white">
                                        {totalAPR.toFixed(1)}%
                                      </span>
                                      <TokenIcon token={vault.reward} size="sm" />
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-white font-medium">
                                    {formatUsdcBase(position.principalUsdc)} USDC
                                  </td>
                                  <td className="py-3 px-4 text-white font-medium">
                                    {claimableTokens.toFixed(4)} {vault.reward}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleClaimSingle(
                                            vaultId,
                                            vault,
                                            claimableTokens
                                          )
                                        }
                                        disabled={position.accruedTokens === 0}
                                        data-testid={`button-claim-${vaultId}`}
                                      >
                                        Claim
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          setLocation(`/vault/${vaultId}`)
                                        }
                                        data-testid={`button-manage-${vaultId}`}
                                      >
                                        Manage
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            },
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

    </div>
  );
}
