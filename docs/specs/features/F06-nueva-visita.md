# F06 · Nueva visita

**Pantalla:** `design/screens/10-nueva-visita.html` · **Fase:** MVP

## User story
Como doctora, al terminar de atender quiero registrar el motivo y los tratamientos por pieza en pocos toques.

## UI
- Encabezado: "Nombre · HC" + "Nueva visita" + **Cancelar** / **Guardar visita**.
- Alertas médicas del paciente visibles arriba.
- **Fecha:** "Hoy · lun 5 oct 2026", editable (para cargar visitas pasadas).
- **Motivo de consulta:** texto libre + chips rápidos: Dolor, Control, Limpieza, Urgencia, Estética.

### Tratamientos de esta visita · N
Lista de lo agregado (servicio, pieza, estado, quitar). Vacío: "Aún no agregas tratamientos. Elige uno abajo."

### Agregar tratamiento (4 pasos)
1. **Servicio:** chips agrupados por `services.category` en orden `sort_order` (Restauraciones, Endodoncia, Prótesis, Prevención y estética, Cirugía, Ortodoncia, Diagnóstico y otros).
2. **Pieza dental · FDI:** pestañas Permanente (11–18, 21–28, 31–38, 41–48) / Temporal (51–55, 61–65, 71–75, 81–85), cuadrícula por arcada. **Se pueden elegir varias.** Opción "Sin pieza específica (boca completa)". Si `services.requires_tooth`, pedir al menos una pieza o boca completa.
3. **Estado:** Planificado · En proceso · **Realizado** (por defecto).
4. **Notas** (opcional).

Botón **Agregar "Servicio"** → pasa a la lista y resetea el selector.

## Guardado
1. Insert `visits` (`visit_date`, `reason`, `notes`).
2. Por cada tratamiento y **por cada pieza** un insert en `treatments` (D-05). Boca completa → `tooth = null`.
3. Toast "Visita guardada · Rosa Quispe · 2 tratamientos · Ver" y volver a la ficha en la pestaña Visitas.

**Desde una cita (fase 2):** enviar `appointment_id`; la cita pasa a "Atendida" sola.

## Criterios de aceptación
- [ ] Resina en piezas 15 y 24 crea 2 filas en `treatments`.
- [ ] Profilaxis sin pieza se guarda como boca completa.
- [ ] No se puede agregar un servicio con `requires_tooth` sin pieza ni boca completa.
- [ ] Se puede guardar una visita sin tratamientos (solo motivo y nota).
- [ ] Cancelar con datos cargados pide confirmación.
