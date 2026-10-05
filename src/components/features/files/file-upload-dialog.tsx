'use client';

import { useEffect, useMemo, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChipGroup } from '@/components/ui/chip';
import { Dialog } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { FileKind } from '@/types/domain';

const KIND_OPTIONS: { value: FileKind; label: string }[] = [
  { value: 'xray', label: 'Radiografía' },
  { value: 'photo', label: 'Foto intraoral' },
  { value: 'paper_record', label: 'Formato en papel' },
  { value: 'consent', label: 'Consentimiento' },
  { value: 'other', label: 'Otro' },
];

export interface FileUploadDialogProps {
  files: File[];
  onClose: () => void;
  onConfirm: (meta: { kind: FileKind; caption: string | null }) => void;
  uploading: boolean;
  progress: { done: number; total: number } | null;
}

/** Tras elegir/tomar fotos: tipo y descripción (ej. "Pieza 46 · inicial"). */
export function FileUploadDialog({ files, onClose, onConfirm, uploading, progress }: FileUploadDialogProps) {
  const [kind, setKind] = useState<FileKind>('xray');
  const [caption, setCaption] = useState('');
  const previews = useMemo(() => files.map((f) => (f.type.startsWith('image/') ? URL.createObjectURL(f) : null)), [files]);
  useEffect(() => () => previews.forEach((u) => u && URL.revokeObjectURL(u)), [previews]);

  return (
    <Dialog
      open={files.length > 0}
      onClose={uploading ? () => undefined : onClose}
      title={files.length === 1 ? 'Subir archivo' : `Subir ${files.length} archivos`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm({ kind, caption: caption.trim() || null })} loading={uploading}>
            {uploading ? null : <Upload className="size-5" aria-hidden />}
            {uploading && progress ? `Subiendo ${progress.done + 1} de ${progress.total}…` : 'Subir'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex gap-2 overflow-x-auto">
          {previews.map((url, i) =>
            url ? (
              // eslint-disable-next-line @next/next/no-img-element -- vista previa local
              <img key={i} src={url} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
            ) : (
              <span key={i} className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-paper text-xs font-extrabold text-ink-muted">
                PDF
              </span>
            ),
          )}
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="field-label">Tipo</span>
          <ChipGroup label="Tipo de archivo" options={KIND_OPTIONS} value={kind} onChange={(v) => v && setKind(v)} size="sm" />
        </div>
        <Field label="Descripción · opcional" htmlFor="caption">
          <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Ej. Pieza 46 · inicial" maxLength={200} />
        </Field>
      </div>
    </Dialog>
  );
}
