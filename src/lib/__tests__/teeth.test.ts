import { describe, expect, it } from 'vitest';
import { PERMANENT_ARCHES, TEMPORARY_ARCHES, isValidFdi, teethLabel, toothLabel } from '../teeth';

describe('teeth (FDI)', () => {
  it('valida igual que el CHECK de la base de datos', () => {
    ['11', '18', '46', '48', '51', '55', '85'].forEach((t) => expect(isValidFdi(t)).toBe(true));
    ['19', '10', '49', '56', '86', '9', '100', ''].forEach((t) => expect(isValidFdi(t)).toBe(false));
  });

  it('32 permanentes y 20 temporales, todos válidos', () => {
    const perm = PERMANENT_ARCHES.flatMap((a) => [...a.right, ...a.left]);
    const temp = TEMPORARY_ARCHES.flatMap((a) => [...a.right, ...a.left]);
    expect(new Set(perm).size).toBe(32);
    expect(new Set(temp).size).toBe(20);
    expect([...perm, ...temp].every(isValidFdi)).toBe(true);
  });

  it('etiquetas', () => {
    expect(toothLabel('46')).toBe('Pieza 46');
    expect(toothLabel(null)).toBe('General');
    expect(teethLabel(['15', '24'], false)).toBe('Piezas 15, 24');
    expect(teethLabel([], true)).toBe('Boca completa');
  });
});
