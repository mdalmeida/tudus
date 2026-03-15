# Tudús — Análisis funcional y técnico
**Fecha:** Marzo 2026 | **Versión analizada:** Prototipo React v4

---

## 1. Inconsistencias PRD vs Prototipo

| # | Hallazgo | Estado |
|---|---|---|
| 1 | "Social & Experiences" faltaba en el listado de categorías del prototipo | ✅ Corregido |
| 2 | "Comprar regalo" no existía como categoría | ✅ Corregido |
| 3 | "Algún día" faltaba como opción de fecha (→ 3 meses en el futuro) | ✅ Corregido |
| 4 | ConfigView no mostraba edición de categorías | ✅ Corregido |
| 5 | Estados en Config no coincidían exactamente con el PRD | ✅ Corregido |
| 6 | El Pomodoro no era interactivo desde el nombre de tarea | ✅ Corregido |
| 7 | PRD define papelera (Eliminados) accesible desde Config — faltaba la sección | ✅ Corregido |
| 8 | PRD dice estados adicionales por categoría — Config solo mostraba globales | ⚠️ Parcial (UI base agregada) |
| 9 | PRD menciona sync conflict modal — no implementado | 📋 Roadmap v1 |
| 10 | Moodboard no permite agregar/eliminar ítems — solo placeholder | 📋 Roadmap v1 |
| 11 | El campo "Etiqueta temporal" no calcula fecha real en el backend simulado | 📋 Para implementación real |
| 12 | Anidamiento de Tudús (4 niveles) no visible visualmente en ninguna vista | 📋 Roadmap v1 |

---

## 2. Problemas de UX / Producto

| # | Problema | Impacto | Propuesta |
|---|---|---|---|
| 1 | No hay empty states — categorías sin ítems muestran nada | Alto | Agregar mensaje + CTA "Crear primer tudú" |
| 2 | Sin confirmación para acciones destructivas (eliminar, mover a papelera) | Alto | Modal de confirmación |
| 3 | El widget Pomodoro puede cubrir el FAB en mobile | Medio | Reposicionar al expandir o mover a header |
| 4 | Buscar no muestra resultados — campo no funcional | Medio | Al menos filtrar ítems visibles |
| 5 | No hay forma de volver del Canvas al Moodboard sin ir al sidebar | Medio | Agregar breadcrumb o botón "← Moodboard" |
| 6 | "Editar cabezal" en la categoría no tiene acción real | Bajo | Conectar a un modal de edición de header |
| 7 | El drag & drop del dashboard desaparece el postit antes de confirmar drop | Bajo | Mantener visible hasta confirmar |
| 8 | Los estados de color SBADGE tienen colores similares (Listo vs En curso) | Bajo | Diferenciar más visualmente |
| 9 | En mobile, vistas Kanban/Gantt/Postits no son funcionales con touch | Alto | Solo exponer vista Listado en mobile (ya en PRD) |
| 10 | No hay feedback visual al guardar o crear un Tudú | Medio | Toast ya existe — usarlo en todos los casos |

---

## 3. Riesgos técnicos

| # | Riesgo | Severidad | Mitigación |
|---|---|---|---|
| 1 | `document.execCommand` está deprecado — WysiwygEditor romperá en Chrome futuro | Alto | Migrar a `contentEditable` con comandos modernos o usar `tiptap`/`slate` |
| 2 | HTML5 Drag & Drop API no funciona en touch (mobile) | Alto | Usar `pointer events` o librería como `@dnd-kit` en producción |
| 3 | Posiciones de postits guardadas en px absolutos — se rompen al cambiar tamaño de ventana | Medio | Guardar como % relativo al canvas |
| 4 | Sin error boundaries — cualquier error en un componente baja toda la app | Alto | Agregar `<ErrorBoundary>` en producción |
| 5 | Toda la data es ephemeral — reload pierde todo el estado | Medio | Esperado en prototipo; en producción → API layer |
| 6 | `useRef` para drag en Kanban puede perder referencia en renders rápidos | Bajo | Usar ID en `dataTransfer` como ya se hace en Dashboard |
| 7 | El dark mode usa tanto `classList` en `document` como prop-drilling | Medio | Migrar a React Context para modo oscuro |
| 8 | No hay validación de formularios | Medio | Agregar validación básica (campo título requerido mínimo) |

---

## 4. Deuda técnica identificada

```
Arquitectura actual (prototipo)
├── Estado: todo local por componente
├── Dark mode: prop drilling a 5 niveles
├── Routing: estado local (no URL)
└── Data: hardcoded, ephemeral

Arquitectura objetivo (producción)
├── Estado: Context/Zustand para app state
├── Dark mode: ThemeContext
├── Routing: React Router o Next.js
└── Data: Service layer abstracto (Notion/GSheets adapter)
```

**Refactors prioritarios para producción:**
1. Extraer `ThemeContext` — eliminar prop `dark` de todos los componentes
2. Extraer `DataContext` — centralizar estado de categorías, tudús, estados
3. Crear `TuduService` interface — abstrae operaciones CRUD independientemente del backend
4. Agregar `useReducer` para operaciones complejas (mover entre categorías, reordenar)
5. Routing real — cada categoría/vista debería tener URL propia

---

## 5. Correcciones aplicadas en esta iteración

### Accesibilidad
- `<div onClick>` interactivos → `<button>` con `background:none; border:none`
- Todos los modales tienen `role="dialog" aria-modal="true" aria-labelledby`
- Inputs tienen `<label htmlFor>` asociado correctamente
- Botones con solo ícono tienen `aria-label` descriptivo
- Navegación por teclado: `Escape` cierra modales
- Focus styles globales visibles (`outline: 2px solid BRAND`)
- `<nav>` con `aria-label` en sidebar y bottom nav

### Responsive
- Mobile (<640px): sidebar oculto, bottom nav fija con iconos
- Dashboard: 2 columnas en mobile, 4 en desktop
- Header: buscador colapsado en mobile
- Canvas: solo vista Listado disponible en mobile (según PRD)
- FAB se desplaza en mobile para no tapar bottom nav

### Nuevas funcionalidades
- Categorías: "Social & Experiences" y "Comprar regalo" agregadas
- Fecha "Algún día" → calcula 3 meses en el futuro automáticamente
- Pomodoro: clic en nombre de tarea abre TuduDetail completo (pomo sigue corriendo)
- ConfigView: edición completa de categorías (renombrar, cambiar ícono)
- ConfigView: estados exactos del PRD con opción de agregar por categoría

---

*Documento vivo — se actualiza con cada iteración*
