# Tudús — Contexto para Claude Code
## Stack
React + Vite + TypeScript. Estilos inline (sin Tailwind). Un solo archivo: src/app.tsx.
## Backend
Supabase (tabla `tudus`). Client: src/supabase.ts. Env vars: VITE_SUPABASE_URL, VITE_SUPABASE_KEY.
## Deploy
Vercel (auto-deploy en push a main). URL: tudus-zeta.vercel.app
## Reglas
- Siempre importar React en app.tsx
- Dark mode: inputs y selects deben respetar tema (no hardcodear #F9FAFB)
- No duplicar keys en objetos de estilos
- Vercel build: usar "node node_modules/vite/bin/vite.js build" en vercel.json, nunca npx vite
- Backend: Supabase, no Notion. Imports desde src/supabase.ts
## Pendientes
- [x] Inputs dark mode fix
- [x] TuduDetail: sacar botón editar del header, dejar solo el de abajo
- [ ] TuduForm: sacar estado "Terminando"
- [ ] Pomodoro: elegir tareas existentes
- [ ] Subtareas: definir dónde
- [x] Conectar con Notion (migrado a Supabase)
- [x] Migración Notion → Supabase
- [x] Sidebar: badges dinámicos
- [x] Sidebar: navegación por categoría
- [x] ConfigView: localStorage para estados
- [x] Dashboard: drag & drop con persistencia
- [x] KanbanView: conectado con drag & drop
- [x] PostitsView: conectado con posiciones arrastrables (pos_x/pos_y)
- [x] Buscador global: filtrado en memoria con dropdown
- [x] Sistema de toasts global con loading/success/error
- [x] Guardado en segundo plano (TuduDetail)
- [ ] Ver integración con Hostinger
