import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { SIGNED_URL_TTL, STORAGE_BUCKET } from '@/lib/constants';
import type { FileWithUrl } from '@/types/domain';

/** Archivos del paciente con signed URLs (1 h), del más reciente al más antiguo. */
export const getFiles = cache(async (patientId: string): Promise<FileWithUrl[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .order('page_number', { ascending: true });
  if (error) throw error;
  const files = data ?? [];
  if (files.length === 0) return [];

  const { data: signed } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrls(
      files.map((f) => f.storage_path),
      SIGNED_URL_TTL,
    );
  const urlByPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
  return files.map((f) => ({ ...f, url: urlByPath.get(f.storage_path) ?? null }));
});
