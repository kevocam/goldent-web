/**
 * Texto de una alerta médica. Mismo criterio que public.patient_card() en la DB:
 * alergia con detalle → "Alergia: penicilina"; el resto, la etiqueta del catálogo.
 */
export function alertLabel(code: string, label: string, detail: string | null): string {
  if (code === 'allergy' && detail) return `Alergia: ${detail}`;
  return label;
}
