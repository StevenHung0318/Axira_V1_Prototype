export function formatCompactNumber(value: number): string {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }

  if (absolute >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }

  if (absolute >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }

  return value.toFixed(2);
}

export function formatCompactCurrency(value: number): string {
  const sign = value < 0 ? -1 : 1;
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000_000) {
    return `$${((absolute / 1_000_000_000) * sign).toFixed(2)}B`;
  }

  if (absolute >= 1_000_000) {
    return `$${((absolute / 1_000_000) * sign).toFixed(2)}M`;
  }

  if (absolute >= 1_000) {
    return `$${((absolute / 1_000) * sign).toFixed(2)}K`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDetailedUSD(value: number, fractionDigits: number = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
