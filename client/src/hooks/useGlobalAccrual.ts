import { useEffect } from "react";
import { vaults } from "../data";
import type { Position, RewardToken, Vault } from "@shared/schema";

const secondsInYear = 365 * 24 * 60 * 60;

function accruePosition(
  position: Position,
  vault: Vault,
  rewardPrice: number,
  now: number
): Position {
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
}

export const useGlobalAccrual = (
  positions: Record<string, Position>,
  settings: Record<RewardToken, number>,
  setPositions: (updater: (prev: Record<string, Position>) => Record<string, Position>) => void
) => {
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prevPositions) => {
        const entries = Object.entries(prevPositions);
        if (entries.length === 0) {
          return prevPositions;
        }

        const now = Date.now();
        let changed = false;
        const nextPositions: typeof prevPositions = { ...prevPositions };

        for (const [vaultId, position] of entries) {
          const vault = vaults.find((v) => v.id === vaultId);
          if (!vault) continue;

          const rewardPrice = settings[vault.reward];
          const updated = accruePosition(position, vault, rewardPrice, now);

          const diff =
            Math.abs(updated.accruedUsd - position.accruedUsd) > 1e-8 ||
            Math.abs(updated.accruedTokens - position.accruedTokens) > 1e-8 ||
            updated.lastTs !== position.lastTs;

          if (diff) {
            nextPositions[vaultId] = updated;
            changed = true;
          }
        }

        return changed ? nextPositions : prevPositions;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [positions, settings, setPositions]);
};
