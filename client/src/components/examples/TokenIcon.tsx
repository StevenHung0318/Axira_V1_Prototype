import TokenIcon from '../TokenIcon';

export default function TokenIconExample() {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="flex flex-col items-center gap-2">
        <TokenIcon token="BTC" size="sm" />
        <span className="text-xs">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <TokenIcon token="SUI" size="md" />
        <span className="text-xs">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <TokenIcon token="ETH" size="lg" />
        <span className="text-xs">Large</span>
      </div>
    </div>
  );
}