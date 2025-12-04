type Props = {
  steps: string[];
  activeIndex: number;
};

export function Stepper({ steps, activeIndex }: Props) {
  return (
    <ol className="flex items-center gap-3 text-xs">
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex;
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={[
                "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                isComplete
                  ? "bg-accent text-slate-950 border-accent"
                  : isActive
                  ? "border-accent text-accent"
                  : "border-slate-700 text-slate-500"
              ].join(" ")}
            >
              {index + 1}
            </span>
            <span
              className={
                isActive || isComplete
                  ? "text-slate-100"
                  : "text-slate-500"
              }
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}


