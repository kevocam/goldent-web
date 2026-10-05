# F04 · Nuevo / editar paciente

**Pantalla:** `design/screens/09-nuevo-paciente.html` · **Fase:** MVP

## User story
Como doctora, quiero registrar a un paciente nuevo con sus datos y antecedentes en una sola pantalla, marcando solo lo que aplica.

## UI
- Título "Nuevo paciente" + "HC-00252 · se asigna automáticamente" (vista previa: `clinics.record_seq + 1`, solo informativo).
- Acciones arriba y abajo: **Cancelar**, **Guardar paciente**.

### Datos personales
| Campo | Regla |
|---|---|
| Nombres * | requerido |
| Apellidos * | requerido |
| DNI * | 8 dígitos, teclado numérico, verifica duplicado al salir del campo |
| Fecha de nacimiento | muestra la edad al lado ("33 años") |
| Celular * | prefijo +51, 9 dígitos empezando en 9 |
| Correo | opcional, formato válido |
| Domicilio, Ocupación | opcionales |
| Estado civil | chips: Soltero(a), Casado(a), Conviviente, Divorciado(a), Viudo(a) → `soltero`, `casado`, `conviviente`, `divorciado`, `viudo` |

### Antecedentes médicos
- "Activa solo lo que aplique. Lo marcado con "Sí" aparece como alerta en la ficha." + contador "N alertas".
- 9 filas con interruptor Sí/No. Al activar, se despliega el campo de detalle con su placeholder:

| Condición | Placeholder |
|---|---|
| Alergias | ¿A qué? Ej. penicilina, látex, anestesia |
| Diabetes | Tipo y tratamiento |
| Hemorragias | Ej. sangrado prolongado tras extracción |
| Presión alta / baja | Alta o baja, ¿controlada? |
| Úlcera gástrica | Detalle |
| Enfermedad cardiaca | Ej. arritmia, marcapasos |
| Recibe medicamento | ¿Cuál y dosis? |
| Otra enfermedad | ¿Cuál? |
| Embarazo | Semanas de gestación (solo si sexo F o sin sexo) |

## Guardado
1. Insert en `patients` (sin `record_number`, lo pone la DB).
2. Insert de cada antecedente activo en `patient_conditions` (`active = true`, `detail`).
3. Ir a la ficha del paciente con toast "Paciente guardado · HC-00252".

**Modo edición:** mismo formulario. Antecedente desactivado → `active = false` (no se borra).

## Criterios de aceptación
- [ ] No permite guardar sin nombres, apellidos, DNI y celular.
- [ ] DNI duplicado → "Ya existe: Rosa Quispe · HC-00248" con enlace a su ficha.
- [ ] La edad se recalcula al cambiar la fecha.
- [ ] Al desmarcar un antecedente en edición, desaparece de las alertas y queda en el historial de auditoría.
- [ ] Doble toque en Guardar no crea dos pacientes.
