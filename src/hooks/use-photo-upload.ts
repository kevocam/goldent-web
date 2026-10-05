'use client';

import { useCallback, useState } from 'react';
import { registerFile } from '@/lib/actions/files';
import { STORAGE_BUCKET } from '@/lib/constants';
import { compressImage } from '@/lib/images';
import { createClient } from '@/lib/supabase/client';
import { useClinic } from '@/components/shared/clinic-context';
import type { FileKind } from '@/types/domain';

export interface UploadMeta {
  patientId: string;
  kind: FileKind;
  caption?: string | null;
  visitId?: string | null;
  /** Numera las páginas (formato en papel). */
  numberPages?: boolean;
}

export interface UploadResult {
  uploaded: number;
  failed: File[];
}

/**
 * Sube fotos directo a Storage (las Server Actions tienen límite de tamaño):
 * 1. comprime a WebP · 2. sube a {clinic_id}/{patient_id}/{file_id}.webp · 3. registra en `files`.
 */
export function usePhotoUpload() {
  const { clinicId } = useClinic();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const upload = useCallback(
    async (files: File[], meta: UploadMeta): Promise<UploadResult> => {
      const supabase = createClient();
      const failed: File[] = [];
      setProgress({ done: 0, total: files.length });

      for (const [i, file] of files.entries()) {
        try {
          const blob = await compressImage(file);
          const id = crypto.randomUUID();
          const ext = blob.type === 'application/pdf' ? 'pdf' : 'webp';
          const path = `${clinicId}/${meta.patientId}/${id}.${ext}`;

          const { error: upErr } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(path, blob, { contentType: blob.type || 'image/webp', upsert: false });
          if (upErr) throw upErr;

          const res = await registerFile({
            id,
            patient_id: meta.patientId,
            kind: meta.kind,
            storage_path: path,
            mime_type: blob.type || 'image/webp',
            size_bytes: blob.size,
            page_number: meta.numberPages ? i + 1 : null,
            caption: meta.caption ?? null,
            visit_id: meta.visitId ?? null,
          });
          if (!res.ok) {
            await supabase.storage.from(STORAGE_BUCKET).remove([path]);
            throw new Error(res.error);
          }
        } catch {
          failed.push(file);
        }
        setProgress({ done: i + 1, total: files.length });
      }

      setProgress(null);
      return { uploaded: files.length - failed.length, failed };
    },
    [clinicId],
  );

  return { upload, progress, uploading: progress !== null };
}
