import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ label, ...rest }: Props) {
  return (
    <label className="block text-xs font-medium text-slate-300 space-y-1">
      <span>{label}</span>
      <input className="input" {...rest} />
    </label>
  );
}


