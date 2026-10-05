import { formatPhone } from './format';
import { whatsappUrl } from './contact';

/**
 * Datos públicos del consultorio (landing, SEO). Lo que está en `null` todavía no
 * lo tenemos: la landing oculta esa parte en vez de mostrar un placeholder.
 */
export const CLINIC = {
  name: 'GOLDENT',
  fullName: 'GOLDENT Consultorio Odontológico',
  whatsapp: '930153135',
  address: 'Jr. Lampa 666',
  city: 'Puno',
  region: 'Puno',
  country: 'PE',
  /** Referencia para llegar, ej. "a media cuadra de…". */
  reference: null as string | null,
  geo: { lat: -15.8332177, lng: -70.0237885 },
  /** Ej. [{ days: 'Lunes a viernes', hours: '9:00 – 19:00' }, { days: 'Domingo', hours: 'Cerrado' }] */
  hours: null as { days: string; hours: string }[] | null,
  /** Ej. { name: 'Dra. Nombre Apellido', cop: '12345', bio: '…' } */
  doctor: null as { name: string; cop: string | null; bio: string | null } | null,
};

export const BOOKING_MESSAGE = 'Hola, quisiera reservar una cita en GOLDENT.';

export const clinicWhatsappUrl = (text = BOOKING_MESSAGE) => whatsappUrl(CLINIC.whatsapp, text);
export const clinicPhoneLabel = () => formatPhone(CLINIC.whatsapp);
export const clinicMapsUrl = () => `https://www.google.com/maps?q=${CLINIC.geo.lat},${CLINIC.geo.lng}`;
export const clinicMapsEmbedUrl = () => `https://www.google.com/maps?q=${CLINIC.geo.lat},${CLINIC.geo.lng}&z=18&output=embed`;
