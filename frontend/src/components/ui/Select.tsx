import { SelectHTMLAttributes, ReactNode } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: ReactNode;
};

export function Select({ label, children, ...rest }: Props) {
  return (
    <label className="block text-xs font-medium text-slate-300 space-y-1">
      <span>{label}</span>
      <select
        className="input bg-slate-900 [&>option]:bg-slate-900 [&>option]:text-slate-50"
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}


