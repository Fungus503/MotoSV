# Documentación Técnica — MotoSV

Plataforma de mototaxis para El Salvador. Premium, enterprise-grade, vertical-slice architecture.

## Índice

| Documento | Descripción |
|---|---|
| `01-architecture.md` | Arquitectura general del sistema, decisiones técnicas, diagrama de capas |
| `02-database-schema.md` | Esquema completo de base de datos: 38 migraciones, 54 tablas, PostGIS, RLS, índices |
| `03-development-plan.md` | Plan de desarrollo en 9 fases completadas |
| `04-design-system.md` | Sistema de diseño: tokens, colores, tipografía, glassmorphism, componentes |
| `05-api-design.md` | Diseño de API: Edge Functions + RPCs + Realtime suscripciones |
| `06-state-management.md` | Estrategia de estado: TanStack Query + Zustand + XState |
| `07-security.md` | Modelo de seguridad: RLS policies en 54 tablas, autenticación, roles |
| `08-deployment.md` | CI/CD con EAS Build, Supabase CLI, monitoreo con Sentry + Grafana |
| `09-openstreetmap.md` | Integración de OpenStreetMap con react-native-maps |

## Stack

| Capa | Tecnología |
|---|---|
| Mobile (Rider) | Expo SDK 52 / React Native 0.76 / Expo Router |
| Mobile (Driver) | Expo SDK 52 / React Native 0.76 / Expo Router |
| Admin Web | React 18 / Vite 6 / Tailwind 3 |
| Backend | Supabase (PostgreSQL 15 + PostGIS + Auth + Realtime + Storage) |
| Edge Functions | Deno / TypeScript (3 funciones: matching, notifications, payments-webhook) |
| Mapas | OpenStreetMap via react-native-maps UrlTile (gratis, sin API key) |
| Pagos | Stripe + PayPal + Wompi + Cash |
| Monitoreo | Sentry + Grafana |
| Notificaciones | Expo Push (FCM + APNs) |
| Auth | Supabase Auth (Phone OTP + Email/Password) |
| Monorepo | Turborepo + pnpm 9 |

## Estructura del Proyecto

```
/
├── apps/
│   ├── rider/           # Expo app pasajero (15+ features)
│   ├── driver/          # Expo app conductor (13+ features)
│   └── admin/           # React/Vite dashboard (47 rutas, 43 páginas)
├── packages/
│   ├── api/             # Cliente Supabase tipado + TanStack Query hooks (16 exports)
│   ├── domain/          # Tipos, constantes, validaciones Zod, XState machine
│   ├── ui/              # Design system tokens + componentes (Button, Input, Loading, GlassCard)
│   ├── realtime/        # Suscripciones Realtime compartidas (4 canales)
│   └── config/          # ESLint, TypeScript, tsconfig base
├── supabase/
│   ├── migrations/      # 38 migraciones SQL (54 tablas, 91 índices)
│   ├── functions/       # 3 Edge Functions (matching, notifications, payments-webhook)
│   └── seed.sql         # Datos demo
├── __tests__/           # Tests (13 tests: 9 unit + 4 load)
├── docs/                # Esta documentación
├── stitch-design/       # Diseños exportados de Google Stitch
├── AGENTS.md            # Contexto global para asistentes AI
└── opencode.json        # Configuración MCP (Stitch + Supabase)
```

## Convenciones Clave

- **Feature-slices verticales**: cada feature es autónoma
- **TypeScript estricto**: strict: true, sin `any`, tipos generados de Supabase (85KB)
- **RLS obligatorio**: 54/54 tablas con Row Level Security
- **TDD para lógica crítica**: 13 tests (matching logic + load simulation)
- **Commits atómicos**: conventional commits
- **PostGIS avanzado**: covering indexes, partial indexes, GIST spatial indexes

## Estadísticas del Proyecto

| Métrica | Valor |
|---|---|
| Migraciones SQL | 38 aplicadas |
| Tablas en BD | 54 (con RLS) |
| Índices | 91 (btree, GIST, partial, covering) |
| Edge Functions | 3 (matching, notifications, payments-webhook) |
| Admin Pages | 43 |
| Rider Screens | 15 features |
| Driver Screens | 13 features |
| Paquetes compartidos | 5 (api, domain, ui, realtime, config) |
| Tests | 13 (9 unit + 4 load) |
| Tipos TypeScript | 85KB generados de Supabase |

## Enlaces Externos

| Recurso | URL |
|---|---|
| Supabase Project | `https://supabase.com/dashboard/project/guwddvudyyxtbbxjzqbx` |
| Admin Dashboard | `http://localhost:5173` |
| DESIGN.md | `stitch-design/motosv/screens/motosv_design_system/DESIGN.md` |
| Skills Instaladas | `.agents/skills/` (64 skills) |
