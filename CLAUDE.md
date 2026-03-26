# Tudús — Contexto para Claude Code
## Stack
React + Vite + TypeScript. Estilos inline (sin Tailwind). Un solo archivo: src/app.tsx.
## Deploy
Vercel (auto-deploy en push a main). URL: tudus-zeta.vercel.app
## Reglas
- Siempre importar React en app.tsx
- Dark mode: inputs y selects deben respetar tema (no hardcodear #F9FAFB)
- No duplicar keys en objetos de estilos
- Vercel build: usar "node node_modules/vite/bin/vite.js build" en vercel.json, nunca npx vite
## Pendientes
- [x] Inputs dark mode fix
- [x] TuduDetail: sacar botón editar del header, dejar solo el de abajo
- [ ] TuduForm: sacar estado "Terminando"
- [ ] Pomodoro: elegir tareas existentes
- [ ] Subtareas: definir dónde
- [x] Conectar con Notion (CRUD completo, proxy serverless, page content)
- [x] Sidebar: badges dinámicos desde Notion
- [x] Sidebar: navegación por categoría
- [x] ConfigView: localStorage para estados
- [x] Dashboard: drag & drop con persistencia en Notion
- [x] KanbanView: conectado a Notion con drag & drop
- [x] PostitsView: conectado a Notion con posiciones arrastrables
- [x] Buscador global: filtrado en memoria con dropdown
- [x] Sistema de toasts global con loading/success/error
- [x] Guardado en segundo plano (TuduDetail)
- [ ] Ver integración con Hostinger
