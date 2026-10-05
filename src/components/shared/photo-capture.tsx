'use client';

import { useEffect, useId, useMemo } from 'react';
import { Camera, Plus, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface CapturedPhoto {
  key: string;
  file: File;
}

export interface PhotoCaptureProps {
  photos: CapturedPhoto[];
  onAdd: (files: File[]) => void;
  onRemove: (key: string) => void;
  title?: string;
  hint?: string;
  /** Prefijo de cada miniatura: "Pág." → "Pág. 1". */
  itemLabel?: string;
  disabled?: boolean;
}

/**
 * Cámara trasera + miniaturas numeradas. Captura rápida y pestaña Archivos.
 * La compresión ocurre al subir (usePhotoUpload), no aquí.
 */
export function PhotoCapture({
  photos,
  onAdd,
  onRemove,
  title = 'Tomar foto del formato en papel',
  hint = 'Una foto por página',
  itemLabel = 'Pág.',
  disabled,
}: PhotoCaptureProps) {
  const inputId = useId();
  const previews = useMemo(() => photos.map((p) => ({ key: p.key, url: URL.createObjectURL(p.file) })), [photos]);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const input = (
    <input
      id={inputId}
      type="file"
      accept="image/*"
      capture="environment"
      multiple
      disabled={disabled}
      className="sr-only"
      onChange={(e) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length) onAdd(files);
        e.target.value = '';
      }}
    />
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      {input}
      {photos.length === 0 ? (
        <label
          htmlFor={inputId}
          className={cn(
            'flex min-h-[180px] flex-1 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[18px] border-2 border-dashed border-gold-500 bg-gold-25 p-4 text-center text-gold-900',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <span className="flex size-[72px] items-center justify-center rounded-full bg-gold-700 text-white">
            <Camera className="size-8" aria-hidden />
          </span>
          <span className="text-[17px] font-extrabold md:text-[19px]">{title}</span>
          <span className="text-sm font-semibold">{hint}</span>
        </label>
      ) : (
        <div className="flex flex-wrap gap-3 pt-2.5">
          {previews.map((p, i) => (
            <figure key={p.key} className="relative m-0 flex w-[104px] flex-col gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:) */}
              <img src={p.url} alt="" className="h-[120px] w-full rounded-xl border border-line-paper bg-paper object-cover" />
              <figcaption className="text-center text-[13px] font-bold">
                {itemLabel} {i + 1}
              </figcaption>
              <button
                type="button"
                aria-label={`Quitar ${itemLabel} ${i + 1}`}
                onClick={() => onRemove(p.key)}
                className="absolute -top-2.5 -right-2.5 flex size-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-ink text-white"
              >
                <X className="size-4" aria-hidden />
              </button>
            </figure>
          ))}
          <label
            htmlFor={inputId}
            className={cn(
              'flex h-[120px] w-[104px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-line bg-surface text-[13px] font-bold text-ink-muted',
              disabled && 'pointer-events-none opacity-50',
            )}
          >
            <Plus className="size-6" aria-hidden />
            Otra página
          </label>
        </div>
      )}
    </div>
  );
}
