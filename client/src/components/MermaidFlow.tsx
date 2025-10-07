interface MermaidFlowProps {
  id?: string;
  rewardToken?: string;
}

export default function MermaidFlow({
  id = "strategy-flow",
}: MermaidFlowProps) {
  return (
    <div id={id} className="w-full" data-testid="mermaid-strategy-flow">
      <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/60 p-8 text-center">
        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-3 text-slate-300">
          <div className="inline-flex items-center rounded-full border border-slate-700/80 bg-slate-950/60 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">
            Coming Soon
          </div>
          <h3 className="text-lg font-semibold text-slate-200">Strategy Flow Visualization</h3>
          <p className="text-sm text-slate-400">
            Placeholder content for the Keltra strategy flow. Final diagram will appear here after design handoff.
          </p>
        </div>
      </div>
    </div>
  );
}
