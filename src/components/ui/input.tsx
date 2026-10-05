import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const base =
  'block w-full rounded-[14px] border-[1.5px] bg-surface text-ink font-semibold outline-none transition-[border-color,box-shadow] ' +
  'focus:border-gold-700 focus:ring-4 focus:ring-gold-500/20 disabled:bg-bg disabled:text-ink-muted';

const sizes = {
  md: 'h-14 px-4 text-[17px]',
  lg: 'h-[60px] px-[18px] text-lg',
};

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  invalid?: boolean;
  inputSize?: keyof typeof sizes;
  /** Texto fijo a la izquierda, ej. "+51". */
  prefix?: ReactNode;
  /** Contenido a la derecha, ej. "33 años". */
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, inputSize = 'md', prefix, suffix, className, ...props },
  ref,
) {
  const border = invalid ? 'border-alert focus:border-alert focus:ring-alert/15' : 'border-line';

  if (!prefix && !suffix) {
    return <input ref={ref} aria-invalid={invalid || undefined} className={cn(base, sizes[inputSize], border, className)} {...props} />;
  }

  return (
    <span
      className={cn(
        'flex w-full items-center overflow-hidden rounded-[14px] border-[1.5px] bg-surface transition-[border-color,box-shadow]',
        'focus-within:border-gold-700 focus-within:ring-4 focus-within:ring-gold-500/20',
        inputSize === 'lg' ? 'h-[60px]' : 'h-14',
        border,
        className,
      )}
    >
      {prefix ? (
        <span className="flex h-full items-center border-r-[1.5px] border-line bg-bg px-3.5 font-bold text-ink-muted">{prefix}</span>
      ) : null}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'h-full min-w-0 flex-1 border-0 bg-transparent font-semibold text-ink outline-none',
          inputSize === 'lg' ? 'px-4 text-[19px] font-bold' : 'px-3.5 text-[17px]',
        )}
        {...props}
      />
      {suffix ? <span className="flex shrink-0 items-center pr-2">{suffix}</span> : null}
    </span>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, rows = 3, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(base, 'resize-none px-4 py-3.5 text-base leading-relaxed', invalid ? 'border-alert' : 'border-line', className)}
      {...props}
    />
  );
});
