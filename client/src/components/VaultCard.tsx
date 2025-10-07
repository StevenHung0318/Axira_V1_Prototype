import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TokenIcon from "./TokenIcon";
import Ring from "./Ring";
import type { Vault } from "@shared/schema";
import { formatUSD, calculateTotalAPR } from "../data";

interface VaultCardProps {
  vault: Vault;
  onDeposit: (vaultId: string) => void;
}

export default function VaultCard({ vault, onDeposit }: VaultCardProps) {
  const totalAPR = calculateTotalAPR(vault);
  const depositPercentage = (vault.deposited / vault.depositCap) * 100;
  const totalRewardsLabel: Record<Vault["id"], string> = {
    btcUSD: "2.3415 BTC",
    suiUSD: "2334 SUI",
    ethUSD: "0 ETH",
    usdcUSD: "9.11B USDC",
  };

  return (
    <Card className="hover-elevate" data-testid={`card-vault-${vault.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg text-white">{vault.name}</CardTitle>
          <Badge variant={vault.status === "Live" ? "default" : "secondary"}>
            {vault.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* APR with Token Icon */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Vault APR</span>
          <div className="flex items-center gap-2">
            <span
              className="text-2xl font-bold"
              data-testid={`text-apr-${vault.id}`}
            >
              {totalAPR.toFixed(1)}%
            </span>
            <TokenIcon token={vault.reward} size="sm" />
          </div>
        </div>

        {/* Total Earned Rewards */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Total earned rewards
          </span>
          <span
            className="font-medium text-white"
            data-testid={`text-earned-rewards-${vault.id}`}
          >
            {totalRewardsLabel[vault.id]}
          </span>
        </div>

        {/* Deposit Cap */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Deposit cap</span>
          <span
            className="font-medium"
            data-testid={`text-deposit-cap-${vault.id}`}
          >
            {formatUSD(vault.depositCap)} USDC
          </span>
        </div>

        {/* Ring Progress */}
        <div className="flex items-center justify-center py-4">
          <Ring progress={depositPercentage} size={100} />
        </div>

        {/* Action Button */}
        <Button
          className="w-full"
          disabled={vault.status !== "Live"}
          onClick={() => onDeposit(vault.id)}
          data-testid={`button-deposit-${vault.id}`}
        >
          {vault.status === "Live" ? "Deposit Now" : "Coming Soon"}
        </Button>
      </CardContent>
    </Card>
  );
}
