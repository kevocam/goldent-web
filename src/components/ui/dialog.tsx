'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './button';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Oculta el título visualmente (sigue disponible para lectores de pantalla). */
  hideTitle?: boolean;
  size?: 'sm' | 'md' | 'full';
  children: ReactNode;
  footer?: ReactNode;
}

/** Modal sobre <dialog> nativo: foco atrapado y Escape gratis. */
export function Dialog({ open, onClose, title, hideTitle, size = 'md', children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-label={title}
      className={cn(
        'm-auto max-h-[92dvh] rounded-[20px] border border-line-card bg-surface p-0 text-ink backdrop:bg-ink/45',
        size === 'sm' && 'w-[min(440px,calc(100vw-32px))]',
        size === 'md' && 'w-[min(560px,calc(100vw-32px))]',
        size === 'full' && 'h-[92dvh] w-[min(1100px,calc(100vw-32px))] bg-ink',
      )}
    >
      {open ? (
        <div className={cn('flex flex-col', size === 'full' ? 'h-full' : 'gap-5 p-6')}>
          <div className={cn('flex items-center gap-3', size === 'full' && 'p-3')}>
            <h2 className={cn('m-0 flex-1 text-xl font-extrabold', hideTitle && 'sr-only')}>{title}</h2>
            {hideTitle ? <span className="flex-1" /> : null}
            <Button variant={size === 'full' ? 'secondary' : 'ghost'} size="icon" aria-label="Cerrar" onClick={onClose}>
              <X className="size-6" aria-hidden />
            </Button>
          </div>
          <div className={cn(size === 'full' && 'min-h-0 flex-1')}>{children}</div>
          {footer ? <div className="flex justify-end gap-3">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'primary',
  loading,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="m-0 text-base leading-relaxed font-medium text-ink-muted">{description}</p>
    </Dialog>
  );
}
