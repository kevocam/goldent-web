import { digits } from './format';

/** Celular peruano válido: 9 dígitos que empiezan en 9. */
export function isValidPeruMobile(phone: string | null | undefined): boolean {
  return /^9\d{8}$/.test(digits(phone));
}

export function whatsappUrl(phone: string, text?: string): string {
  const base = `https://wa.me/51${digits(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function telUrl(phone: string): string {
  return `tel:+51${digits(phone)}`;
}
