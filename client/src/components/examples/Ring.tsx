import Ring from '../Ring';

export default function RingExample() {
  return (
    <div className="flex items-center gap-8 p-4">
      <div className="flex flex-col items-center gap-2">
        <Ring progress={43.4} />
        <span className="text-xs">43.4% filled</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Ring progress={94.5} />
        <span className="text-xs">94.5% filled</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Ring progress={78.2} size={80} />
        <span className="text-xs">Small size</span>
      </div>
    </div>
  );
}