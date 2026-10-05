/**
 * Compresión en el dispositivo antes de subir (spec F05): máx. 2000 px por lado,
 * WebP calidad 0,8. Una foto de 4 MB queda en ~300 KB.
 */
export interface CompressOptions {
  maxSide?: number;
  quality?: number;
}

export function scaledSize(width: number, height: number, maxSide: number): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxSide) return { width, height };
  const ratio = maxSide / longest;
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

export async function compressImage(file: File, { maxSide = 2000, quality = 0.8 }: CompressOptions = {}): Promise<Blob> {
  if (file.type === 'application/pdf') return file;
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const { width, height } = scaledSize(bitmap.width, bitmap.height, maxSide);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo procesar la imagen');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  if (!blob) throw new Error('No se pudo comprimir la imagen');
  return blob;
}
