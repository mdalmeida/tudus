# Tudús — Definición de Producto
**Versión:** 0.7  
**Fecha:** Marzo 2026  
**Estado:** En definición activa

---

## 1. Visión General

**Tudús** es una app de productividad personal web (URL directa, responsive) que combina captura rápida, gestión de tareas visual y organización profunda. El storage es intercambiable por diseño: en v1 soporta Notion y Google Sheets; en el futuro Supabase u otros. El usuario elige su backend en el onboarding.

---

## 2. Plataforma

- **Web app pura** — accesible desde cualquier browser via URL (ej: `tudus.app`)
- **Responsive** — funciona en desktop y mobile desde el browser, sin instalación
- Sin app nativa ni PWA en v1
- Mobile: solo vista Listado disponible en v1

---

## 3. Onboarding y Backend

### 3.1 Flujo de onboarding
1. Login social (Google o Meta)
2. Elegir backend de storage:
   - 🟠 **Notion** — conectar workspace via OAuth. Backend completo, bidireccional.
   - 🟢 **Google Sheets** — conectar cuenta Google (ya logueado). Crea spreadsheet automáticamente.
3. La app crea la estructura de datos automáticamente en el backend elegido
4. Configuración inicial de categorías (se muestran las 10 por default, editables)

### 3.2 Backends soportados

| Backend | v1 | Descripción |
|---|---|---|
| Notion | ✅ | Bidireccional, sync cada 5 min o manual |
| Google Sheets | ✅ | Bidireccional, sync cada 5 min o manual |
| Supabase | 🔵 Futuro | Base de datos propia en la nube (open source) |

### 3.3 Arquitectura de storage
El storage está **abstraído por diseño** — agregar un nuevo backend en el futuro no requiere reescribir la app. Cada backend implementa la misma interfaz de datos.

### 3.4 Sincronización (aplica a todos los backends)
- **App → Backend:** tiempo real en cada acción
- **Backend → App:** automático cada 5 minutos o botón "Refresh"
- **Conflicto detectado:** modal con ambas versiones para que el usuario elija cuál conservar

---

## 4. Autenticación

- **Social Login:** Google (principal) y Meta
- Al registrarse → conecta backend elegido
- Recupero de contraseña/sesión via proveedor social
- **v1:** usuario único (no hay registro público multi-usuario)
- **v2 roadmap:** multiusuario, colaboración

---

## 5. Las 10 Categorías

1. Setup Base
2. House & Car
3. Financial Cashflow
4. Family
5. Social & Experiences
6. My Work
7. Skills
8. Health
9. Mindset
10. *(libre — el usuario puede agregar más)*

### 5.1 Categorías del sistema (no eliminables, no visibles en nav principal)
- **Inbox** — Tudús sin categoría asignada
- **Eliminados** — categoría oculta con Tudús en estado "Eliminado"

### 5.2 Reglas
- Editables (ABM) desde Configuración: nombre, ícono default, imagen de cabezal, descripción
- Al crear una categoría → se elige ícono (Phosphor Icons) e imagen de cabezal
- Si un Tudú se mueve de categoría → va al final del orden de importancia en destino
- Si se elimina una categoría → modal pregunta: reasignar Tudús (elige destino) o mover a Inbox

---

## 6. El Tudú (unidad central)

Unidad mínima de trabajo. Visualmente es un postit. Puede ser simple o contener otros Tudús (hasta 4 niveles, sin bucles circulares).

### 6.0 Formulario de Tudú (crear y editar)

El formulario de creación y el de edición son **idénticos** — mismos campos, mismo orden, mismo diseño. No existe un formulario "simplificado" para crear. La única diferencia es el título del modal ("Nuevo Tudú" vs "Editar Tudú") y el botón de acción ("Crear" vs "Guardar").

**Campos del formulario (en orden):**
1. Título
2. Tipo (Tarea, Idea, WhatsApp, Mail, Teams/Meet, Compra, Llamada, Revisión — extensible)
3. Categoría
4. Estado
5. Cuándo (etiqueta temporal → se traduce a fecha en backend)
6. Fecha deadline (date picker, opcional)
7. Tudú padre (selector, opcional — para anidamiento)
8. Color del postit (color picker libre + paleta rápida)
9. Tamaño del postit (XS / S / M / L / XL)
10. Etiquetas (tags con color de texto y fondo, global o por categoría)
11. Contenido interno (editor markdown con barra de formato: negrita, cursiva, título, lista, lista numerada, link, imagen, código, separador)

### 6.1 Propiedades

| Propiedad | Tipo | Descripción |
|---|---|---|
| Título | Texto | Nombre visible en canvas |
| Contenido interno | Markdown + imágenes | Body completo; solo visible al abrir el Tudú |
| Color | Color picker libre | Default: amarillo postit (#FFF176) |
| Tipo | Select | Categoría semántica del Tudú: Tarea, Idea, WhatsApp, Mail, Teams/Meet, Compra, Llamada (lista extensible). Determina el ícono visual. |
| Etiquetas | Tags | Globales o por categoría; color de texto + fondo elegibles |
| Fecha inicio | Date | Desde cuándo aparece en el foco de trabajo |
| Fecha deadline | Date | Fecha límite del Tudú |
| Etiqueta temporal | Select | Hoy / Mañana-Pasado / Esta semana / La semana que viene / Este mes / El mes que viene → se traduce a fecha concreta en backend |
| Estado | Select | Global o por categoría (ver sección 6.2) |
| Orden de importancia | Entero | Posición ordinal + Z-index en canvas (son lo mismo) |
| Categoría | Relación | Categoría a la que pertenece |
| Tudú padre | Relación | Tudú contenedor (máx. 4 niveles) |
| Tudús hijos | Lista | Subtudús contenidos |
| Posición X, Y | Coordenadas | En canvas de postits |
| Tamaño postit | Enum | XS / S / M (default) / L / XL |
| Tiempo Pomodoro | Calculado | Suma de tiempo neto de sesiones registradas |

> Nota: Posición Z y orden de importancia son la misma propiedad — el Z-index visual en el canvas refleja el orden de importancia ordinal.

### 6.2 Estados

**Estados globales por default:**
- Por hacer *(default al crear)*
- Empezada
- En curso
- Terminando
- Esperando
- Listo
- No lo haré

**Reglas:**
- Los estados son globales por default
- Se pueden crear estados adicionales **solo para categorías específicas** (ej: "Delegado" en My Work, "Llamar" en Health)
- El estado **Eliminado** es interno del sistema — el usuario no lo ve ni lo selecciona; se asigna al eliminar un Tudú desde la UI (con confirmación previa)

### 6.3 Etiquetas

- Cada etiqueta tiene: nombre, color de texto, color de fondo
- Al crear una etiqueta se especifica si es **global** o para **una o varias categorías específicas**
- ABM desde Configuración

### 6.4 Jerarquía y anidamiento
- Máximo **4 niveles** de profundidad
- No se puede asignar padre que genere bucle circular
- El Tudú padre muestra indicador visual de progreso de hijos

### 6.5 Orden de importancia
- Posición ordinal dentro de la categoría (1 = más importante)
- Drag to reorder en cualquier vista
- Sin etiquetas Alta/Media/Baja — solo posición relativa
- Al cambiar de categoría → va al final

### 6.6 Fechas y foco de trabajo
- Tudú con rango → aparece en foco desde **fecha inicio**
- **Deadline** = fecha límite visible
- Tudús vencidos (deadline < hoy) → listado "Vencidos" en Dashboard

---

## 7. Dashboard ("Hoy")

Vista principal al abrir la app. Dos zonas:

### 7.1 Zona superior — Cajitas de planificación
4 slots con borde punteado donde el usuario arrastra Tudús para planificar:

| Cajita | Etiqueta temporal asignada |
|---|---|
| Hoy | Hoy |
| Mañana / Pasado | Mañana o pasado mañana |
| Esta semana | Esta semana |
| La semana que viene | La semana que viene |

Al hacer drop → se asigna automáticamente la fecha correspondiente al Tudú.

### 7.2 Zona inferior — Pool de Tudús sin planificar
- Todos los Tudús activos sin fecha asignada o con fecha futura lejana
- Postits sueltos, scroll infinito
- Se arrastran hacia las cajitas superiores

### 7.3 Sección Vencidos
- Tudús con deadline < hoy
- Requieren reprogramación (drag a cajita o asignar nueva fecha)

### 7.4 Resumen por categoría
- Cantidad de Tudús pendientes por categoría
- Acceso directo

### 7.5 Creación rápida
- **Campo prompt:** nombre → Enter → elige categoría inline
- **Botón "Nuevo":** formulario completo

---

## 8. Pantalla 1 de Categoría — Moodboard

### 8.1 Cabezal visual
- Imagen de fondo editable (upload propio o biblioteca de fondos predefinidos)
- Botón de edición reducido a solo ícono ✎ (pequeño, esquina superior derecha)
- Sobre la imagen aparece el **moodboard** con notas, ideas, frases, videos, imágenes y links
- Debajo del moodboard: texto de propósito de la categoría
- Más abajo: preview de los **3 Tudús más importantes** (por orden de importancia) con tipo, título y fecha
- Botón "Ver todos los tudús →" lleva al canvas

### 8.2 Canvas Moodboard (v1 — simple)
- Notas de texto libre
- Imágenes (upload o URL)
- Links con preview (YouTube, LinkedIn, Instagram, cualquier URL)

### 8.3 Canvas Moodboard (v2 — roadmap)
- Archivos adjuntos
- Formas y conectores
- Secciones / agrupaciones

---

## 9. Pantalla 2 de Categoría — Canvas de Tudús

4 vistas navegables por tabs.

### 9.1 Vista: Listado
- Estilo TickTick, ordenado por importancia
- Filtros: etiqueta temporal, estado, etiqueta
- Drag to reorder

### 9.2 Vista: Kanban
- Columnas = Estados
- Cards arrastrables entre columnas
- Orden dentro de columna = orden de importancia

### 9.3 Vista: Gantt
- El color de cada barra es el mismo color de postit asignado al Tudú (misma propiedad `color` del Tudú que determina el color del postit en el canvas libre). No hay una paleta separada para el Gantt.

### 4.6 Íconos de Tudú
- Los íconos provienen de la biblioteca **Phosphor Icons**
- Al crear o editar un Tudú, el usuario elige un ícono de un selector
- En v1 se muestran los 10 íconos más relevantes; en v2 se expande a la biblioteca completa
- Íconos disponibles en v1: CheckSquare, Lightbulb, ChatCircle, EnvelopeSimple, UsersThree, ShoppingCart, Phone, MagnifyingGlass, Star, Lightning
- Barras horizontales por rango de fechas
- Hitos para fechas puntuales
- **Línea roja vertical "Hoy"** siempre visible
- Escalas de tiempo disponibles en v1: **Semana / Quincena / Mes**
- Escalas futuras (v2): Horas, Día, Bisemanal, Trimestre, Año, 5 años

### 9.4 Vista: Postits (canvas libre)
- Drag & drop libre, canvas infinito, zoom in/out
- Tamaño: XS / S / M (default) / L / XL
- Color = propiedad del Tudú
- Z-index = orden de importancia
- Doble click en área vacía → crear Tudú en esa posición

---

## 10. Búsqueda Global

- Buscador en header fijo (todas las pantallas)
- Dropdown de alcance: Todas las categorías / Esta categoría / Otra categoría
- Dropdown de profundidad: **Solo título y etiquetas** / **También en contenido**

---

## 11.1 Pomodoro — Modo Foco (multi-tarea)

- El usuario puede tener **hasta 3 tudús en foco simultáneo**
- Un panel "En foco" muestra los 3 tudús activos con sus tiempos acumulados
- El timer de 25 min corre sobre **un tudú a la vez** (el activo)
- Cambiar de tudú activo pausa el timer del anterior e inicia uno nuevo para el siguiente
- El tiempo se acumula por tudú independientemente
- El widget Pomodoro es **minimizable** a una barra compacta (solo muestra tiempo + nombre) sin interacción

## 11.2 Subtareas inline

- Dentro del detalle de un Tudú existe una sección "Subtareas"  
- Se pueden agregar subtareas con título y checkbox (completado/pendiente)
- Son una alternativa liviana para desglosar trabajo sin crear Tudús hijos formales
- En v2 se pueden promover a Tudús hijos reales

Widget flotante disponible en cualquier pantalla.

### 11.1 Funcionamiento
- Timer visual de **25 minutos** con gráfico de cuenta regresiva
- Se lanza desde un Tudú ("Trabajar en este Tudú")
- Flota sobre la interfaz; el usuario puede navegar mientras corre
- Se puede **pausar** y **cambiar de Tudú** (switch de tema) durante una sesión
- Al completar o detener → se registra el tiempo neto transcurrido en el Tudú

### 11.2 Registro de tiempo
- Se guarda el tiempo neto insumido (no siempre 25 min — si se corta antes, se guarda lo real)
- Cada sesión suma al tiempo total del Tudú
- El tiempo total es visible en la vista de detalle del Tudú
- Los pomodoros viven **solo en la app** (no se sincronizan al backend)

---

## 12. Hábitos

🚧 **En construcción — Backlog v2**

Los hábitos serán Tudús especiales de tipo recurrente con vista propia. Pendiente de definición detallada.

---

## 13. Configuración de Perfil

- **Cuenta:** nombre, email, proveedor social, desconectar cuenta
- **Tema:** modo oscuro / claro
- **Backend:** ver conexión activa, reconectar, cambiar backend
- **Categorías:** ABM + ícono + imagen cabezal + descripción
- **Estados:** ABM global + estados por categoría
- **Etiquetas:** ABM con scope (global o por categoría) + colores
- **Papelera:** ver Tudús eliminados, restaurar o eliminar definitivamente

---

## 14. Papelera

- Eliminar Tudú desde UI → confirmación → estado interno "Eliminado" → va a categoría oculta "Eliminados"
- Desde Configuración → Papelera: restaurar (vuelve a categoría original o Inbox) o eliminar definitivamente (irreversible, con confirmación)

---

## 15. Decisiones cerradas (resueltas)

| # | Decisión |
|---|---|
| 1 | Cada categoría tiene imagen de cabezal default acorde a su temática (ej: casa para "House & Car") |
| 2 | Los Tudús hijos heredan siempre la categoría del padre |
| 3 | Los estados por categoría aparecen como columnas adicionales en el Kanban de esa categoría |

---

## 16. Roadmap

### v1 — MVP
- [ ] Web app responsive (no PWA, no nativa)
- [ ] Social Login: Google + Meta
- [ ] Onboarding: elegir backend (Notion o Google Sheets)
- [ ] Setup automático de estructura en backend elegido
- [ ] 10 categorías + Inbox + Eliminados
- [ ] Tudús con todas sus propiedades
- [ ] 4 vistas: Listado, Kanban, Gantt (Semana/Quincena/Mes), Postits
- [ ] Dashboard: cajitas de planificación + pool de Tudús
- [ ] Moodboard simple con cabezal visual
- [ ] Orden de importancia drag & drop
- [ ] Fechas relativas → fecha concreta en backend
- [ ] Sincronización bidireccional con detección de conflictos
- [ ] Pomodoro flotante con registro de tiempo
- [ ] Búsqueda global con filtros de alcance y profundidad
- [ ] Configuración completa
- [ ] Mobile: vista listado

### v2
- [ ] Hábitos recurrentes
- [ ] Notificaciones push/email
- [ ] Moodboard avanzado
- [ ] Gantt escalas adicionales
- [ ] Mobile optimizado
- [ ] Supabase como backend

### v3
- [ ] Colaboración multiusuario
- [ ] Estadísticas y retrospectivas
- [ ] Excel / otros backends

---

*Documento vivo — se actualiza con cada iteración del chat*
