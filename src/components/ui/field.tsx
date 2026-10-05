import type { ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface FieldProps {
  label: ReactNode;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Envoltorio de label + control + mensaje (error o ayuda). */
export function Field({ label, htmlFor, required, error, hint, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="field-label">
        {label}
        {required ? ' *' : null}
      </label>
      {children}
      {error ? (
        <span role="alert" className="flex items-center gap-1.5 text-[13px] font-bold text-alert">
          <CircleAlert className="size-4 shrink-0" aria-hidden />
          {error}
        </span>
      ) : hint ? (
        <span className="text-[13px] font-bold">{hint}</span>
      ) : null}
    </div>
  );
}
