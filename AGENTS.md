# MotoSV — Plataforma de Mototaxis (El Salvador)

## Stack Tecnológico

- **Frontend Mobile:** Expo SDK 52, React Native 0.76, TypeScript, Expo Router, NativeWind (Tailwind), TanStack Query, Zustand, XState, Zod, Reanimated
- **Backend:** Supabase (PostgreSQL 15 + PostGIS + Auth + Realtime + Storage + Edge Functions/Deno)
- **Admin Web:** React 18 + Vite 6 + Tailwind 3 + Recharts + ApexCharts
- **Mapas:** OpenStreetMap via react-native-maps UrlTile (gratis, sin API key)
- **Pagos:** Stripe + PayPal + Wompi + Cash (multi-gateway)
- **Monitoreo:** Sentry + Grafana
- **Notificaciones:** Expo Push (FCM + APNs)
- **Auth:** Supabase Auth (Phone OTP + Email/Password)
- **Monorepo:** Turborepo + pnpm 9

## Estructura del Proyecto

```
apps/
  rider/           # Expo app para pasajeros (15+ features)
  driver/          # Expo app para conductores (13+ features)
  admin/           # React/Vite web dashboard (47 rutas, 43 páginas)
packages/
  api/             # Cliente Supabase tipado + 16 TanStack Query exports
  domain/          # Tipos, constantes, validaciones Zod, XState ride machine
  ui/              # Design system tokens + 4 componentes base
  realtime/        # 4 canales Realtime (driverLocation, driverRequests, ride, rideChat)
  config/          # ESLint, TypeScript, tsconfig base
supabase/
  migrations/      # 38 migraciones SQL (54 tablas, 91 índices, PostGIS)
  functions/       # 3 Edge Functions (matching, notifications, payments-webhook)
  seed.sql         # Datos demo
__tests__/         # 13 tests (matching logic + load simulation)
stitch-design/     # 25 screens exportadas de Google Stitch
docs/              # 9 documentos de arquitectura
```

## Skills del Proyecto (.agents/skills/)

### Skill Madre (Orquestador)
**Archivo:** `.agents/skills/skill-madre/SKILL.md`
Cada interacción ejecuta: Escaneo → Mapeo → 8 Verificaciones → Ejecución → Post-Implementación

### Session Memory (Memorizador)
**Archivo:** `.agents/skills/session-memory/SKILL.md`
Rastrea el progreso del proyecto por fases completadas (FASE 0-9 completadas ✅)

### Cybersecurity (Seguridad)
**Archivo:** `.agents/skills/cybersecurity/SKILL.md`
⚠️ Auditoría obligatoria en TODA tarea con implicaciones de seguridad: RLS, Edge Functions, manejo de errores, env vars, XSS, headers HTTP, auth, dependencias, BD, producción. Se activa automáticamente y puede BLOQUEAR implementaciones si no se cumplen los estándares.

### NO REFACTOR (Regla de Ejecución Restrictiva)
**Archivo:** `.agents/skills/no-refactor/SKILL.md`
⚠️ REGLA ABSOLUTA: No escribir UNA SOLA línea de código que no haya sido
explicitamente solicitada. No asumir, no anticipar, no refactorizar, no agregar
extras. Cada linea debe tener una razon directa en la solicitud del usuario.
Se activa en TODAS las tareas de codificacion.

### Skills disponibles (66 skills)
Cubriendo: Expo/React Native, Supabase, Diseño/Stitch, State Management, Pagos, Monitoreo, Ciberseguridad, etc.

## Design System

- **Primary:** `#006e2a` — Primary Container: `#00c853`
- **Surface:** `#f7f9fc` — On Surface: `#191c1e`
- **Tipografía:** Plus Jakarta Sans
- **Estilo:** Glassmorphism, elevación por capas, bordes redondeados
- **Archivo completo:** `stitch-design/motosv/screens/motosv_design_system/DESIGN.md`

## Archivos de Configuración Clave
- `CLAUDE.md` — Instrucciones para AI
- `CONTRIBUTING.md` — Guía de setup local
- `.nvmrc` / `.node-version` — Node.js 20
- `.env` — Variables de entorno (Supabase URL + Anon Key)
- `opencode.json` — MCP servers (Stitch + Supabase)

## Convenciones

- TypeScript estricto, sin `any`
- Feature-slices (vertical), no capas horizontales
- RLS en TODAS las tablas (54/54)
- TDD para lógica crítica (ride state machine, matching, pricing)
- PostGIS con covering + partial + GIST indexes
