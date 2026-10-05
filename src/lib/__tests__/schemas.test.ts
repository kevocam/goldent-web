import { describe, expect, it } from 'vitest';
import { patientSchema, quickCaptureSchema } from '../schemas/patient';
import { visitSchema } from '../schemas/visit';

const base = {
  first_names: ' Milagros ',
  last_names: 'Ccori Huanca',
  dni: '47205318',
  birth_date: '1992-11-09',
  phone: '965 418 203',
  email: '',
  address: '',
  occupation: 'Docente',
  marital_status: 'conviviente' as const,
  conditions: [],
};

describe('patientSchema (F04)', () => {
  it('normaliza y acepta un paciente válido', () => {
    const r = patientSchema.parse(base);
    expect(r.first_names).toBe('Milagros');
    expect(r.phone).toBe('965418203');
    expect(r.email).toBeNull();
    expect(r.address).toBeNull();
  });

  it('DNI y celular obligatorios con formato peruano', () => {
    const r = patientSchema.safeParse({ ...base, dni: '123', phone: '812345678' });
    expect(r.success).toBe(false);
    const paths = r.error!.issues.map((i) => i.path[0]);
    expect(paths).toContain('dni');
    expect(paths).toContain('phone');
  });

  it('rechaza fechas de nacimiento futuras', () => {
    expect(patientSchema.safeParse({ ...base, birth_date: '2999-01-01' }).success).toBe(false);
  });
});

describe('quickCaptureSchema (F05)', () => {
  it('DNI y celular opcionales (D-06)', () => {
    const r = quickCaptureSchema.parse({ first_names: 'Julio', last_names: 'Mamani', dni: '', phone: '', legacy_record_number: '' });
    expect(r.dni).toBeNull();
    expect(r.phone).toBeNull();
    expect(r.legacy_record_number).toBeNull();
  });

  it('si viene DNI, debe tener 8 dígitos', () => {
    expect(quickCaptureSchema.safeParse({ first_names: 'J', last_names: 'M', dni: '4296', phone: '' }).success).toBe(false);
  });
});

describe('visitSchema (F06)', () => {
  it('rechaza piezas que no son FDI', () => {
    const r = visitSchema.safeParse({
      visit_date: '2026-10-05',
      reason: '',
      notes: '',
      treatments: [{ serviceId: '00000000-0000-4000-8000-000000000001', teeth: ['19'], wholeMouth: false, status: 'done' }],
    });
    expect(r.success).toBe(false);
  });
});
