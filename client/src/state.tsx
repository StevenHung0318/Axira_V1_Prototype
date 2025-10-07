import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppState, Position, RewardToken, Vault } from '@shared/schema';
import { initialAppState, defaultTokenPrices, vaults } from './data';

interface AppContextType {
  state: AppState;
  connectWallet: () => void;
  disconnectWallet: () => void;
  deposit: (vaultId: string, amount: number) => void;
  withdraw: (vaultId: string, amount: number) => void;
  claimRewards: (vaultId: string) => void;
  updateAccrual: (vaultId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider(props: AppProviderProps): JSX.Element {
  const [state, setState] = useState<AppState>(initialAppState);

  const secondsInYear = 365 * 24 * 60 * 60;

  const accruePositionSnapshot = (
    position: Position,
    vault: Vault,
    rewardPrice: number,
    now: number
  ): Position => {
    const deltaSeconds = Math.max(0, (now - position.lastTs) / 1000);

    if (deltaSeconds <= 0 || position.principalUsdc <= 0) {
      return { ...position, lastTs: now };
    }

    const grossApr = vault.baseAprStableLayer + vault.naviSupplyApr;
    const totalAPR = grossApr * (1 - vault.performanceFeePct / 100);
    const usdPerSec =
      position.principalUsdc * (totalAPR / 100) / secondsInYear;

    if (usdPerSec <= 0) {
      return { ...position, lastTs: now };
    }

    const usdGain = usdPerSec * deltaSeconds;
    const tokenGain = rewardPrice > 0 ? usdGain / rewardPrice : 0;

    return {
      ...position,
      accruedUsd: position.accruedUsd + usdGain,
      accruedTokens: position.accruedTokens + tokenGain,
      lastTs: now,
    };
  };

  const createEmptyPosition = (timestamp: number): Position => ({
    principalUsdc: 0,
    accruedUsd: 0,
    accruedTokens: 0,
    lifetimeRewardTokens: 0,
    lastTs: timestamp,
  });

  const connectWallet = () => {
    setState(prev => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        connected: true,
        address: '0xKEL...KELTRA'
      }
    }));
  };

  const disconnectWallet = () => {
    setState(prev => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        connected: false,
        address: undefined
      }
    }));
  };

  const deposit = (vaultId: string, amount: number) => {
    const vault = vaults.find((v) => v.id === vaultId);
    if (!vault || state.wallet.usdc < amount) return;

    setState((prev) => {
      if (prev.wallet.usdc < amount) return prev;

      const now = Date.now();
      const rewardPrice = prev.settings[vault.reward];
      const previousPosition = prev.positions[vaultId];
      const basePosition = previousPosition
        ? accruePositionSnapshot(previousPosition, vault, rewardPrice, now)
        : createEmptyPosition(now);

      const updatedPosition: Position = {
        ...basePosition,
        principalUsdc: basePosition.principalUsdc + amount,
      };

      return {
        ...prev,
        wallet: {
          ...prev.wallet,
          usdc: prev.wallet.usdc - amount,
        },
        positions: {
          ...prev.positions,
          [vaultId]: updatedPosition,
        },
      };
    });
  };

  const withdraw = (vaultId: string, amount: number) => {
    const vault = vaults.find((v) => v.id === vaultId);
    const position = state.positions[vaultId];
    if (!vault || !position || position.principalUsdc < amount) return;

    setState((prev) => {
      const existingPosition = prev.positions[vaultId];
      if (!existingPosition || existingPosition.principalUsdc < amount) {
        return prev;
      }

      const now = Date.now();
      const rewardPrice = prev.settings[vault.reward];
      const accruedPosition = accruePositionSnapshot(
        existingPosition,
        vault,
        rewardPrice,
        now
      );

      const remainingPrincipal = accruedPosition.principalUsdc - amount;

      const nextPositions = { ...prev.positions };
      if (remainingPrincipal <= 0) {
        delete nextPositions[vaultId];
      } else {
        nextPositions[vaultId] = {
          ...accruedPosition,
          principalUsdc: remainingPrincipal,
        };
      }

      return {
        ...prev,
        wallet: {
          ...prev.wallet,
          usdc: prev.wallet.usdc + amount,
        },
        positions: nextPositions,
      };
    });
  };

  const claimRewards = (vaultId: string) => {
    const vault = vaults.find((v) => v.id === vaultId);
    const position = state.positions[vaultId];
    if (!vault || !position) return;

    setState((prev) => {
      const existingPosition = prev.positions[vaultId];
      if (!existingPosition) return prev;

      const now = Date.now();
      const rewardPrice = prev.settings[vault.reward];
      const accruedPosition = accruePositionSnapshot(
        existingPosition,
        vault,
        rewardPrice,
        now
      );

      if (accruedPosition.accruedTokens <= 0) {
        return {
          ...prev,
          positions: {
            ...prev.positions,
            [vaultId]: accruedPosition,
          },
        };
      }

      const grossTokens = accruedPosition.accruedTokens;
      const netTokens = grossTokens * (1 - vault.performanceFeePct / 100);

      return {
        ...prev,
        wallet: {
          ...prev.wallet,
          rewards: {
            ...prev.wallet.rewards,
            [vault.reward]: prev.wallet.rewards[vault.reward] + netTokens,
          },
        },
        positions: {
          ...prev.positions,
          [vaultId]: {
            ...accruedPosition,
            accruedUsd: 0,
            accruedTokens: 0,
            lifetimeRewardTokens:
              accruedPosition.lifetimeRewardTokens + netTokens,
            lastTs: now,
          },
        },
      };
    });
  };

  const updateAccrual = (vaultId: string) => {
    const vault = vaults.find((v) => v.id === vaultId);
    if (!vault) return;

    setState((prev) => {
      const existingPosition = prev.positions[vaultId];
      if (!existingPosition) return prev;

      const now = Date.now();
      const rewardPrice = prev.settings[vault.reward];
      const accruedPosition = accruePositionSnapshot(
        existingPosition,
        vault,
        rewardPrice,
        now
      );

      const changed =
        Math.abs(accruedPosition.accruedUsd - existingPosition.accruedUsd) >
          1e-8 ||
        Math.abs(
          accruedPosition.accruedTokens - existingPosition.accruedTokens
        ) > 1e-8 ||
        accruedPosition.lastTs !== existingPosition.lastTs;

      if (!changed) {
        return prev;
      }

      return {
        ...prev,
        positions: {
          ...prev.positions,
          [vaultId]: accruedPosition,
        },
      };
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const entries = Object.entries(prev.positions);
        if (entries.length === 0) {
          return prev;
        }

        const now = Date.now();
        let changed = false;
        const nextPositions: typeof prev.positions = { ...prev.positions };

        for (const [vaultId, position] of entries) {
          const vault = vaults.find((v) => v.id === vaultId);
          if (!vault) continue;

          const rewardPrice = prev.settings[vault.reward];
          const updated = accruePositionSnapshot(
            position,
            vault,
            rewardPrice,
            now
          );

          const diff =
            Math.abs(updated.accruedUsd - position.accruedUsd) > 1e-8 ||
            Math.abs(updated.accruedTokens - position.accruedTokens) > 1e-8 ||
            updated.lastTs !== position.lastTs;

          if (diff) {
            nextPositions[vaultId] = updated;
            changed = true;
          }
        }

        if (!changed) {
          return prev;
        }

        return {
          ...prev,
          positions: nextPositions,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const contextValue: AppContextType = {
    state,
    connectWallet,
    disconnectWallet,
    deposit,
    withdraw,
    claimRewards,
    updateAccrual
  };

  return (
    <AppContext.Provider value={contextValue}>
      {props.children}
    </AppContext.Provider>
  );
}
