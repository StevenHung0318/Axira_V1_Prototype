import type { Vault, TokenPrices, AppState, RewardHistoryEntry } from '@shared/schema';

// Mock vault data
export const vaults: Vault[] = [
  {
    id: 'btcUSD',
    name: 'BTC Rewards Vault',
    reward: 'BTC',
    tvl: 60_312_450_987.45,
    depositCap: 118_540_000_123.12,
    deposited: 58_904_221_876.33,
    baseAprStableLayer: 17.8,
    naviSupplyApr: 3,
    performanceFeePct: 10,
    status: 'Live',
    contract: '0xabc...1321',
    dailyApr: [8.7, 9.1, 8.9, 9.0, 8.8, 9.2, 8.9, 9.0, 8.8, 9.1, 8.9, 8.7, 8.8]
  },
  {
    id: 'suiUSD',
    name: 'SUI Rewards Vault',
    reward: 'SUI',
    tvl: 31_784_910_554.87,
    depositCap: 59_432_118_765.2,
    deposited: 28_615_773_409.55,
    baseAprStableLayer: 18,
    naviSupplyApr: 4,
    performanceFeePct: 10,
    status: 'Live',
    contract: '0xdef...4567',
    dailyApr: [20, 21, 20.4, 19.8, 20.2, 20.1, 20.3]
  },
  {
    id: 'usdcUSD',
    name: 'USDC Rewards Vault',
    reward: 'USDC',
    tvl: 9_812_334_120.45,
    depositCap: 20_000_000_000.0,
    deposited: 8_902_114_556.12,
    baseAprStableLayer: 6.2,
    naviSupplyApr: 1.8,
    performanceFeePct: 5,
    status: 'Live',
    contract: '0x123...USDC',
    dailyApr: [4.9, 5.0, 5.1, 5.0, 4.8, 5.2, 5.0]
  },
  {
    id: 'ethUSD',
    name: 'ETH Rewards Vault',
    reward: 'ETH',
    tvl: 18_964_338_221.14,
    depositCap: 39_985_777_654.31,
    deposited: 12_938_440_182.77,
    baseAprStableLayer: 8,
    naviSupplyApr: 3,
    performanceFeePct: 10,
    status: 'Coming',
    contract: '0x789...8901',
    dailyApr: [10.1, 10.3, 10.0, 9.9, 10.2, 10.1, 10.4]
  }
];

export const defaultTokenPrices: TokenPrices = {
  BTC: 120_000,
  SUI: 4,
  ETH: 4_400,
  USDC: 1,
};

export const initialAppState: AppState = {
  wallet: {
    connected: false,
    usdc: 100_237_489_652.48, // Expanded USDC balance for massive mock flows
    rewards: {
      BTC: 851_245.387,
      SUI: 4_212_345_678.12,
      ETH: 1_802_934.55,
      USDC: 98_523_441.33,
    }
  },
  positions: {
    btcUSD: {
      principalUsdc: 99_842_315_678.27,
      accruedUsd: 5_083_441_275.92,
      accruedTokens: 42_362.0106327,
      lifetimeRewardTokens: 252_784.44,
      lastTs: Date.now(),
    },
    suiUSD: {
      principalUsdc: 100_488_902_345.81,
      accruedUsd: 3_118_774_523.64,
      accruedTokens: 779_693_630.91,
      lifetimeRewardTokens: 1_197_553_204.33,
      lastTs: Date.now(),
    },
    usdcUSD: {
      principalUsdc: 50_112_334_098.88,
      accruedUsd: 1_982_334_120.45,
      accruedTokens: 1_982_334_120.45,
      lifetimeRewardTokens: 9_112_334_556.03,
      lastTs: Date.now(),
    },
    ethUSD: {
      principalUsdc: 100_912_667_109.42,
      accruedUsd: 3_082_544_198.77,
      accruedTokens: 700_579.590401,
      lifetimeRewardTokens: 501_923.65,
      lastTs: Date.now(),
    },
  },
  settings: defaultTokenPrices
};

export const rewardHistories: Record<Vault["id"], RewardHistoryEntry[]> = {
  btcUSD: [
    { timestamp: "2025-09-26T10:06:42Z", amount: 0.0024, txHash: "0x9f4b...1af2" },
    { timestamp: "2025-09-26T09:44:21Z", amount: 0.0041, txHash: "0x4ac8...77ce" },
    { timestamp: "2025-09-22T15:55:27Z", amount: 0.0011, txHash: "0xb12d...c3f9" },
    { timestamp: "2025-09-22T10:18:03Z", amount: 0.0039, txHash: "0xe8aa...28b5" },
    { timestamp: "2025-09-18T19:02:11Z", amount: 0.0029, txHash: "0x6c05...ab97" },
    { timestamp: "2025-09-14T08:24:45Z", amount: 0.0031, txHash: "0xa91b...bd10" },
  ],
  suiUSD: [
    { timestamp: "2025-09-24T12:12:09Z", amount: 120.563, txHash: "0xc773...9bd3" },
    { timestamp: "2025-09-20T09:31:44Z", amount: 98.721, txHash: "0x312f...4bb2" },
    { timestamp: "2025-09-16T22:04:57Z", amount: 175.982, txHash: "0xd23a...aa61" },
    { timestamp: "2025-09-10T05:45:12Z", amount: 210.445, txHash: "0x98ac...be31" },
  ],
  usdcUSD: [
    { timestamp: "2025-09-23T16:30:52Z", amount: 154_239.42, txHash: "0x4e78...332a" },
    { timestamp: "2025-09-19T02:11:07Z", amount: 98_120.0, txHash: "0xff21...0efc" },
    { timestamp: "2025-09-15T11:08:19Z", amount: 112_504.88, txHash: "0x1f0a...dd54" },
    { timestamp: "2025-09-11T08:55:47Z", amount: 89_777.66, txHash: "0x6ca4...0b49" },
  ],
  ethUSD: [
    { timestamp: "2025-09-21T14:42:18Z", amount: 0.8123, txHash: "0x8bc4...a6f1" },
    { timestamp: "2025-09-17T07:29:05Z", amount: 0.6349, txHash: "0x13de...991c" },
    { timestamp: "2025-09-12T20:18:47Z", amount: 0.4511, txHash: "0x4b27...f66a" },
  ],
};

// Utility functions
export function calculateTotalAPR(vault: Vault): number {
  return (vault.baseAprStableLayer + vault.naviSupplyApr) * (1 - vault.performanceFeePct / 100);
}

export function calculateAverageAPR(dailyApr: number[]): number {
  return dailyApr.reduce((sum, apr) => sum + apr, 0) / dailyApr.length;
}

export function formatUSD(amount: number): string {
  const absolute = Math.abs(amount);
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  if (absolute >= 1_000_000_000) {
    return `$${formatter.format(amount / 1_000_000_000)}B`;
  }

  if (absolute >= 1_000_000) {
    return `$${formatter.format(amount / 1_000_000)}M`;
  }

  if (absolute >= 1_000) {
    return `$${formatter.format(amount / 1_000)}K`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTokenAmount(amount: number, decimals: number = 4): string {
  return amount.toFixed(decimals);
}
