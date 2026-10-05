'use client';

import { ExternalLink } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { ButtonAnchor } from '@/components/ui/button';
import { FILE_KIND } from '@/lib/constants';
import type { FileWithUrl } from '@/types/domain';

/** Visor a pantalla completa. El zoom es el nativo (pellizcar) de la tablet. */
export function FileViewer({ file, onClose }: { file: FileWithUrl | null; onClose: () => void }) {
  const title = file ? `${FILE_KIND[file.kind].label}${file.caption ? ` · ${file.caption}` : ''}` : '';
  const isImage = file?.mime_type?.startsWith('image/');

  return (
    <Dialog open={file !== null} onClose={onClose} title={title} hideTitle size="full">
      {file?.url ? (
        <div className="flex h-full flex-col">
          <div className="min-h-0 flex-1 overflow-auto [touch-action:pinch-zoom]">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- signed URL
              <img src={file.url} alt={title} className="mx-auto max-h-full max-w-full object-contain" />
            ) : (
              <iframe src={file.url} title={title} className="size-full border-0 bg-white" />
            )}
          </div>
          <div className="flex items-center gap-3 p-3 text-white">
            <span className="flex-1 text-[15px] font-bold">{title}</span>
            <ButtonAnchor href={file.url} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm">
              <ExternalLink className="size-[18px]" aria-hidden />
              Abrir original
            </ButtonAnchor>
          </div>
        </div>
      ) : (
        <p className="p-6 text-white">No se pudo cargar el archivo.</p>
      )}
    </Dialog>
  );
}
