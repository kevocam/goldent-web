import { FILE_KIND } from '@/lib/constants';
import { cn } from '@/lib/cn';
import type { FileWithUrl } from '@/types/domain';

/** Miniatura: imagen real si hay URL; si no, el bloque de color del diseño (RX oscuro, foto rosa, papel crema). */
export function FileThumbnail({ file, className, label }: { file: FileWithUrl; className?: string; label?: string }) {
  const kind = FILE_KIND[file.kind];
  const isImage = file.url && file.mime_type?.startsWith('image/');
  return (
    <span className={cn('relative flex items-center justify-center overflow-hidden', kind.className, className)}>
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- signed URL de Supabase, no pasa por next/image
        <img src={file.url!} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      ) : label ? null : (
        <span className="text-[13px] font-extrabold tracking-[.08em]">{kind.tag}</span>
      )}
      {label ? (
        <span
          className={cn(
            'absolute inset-x-0 bottom-0 px-2 pt-4 pb-1.5 text-xs font-bold',
            isImage ? 'bg-gradient-to-t from-black/55 to-transparent text-white' : 'text-current',
          )}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}

/** "Pieza 46 · inicial", "Página 1 de 2", fecha. */
export function fileDetail(file: FileWithUrl, pagesInGroup?: number): string {
  if (file.kind === 'paper_record' && file.page_number) {
    return pagesInGroup ? `Página ${file.page_number} de ${pagesInGroup}` : `Página ${file.page_number}`;
  }
  return file.caption ?? '';
}
