/**
 * Notación FDI. Cada arcada se dibuja como [lado derecho del paciente, lado izquierdo],
 * tal como en design/screens/10-nueva-visita.html.
 */
export type Arch = { label: 'Superior' | 'Inferior'; right: string[]; left: string[] };

const n = (list: number[]) => list.map(String);

export const PERMANENT_ARCHES: Arch[] = [
  { label: 'Superior', right: n([18, 17, 16, 15, 14, 13, 12, 11]), left: n([21, 22, 23, 24, 25, 26, 27, 28]) },
  { label: 'Inferior', right: n([48, 47, 46, 45, 44, 43, 42, 41]), left: n([31, 32, 33, 34, 35, 36, 37, 38]) },
];

export const TEMPORARY_ARCHES: Arch[] = [
  { label: 'Superior', right: n([55, 54, 53, 52, 51]), left: n([61, 62, 63, 64, 65]) },
  { label: 'Inferior', right: n([85, 84, 83, 82, 81]), left: n([71, 72, 73, 74, 75]) },
];

/** Mismo criterio que el CHECK de la tabla treatments. */
export function isValidFdi(tooth: string): boolean {
  return /^([1-4][1-8]|[5-8][1-5])$/.test(tooth);
}

export function isTemporaryTooth(tooth: string): boolean {
  return /^[5-8]/.test(tooth);
}

/** "Pieza 46" o "General" (boca completa). */
export function toothLabel(tooth: string | null | undefined): string {
  return tooth ? `Pieza ${tooth}` : 'General';
}

/** ["15","24"] → "Piezas 15, 24" */
export function teethLabel(teeth: string[], wholeMouth: boolean): string {
  if (wholeMouth) return 'Boca completa';
  if (teeth.length === 0) return 'Ninguna pieza seleccionada';
  return `${teeth.length === 1 ? 'Pieza' : 'Piezas'} ${teeth.join(', ')}`;
}
