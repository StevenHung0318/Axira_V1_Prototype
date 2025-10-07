import { formatUSD } from "../data";

interface FooterProps {
  totalTVL: number;
  totalYields: number;
}

export default function Footer({ totalTVL, totalYields }: FooterProps) {
  const millionsFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const tvlInMillions = `$${millionsFormatter.format(totalTVL / 1_000_000)}M`;

  return (
    <footer className="bg-muted border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-12">
          <div className="text-center">
            <div className="text-xl font-bold text-foreground" data-testid="text-total-tvl">
              {tvlInMillions}
            </div>
            <div className="text-sm text-muted-foreground">Total Value Locked</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-foreground" data-testid="text-total-yields">
              {formatUSD(totalYields)}
            </div>
            <div className="text-sm text-muted-foreground">Generated Yields</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
