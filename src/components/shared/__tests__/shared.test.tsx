import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { ContactActions } from '../contact-actions';
import { MedicalAlerts } from '../medical-alerts';
import { ToothPicker } from '../tooth-picker';
import { ConditionToggle } from '@/components/features/patient-form/condition-toggle';

describe('MedicalAlerts', () => {
  it('muestra cada alerta', () => {
    render(<MedicalAlerts alerts={['Alergia: penicilina', 'Diabetes']} />);
    expect(screen.getByText('Alergia: penicilina')).toBeInTheDocument();
    expect(screen.getByText('Diabetes')).toBeInTheDocument();
  });

  it('modo compacto: más de 2 → "N alertas"', () => {
    render(<MedicalAlerts alerts={['A', 'B', 'C']} compact />);
    expect(screen.getByText('3 alertas')).toBeInTheDocument();
  });

  it('no renderiza nada sin alertas', () => {
    const { container } = render(<MedicalAlerts alerts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('ContactActions', () => {
  it('arma los enlaces de WhatsApp y llamada', () => {
    render(<ContactActions phone="951284736" name="Rosa" />);
    expect(screen.getByText('WhatsApp').closest('a')).toHaveAttribute('href', 'https://wa.me/51951284736');
    expect(screen.getByText('Llamar').closest('a')).toHaveAttribute('href', 'tel:+51951284736');
  });

  it('se deshabilita sin celular', () => {
    render(<ContactActions phone={null} name="Rosa" />);
    const wa = screen.getByText('WhatsApp').closest('a')!;
    expect(wa).not.toHaveAttribute('href');
    expect(wa).toHaveAttribute('aria-disabled', 'true');
  });
});

function PickerHarness({ onChange }: { onChange: (t: string[]) => void }) {
  const [teeth, setTeeth] = useState<string[]>([]);
  const [whole, setWhole] = useState(false);
  return (
    <ToothPicker
      value={teeth}
      onChange={(t) => {
        setTeeth(t);
        onChange(t);
      }}
      wholeMouth={whole}
      onWholeMouthChange={setWhole}
    />
  );
}

describe('ToothPicker', () => {
  it('permite elegir varias piezas y muestra el resumen', () => {
    const onChange = vi.fn();
    render(<PickerHarness onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pieza 15' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pieza 24' }));
    expect(onChange).toHaveBeenLastCalledWith(['15', '24']);
    expect(screen.getByText('Piezas 15, 24')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pieza 15' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('boca completa limpia las piezas', () => {
    const onChange = vi.fn();
    render(<PickerHarness onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pieza 46' }));
    fireEvent.click(screen.getByText('Sin pieza específica (boca completa)'));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByText('Boca completa')).toBeInTheDocument();
  });

  it('cambia a dentición temporal', () => {
    render(<PickerHarness onChange={() => undefined} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Temporal' }));
    expect(screen.getByRole('button', { name: 'Pieza 55' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pieza 18' })).not.toBeInTheDocument();
  });
});

describe('ConditionToggle', () => {
  it('al activar muestra el detalle con su placeholder', () => {
    function Harness() {
      const [on, setOn] = useState(false);
      const [d, setD] = useState('');
      return <ConditionToggle code="allergy" label="Alergias" active={on} detail={d} onActiveChange={setOn} onDetailChange={setD} />;
    }
    render(<Harness />);
    expect(screen.queryByPlaceholderText(/penicilina/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: 'Alergias' }));
    expect(screen.getByRole('switch', { name: 'Alergias' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByPlaceholderText('¿A qué? Ej. penicilina, látex, anestesia')).toHaveFocus();
  });
});
