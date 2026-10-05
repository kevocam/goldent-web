'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { Camera, FolderOpen, Upload } from 'lucide-react';
import { buttonClasses } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { useToast } from '@/components/ui/toast';
import { EmptyState } from '@/components/shared/empty-state';
import { usePhotoUpload } from '@/hooks/use-photo-upload';
import { FILE_FILTERS, FILE_KIND } from '@/lib/constants';
import { formatLongDate, todayISO } from '@/lib/format';
import type { FileKind, FileWithUrl } from '@/types/domain';
import { FileThumbnail, fileDetail } from './file-thumbnail';
import { FileUploadDialog } from './file-upload-dialog';
import { FileViewer } from './file-viewer';

/** Ficha · Archivos: filtros por tipo, agrupación por fecha, subir y tomar foto. */
export function FilesTab({ patientId, files }: { patientId: string; files: FileWithUrl[] }) {
  const [filter, setFilter] = useState<FileKind | 'all'>('all');
  const [pending, setPending] = useState<File[]>([]);
  const [viewing, setViewing] = useState<FileWithUrl | null>(null);
  const { upload, uploading, progress } = usePhotoUpload();
  const router = useRouter();
  const toast = useToast();
  const cameraId = useId();
  const uploadId = useId();

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? []);
    if (list.length) setPending(list);
    e.target.value = '';
  };

  const confirm = async (meta: { kind: FileKind; caption: string | null }) => {
    const res = await upload(pending, { patientId, kind: meta.kind, caption: meta.caption, numberPages: meta.kind === 'paper_record' });
    setPending([]);
    if (res.failed.length) {
      toast({ title: `${res.failed.length} archivo(s) no se subieron`, description: 'Revisa la conexión e inténtalo otra vez.', tone: 'error' });
    } else {
      toast({ title: res.uploaded === 1 ? 'Archivo guardado' : `${res.uploaded} archivos guardados` });
    }
    router.refresh();
  };

  const actions = (
    <>
      <input id={uploadId} type="file" accept="image/*,application/pdf" multiple className="sr-only" onChange={pick} />
      <input id={cameraId} type="file" accept="image/*" capture="environment" className="sr-only" onChange={pick} />
      <label htmlFor={uploadId} className={buttonClasses('secondary', 'md')}>
        <Upload className="size-5" aria-hidden />
        Subir
      </label>
      <label htmlFor={cameraId} className={buttonClasses('primary', 'md')}>
        <Camera className="size-5" aria-hidden />
        Tomar foto
      </label>
    </>
  );

  const dialogs = (
    <>
      <FileUploadDialog files={pending} onClose={() => setPending([])} onConfirm={confirm} uploading={uploading} progress={progress} />
      <FileViewer file={viewing} onClose={() => setViewing(null)} />
    </>
  );

  if (files.length === 0) {
    return (
      <>
        <EmptyState
          icon={FolderOpen}
          tone="pink"
          title="Sin archivos"
          description="Agrega radiografías, fotos intraorales o el formato en papel."
          actions={<div className="flex flex-col gap-3 sm:flex-row-reverse">{actions}</div>}
        />
        {dialogs}
      </>
    );
  }

  const shown = filter === 'all' ? files : files.filter((f) => f.kind === filter);
  const groups = new Map<string, FileWithUrl[]>();
  shown.forEach((f) => {
    const day = todayISO(new Date(f.created_at));
    groups.set(day, [...(groups.get(day) ?? []), f]);
  });

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-wrap items-center gap-2.5">
        {FILE_FILTERS.map((f) => {
          const count = f.value === 'all' ? files.length : files.filter((x) => x.kind === f.value).length;
          return (
            <Chip key={f.value} size="sm" selected={filter === f.value} onClick={() => setFilter(f.value)}>
              {f.label}
              {f.value === 'all' || filter === f.value ? ` · ${count}` : null}
            </Chip>
          );
        })}
        <span className="flex-1" />
        <div className="flex gap-2.5">{actions}</div>
      </div>

      {[...groups.entries()].map(([day, items]) => {
        const paperPages = items.filter((i) => i.kind === 'paper_record').length;
        return (
          <section key={day} className="flex flex-col gap-2.5">
            <h3 className="m-0 text-sm font-extrabold tracking-[.04em] text-ink-muted uppercase">{formatLongDate(day)}</h3>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setViewing(f)}
                  aria-label={`Abrir ${FILE_KIND[f.kind].label}${fileDetail(f) ? `, ${fileDetail(f, paperPages)}` : ''}`}
                  className="flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-line-card bg-surface p-0 text-left"
                >
                  <FileThumbnail file={f} className="h-[120px] w-full" />
                  <span className="flex flex-col gap-0.5 px-3 py-2.5">
                    <span className="text-sm font-extrabold text-ink">{FILE_KIND[f.kind].label}</span>
                    <span className="text-[13px] font-semibold text-ink-muted">{fileDetail(f, paperPages) || ' '}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
      {dialogs}
    </div>
  );
}
