import { ReactNode } from "react";

export function Card(props: { title?: string; subtitle?: string; children: ReactNode }) {
  const { title, subtitle, children } = props;
  return (
    <section className="card">
      {title && (
        <div className="mb-3">
          <h2 className="text-base font-semibold text-slate-50">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}


