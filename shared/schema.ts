import { z } from "zod";

// DeFi Vault Types
export type RewardToken = 'BTC' | 'SUI' | 'ETH' | 'USDC';

export type VaultStatus = 'Live' | 'Coming';

export interface Vault {
  id: 'btcUSD' | 'suiUSD' | 'ethUSD' | 'usdcUSD';
  name: string;
  reward: RewardToken;
  tvl: number; // USD
  depositCap: number; // USD
  deposited: number; // USD
  baseAprStableLayer: number;
  naviSupplyApr: number;
  performanceFeePct: number;
  status: VaultStatus;
  contract: string;
  dailyApr: number[];
}

export interface TokenPrices {
  BTC: number;
  SUI: number;
  ETH: number;
  USDC: number;
}

export interface WalletState {
  connected: boolean;
  address?: string;
  usdc: number;
  rewards: {
    BTC: number;
    SUI: number;
    ETH: number;
    USDC: number;
  };
}

export interface Position {
  principalUsdc: number;
  accruedUsd: number;
  accruedTokens: number;
  lifetimeRewardTokens: number;
  lastTs: number;
}

export interface RewardHistoryEntry {
  timestamp: string;
  amount: number;
  txHash: string;
}

export interface AppState {
  wallet: WalletState;
  positions: Record<string, Position>;
  settings: TokenPrices;
}

// Validation schemas
export const depositSchema = z.object({
  amount: z.number().min(0, "Amount must be positive"),
  vaultId: z.string(),
});

export type DepositInput = z.infer<typeof depositSchema>;
