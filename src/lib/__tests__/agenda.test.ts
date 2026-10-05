import { describe, expect, it } from 'vitest';
import {
  addDays,
  agendaHref,
  dayTitle,
  durationLabel,
  findOverlap,
  formatTime12,
  freeGaps,
  layoutLanes,
  limaDate,
  limaTime,
  nextHalfHour,
  reminderMessage,
  slotOf,
  toTimestamp,
  visibleHours,
  weekDays,
  weekStart,
  weekTitle,
} from '../agenda';
import { appointmentSchema } from '../schemas/appointment';

describe('agenda · fechas', () => {
  it('la semana empieza el lunes (también si la fecha es domingo)', () => {
    expect(weekStart('2026-10-05')).toBe('2026-10-05'); // lunes
    expect(weekStart('2026-10-10')).toBe('2026-10-05'); // sábado
    expect(weekStart('2026-10-11')).toBe('2026-10-05'); // domingo
    expect(weekDays('2026-10-08')).toEqual(['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10']);
    expect(weekDays('2026-10-08', true)).toHaveLength(7);
  });

  it('suma días cruzando mes y año', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('títulos de semana y día', () => {
    expect(weekTitle(weekDays('2026-10-05'))).toBe('5 – 10 oct 2026');
    expect(weekTitle(weekDays('2026-09-30'))).toBe('28 sep – 3 oct 2026');
    expect(weekTitle(weekDays('2025-12-31'))).toBe('29 dic 2025 – 3 ene 2026');
    expect(dayTitle('2026-10-05', '2026-10-05')).toBe('Hoy · lunes 5 de octubre');
    expect(dayTitle('2026-10-06', '2026-10-05')).toBe('Mañana · martes 6 de octubre');
    expect(dayTitle('2026-10-08', '2026-10-05')).toBe('Jueves 8 de octubre');
  });

  it('guarda en hora de Lima (UTC-5) y lee de vuelta igual', () => {
    const ts = toTimestamp('2026-10-05', '16:00');
    expect(ts).toBe('2026-10-05T16:00:00-05:00');
    expect(new Date(ts).toISOString()).toBe('2026-10-05T21:00:00.000Z');
    // Lo que devuelve Postgres viene en UTC
    expect(limaDate('2026-10-06T02:30:00+00:00')).toBe('2026-10-05');
    expect(limaTime('2026-10-06T02:30:00+00:00')).toBe('21:30');
  });

  it('hora y duración legibles', () => {
    expect(formatTime12('16:00')).toBe('4:00 p. m.');
    expect(formatTime12('09:30')).toBe('9:30 a. m.');
    expect(formatTime12('12:15')).toBe('12:15 p. m.');
    expect(formatTime12('00:05')).toBe('12:05 a. m.');
    expect(durationLabel(45)).toBe('45 min');
    expect(durationLabel(60)).toBe('1 h');
    expect(durationLabel(90)).toBe('1 h 30');
  });

  it('slotOf usa 30 min por defecto si no hay hora de fin', () => {
    expect(slotOf({ starts_at: '2026-10-05T14:00:00Z', ends_at: null })).toEqual({ date: '2026-10-05', time: '09:00', start: 540, end: 570, duration: 30 });
    expect(slotOf({ starts_at: '2026-10-05T16:30:00Z', ends_at: '2026-10-05T17:30:00Z' }).duration).toBe(60);
  });

  it('próxima media hora en Lima', () => {
    expect(nextHalfHour(new Date('2026-10-05T15:10:00Z'))).toBe('10:30'); // 10:10 Lima
    expect(nextHalfHour(new Date('2026-10-05T15:30:00Z'))).toBe('11:00'); // 10:30 exactas → siguiente
  });
});

describe('agenda · horarios', () => {
  const slots = [
    { id: 'a', start: 540, end: 585 }, // 9:00–9:45
    { id: 'b', start: 690, end: 750 }, // 11:30–12:30
  ];

  it('detecta cruces y permite citas pegadas', () => {
    expect(findOverlap(slots, 570, 600)?.id).toBe('a');
    expect(findOverlap(slots, 585, 615)).toBeNull(); // empieza cuando termina la otra
    expect(findOverlap(slots, 600, 690)).toBeNull();
    expect(findOverlap(slots, 540, 585, 'a')).toBeNull(); // reprogramar la misma
  });

  it('huecos libres de al menos 30 min dentro del horario', () => {
    expect(freeGaps(slots)).toEqual([
      { start: 480, end: 540 },
      { start: 585, end: 690 },
      { start: 750, end: 1200 },
    ]);
    expect(freeGaps(slots, 600)).toEqual([
      { start: 600, end: 690 },
      { start: 750, end: 1200 },
    ]);
    expect(freeGaps([], 21 * 60)).toEqual([]);
  });

  it('carriles para citas que se cruzan', () => {
    const lanes = layoutLanes([
      { start: 540, end: 600 },
      { start: 570, end: 630 },
      { start: 700, end: 730 },
    ]);
    expect(lanes.map((l) => [l.lane, l.lanes])).toEqual([
      [0, 2],
      [1, 2],
      [0, 1],
    ]);
  });

  it('amplía la grilla si hay citas fuera de 8–20', () => {
    expect(visibleHours(slots)).toEqual({ start: 8, end: 20 });
    expect(visibleHours([{ start: 7 * 60 + 30, end: 21 * 60 + 15 }])).toEqual({ start: 7, end: 22 });
  });
});

describe('agenda · recordatorio y URLs', () => {
  it('arma el mensaje de WhatsApp con hoy / mañana / fecha', () => {
    expect(reminderMessage({ firstName: 'María', date: '2026-10-05', time: '16:00', today: '2026-10-05' })).toBe(
      'Hola, María. Le recordamos su cita en GOLDENT Consultorio Odontológico hoy lunes 5 de octubre a las 4:00 p. m. ' +
        'Responda SÍ para confirmar o escríbanos si necesita cambiar la hora. ¡Gracias!',
    );
    expect(reminderMessage({ firstName: 'Rosa', date: '2026-10-06', time: '10:30', today: '2026-10-05' })).toContain('mañana martes 6 de octubre a las 10:30 a. m.');
    expect(reminderMessage({ firstName: 'Rosa', date: '2026-10-08', time: '10:30', today: '2026-10-05' })).toContain('el jueves 8 de octubre');
  });

  it('agendaHref solo incluye lo que se pasa', () => {
    expect(agendaHref()).toBe('/agenda');
    expect(agendaHref({ vista: 'dia', fecha: '2026-10-05', nueva: true, hora: '12:30' })).toBe('/agenda?vista=dia&fecha=2026-10-05&nueva=1&hora=12%3A30');
  });
});

describe('appointmentSchema', () => {
  const ok = { patient_id: '3f1c2b9e-8d4a-4c3b-9a2e-1f0e5d6c7b8a', date: '2026-10-08', time: '10:30', duration: 45, reason: ' Control ' };

  it('acepta una cita válida y limpia el motivo', () => {
    const r = appointmentSchema.parse(ok);
    expect(r.reason).toBe('Control');
    expect(r.notes).toBeNull();
    expect(appointmentSchema.parse({ ...ok, reason: '' }).reason).toBeNull();
  });

  it('rechaza paciente, fecha, hora o duración inválidos', () => {
    expect(appointmentSchema.safeParse({ ...ok, patient_id: '' }).success).toBe(false);
    expect(appointmentSchema.safeParse({ ...ok, date: '2026-13-40' }).success).toBe(false);
    expect(appointmentSchema.safeParse({ ...ok, time: '25:00' }).success).toBe(false);
    expect(appointmentSchema.safeParse({ ...ok, duration: 5 }).success).toBe(false);
  });
});
