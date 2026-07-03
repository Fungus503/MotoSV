# MotoSV — Instrucciones para AI

## Stack
- **Mobile:** Expo SDK 52, React Native 0.76, TypeScript, Expo Router, NativeWind, TanStack Query, Zustand, XState, Zod, Reanimated
- **Backend:** Supabase (PostgreSQL 15 + PostGIS + Auth + Realtime + Storage + Edge Functions/Deno)
- **Admin:** React 18 + Vite 6 + Tailwind 3 + Recharts + ApexCharts
- **Mapas:** OpenStreetMap (react-native-maps UrlTile)
- **Pagos:** Stripe + PayPal + Wompi + Cash
- **Monitoreo:** Sentry + Grafana
- **Monorepo:** Turborepo + pnpm 9

## Reglas
- TypeScript estricto, sin `any`
- Feature-slices verticales (no capas horizontales)
- RLS en TODAS las tablas
- TDD para lógica crítica
- Commits atómicos con conventional commits
- **NO REFACTOR**: No escribir código no solicitado. Cada línea debe ser explícitamente pedida por el usuario.

## Arquitectura
- `apps/`: rider (15+ features), driver (13+ features), admin (47 rutas, 43 páginas)
- `packages/`: api (16 hooks), domain (schemas + types + XState), ui (tokens + components), realtime (4 canales), config (ESLint + TS)
- `supabase/`: 38 migraciones (54 tablas, 91 índices), 3 Edge Functions, seed.sql
- `features/<name>/`: api/, components/, hooks/, queries/, screens/, services/, store/, types/, utils/

## Skill Madre
Cada interacción ejecuta el protocolo del archivo `.agents/skills/skill-madre/SKILL.md`:
1. Escaneo de skills
2. Mapeo tarea → skills
3. 8 verificaciones (Skill, Stack, Pattern, RLS, Error, TypeScript, Performance, Design)
4. Ejecución profesional
5. Post-implementación

## Design System
- Primary: `#006e2a`, Primary Container: `#00c853`
- Surface: `#f7f9fc`, On Surface: `#191c1e`
- Tipografía: Plus Jakarta Sans
- Glassmorphism, elevación por capas, bordes redondeados 16px
- Ver `stitch-design/motosv/screens/motosv_design_system/DESIGN.md`

## Fases del Proyecto (Completadas ✅)
- **FASE 0:** Scaffold monorepo + apps + packages
- **FASE 1:** 38 migraciones DB + Auth + RLS + PostGIS
- **FASE 2:** 3 Edge Functions + Matching Engine + Payments Webhook + Notifications
- **FASE 3:** Vertical Slice 0 — Flujo rider completo (login, tracking, payment, rating, chat, SOS)
- **FASE 4:** App del conductor (login, home, earnings, navigation, chat, SOS)
- **FASE 5:** Mensajería + Notificaciones (chat rider↔driver)
- **FASE 6:** Centro de Seguridad + Ayuda (pánico, trip sharing, FAQ)
- **FASE 7:** Wallet + Promociones + Referidos
- **FASE 8:** Admin Web completo (47 rutas, 43 páginas, 38 migraciones)
- **FASE 9:** Producción + Monitoreo + Optimización (índices, RLS, Sentry, CI/CD, load tests)

## Pendientes post-launch
- Redis GEOSEARCH si >500 drivers concurrentes
- Kafka para event streaming
- H3 hexagonal grid para zone-based demand tracking
- Surge pricing con ML
