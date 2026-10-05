import { describe, expect, it } from 'vitest';
import { ageFrom, dayParts, formatDate, formatPhone, greeting, initials, recordDigits, todayISO } from '../format';
import { telUrl, whatsappUrl } from '../contact';

describe('format', () => {
  it('formatea celulares de 9 dígitos', () => {
    expect(formatPhone('951284736')).toBe('951 284 736');
    expect(formatPhone('951 284 736')).toBe('951 284 736');
    expect(formatPhone('12345')).toBe('12345');
  });

  it('calcula la edad en años cumplidos (hora de Lima)', () => {
    const now = new Date('2026-10-05T14:00:00Z');
    expect(ageFrom('1979-03-14', now)).toBe(47);
    expect(ageFrom('1992-11-09', now)).toBe(33);
    expect(ageFrom('1992-10-05', now)).toBe(34);
    expect(ageFrom(null, now)).toBeNull();
  });

  it('usa abreviaturas fijas de mes', () => {
    expect(formatDate('2026-09-28')).toBe('28 sep 2026');
    expect(dayParts('2026-07-22')).toEqual({ day: '22 jul', year: '2026' });
  });

  it('fecha de hoy en Lima, no en UTC', () => {
    // 03:00 UTC del 6 = 22:00 del 5 en Lima
    expect(todayISO(new Date('2026-10-06T03:00:00Z'))).toBe('2026-10-05');
  });

  it('saludo según la hora de Lima', () => {
    expect(greeting(new Date('2026-10-05T14:00:00Z'))).toBe('Buenos días'); // 9:00
    expect(greeting(new Date('2026-10-05T20:00:00Z'))).toBe('Buenas tardes'); // 15:00
    expect(greeting(new Date('2026-10-06T02:00:00Z'))).toBe('Buenas noches'); // 21:00
  });

  it('iniciales y número de historia', () => {
    expect(initials({ first_names: 'Rosa Elvira', last_names: 'Quispe Mamani' })).toBe('RQ');
    expect(recordDigits('HC-00248')).toBe('00248');
  });

  it('enlaces de contacto con prefijo +51', () => {
    expect(whatsappUrl('951 284 736')).toBe('https://wa.me/51951284736');
    expect(whatsappUrl('951284736', 'Hola, María')).toBe('https://wa.me/51951284736?text=Hola%2C%20Mar%C3%ADa');
    expect(telUrl('951284736')).toBe('tel:+51951284736');
  });
});
