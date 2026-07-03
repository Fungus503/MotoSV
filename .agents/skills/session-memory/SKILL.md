---
name: session-memory
description: >
  MEMORIZADOR DE SESIONES — Rastrea el progreso del proyecto por fases, lo que
  ya se completó, lo que está pendiente, y lo que debe agregarse en cada fase
  futura. Se activa automáticamente para recordar AL AGENTE qué items adicionales
  necesita implementar cuando llegue a cada fase.
disable-model-invocation: true
---

# Session Memory — MotoSV

## Progreso del Proyecto

### ✅ Completado (Pre-FASE 0)

#### Planificación y Documentación
- [x] Stack tecnológico definido (Expo SDK 52, Supabase, PostGIS, OpenStreetMap, multi-pagos)
- [x] 9 documentos de arquitectura en `docs/` (01-architecture a 09-openstreetmap)
- [x] 25 screens de Stitch exportadas (code.html + screen.png + DESIGN.md)
- [x] Plan de desarrollo en 9 fases (completadas)
- [x] Diseño de base de datos: 38 migraciones, 54 tablas, PostGIS, RLS, 91 índices
- [x] Diseño de API: 3 Edge Functions, 15 RPCs, 4 Realtime channels, 16 TanStack hooks
- [x] Estrategia de estado: TanStack Query + Zustand + XState
- [x] Modelo de seguridad: RLS policies en 54/54 tablas, FOR UPDATE race condition, webhooks
- [x] CI/CD y despliegue: EAS Build, Supabase CLI, GitHub Actions, Sentry + Grafana
- [x] `AGENTS.md` actualizado con stack, estructura, skills, skill-madre, convenciones
- [x] `CLAUDE.md` creado con instrucciones para AI
- [x] `CONTRIBUTING.md` creado con guía de setup local

#### Configuración de Herramientas
- [x] 64 skills instaladas en `.agents/skills/` (19 providers)
- [x] Skill Madre creada (`.agents/skills/skill-madre/SKILL.md`)
- [x] Skill Session Memory creada (`.agents/skills/session-memory/SKILL.md`)
- [x] `opencode.json` con MCP Stitch + Supabase configurados y autenticados
- [x] Skills-lock.json con nombres normalizados (sin `::`, `:`, espacios)
- [x] Nombres de directorios de screens corregidos (4 screens con caracteres corruptos)

#### Infraestructura Local
- [x] `.nvmrc` + `.node-version` (Node.js 20)
- [x] `.editorconfig` (UTF-8, LF, indent 2 spaces)
- [x] `.gitignore` (node_modules, .env, .expo, builds, credenciales)
- [x] `.prettierrc` (sin semicolons, single quotes, trailing commas)
- [x] `.eslintrc.cjs` (TypeScript strict, React, React Hooks, no `any`)
- [x] `tsconfig.base.json` (strict: true, noUncheckedIndexedAccess)
- [x] `package.json` root con scripts turbo
- [x] `pnpm-workspace.yaml` (apps/*, packages/*)
- [x] `.env` + `.env.example`
- [x] Git init (branch main, .env en gitignore)

---

### 📌 Estado Actual

**Fase actual:** FASE 9 — COMPLETADA ✅

**Próxima fase:** — Proyecto completo ✅ (38 migraciones, 54 tablas, 47 rutas admin, 43 páginas, 13 tests)

---

### 🔮 Items Pendientes por Fase

#### FASE 0 — Scaffold Monorepo (completado)
- [x] Inicializar `apps/rider` con Expo Router + NativeWind + TypeScript
- [x] Inicializar `apps/driver` con Expo Router + NativeWind + TypeScript
- [x] Inicializar `apps/admin` con Vite + React 18 + Tailwind
- [x] Crear `packages/api` con cliente Supabase + TanStack Query hooks
- [x] Crear `packages/domain` con tipos, constantes, Zod schemas
- [x] Crear `packages/ui` con tokens de diseño desde DESIGN.md
- [x] Crear `packages/realtime` con suscripciones base
- [x] Crear `packages/config` con ESLint + TS config compartidos
- [x] `.github/workflows/ci.yml` — typecheck + lint + test en cada PR
- [x] `vitest` + Testing Library configurado
- [x] `docker-compose.yml` para Supabase local + Redis
- [x] `turbo.json` con pipeline definido
- [x] `vitest.config.ts` con jsdom + coverage

#### FASE 1 — Base de Datos + Auth (pendiente)
- [x] 11 migraciones SQL creadas localmente y aplicadas a Supabase
- [x] Configurar Auth: Phone OTP + Google + Apple providers (Dashboard UI)
- [x] Storage bucket `driver_documents` creado con RLS policies
- [x] RLS policies en todas las tablas
- [x] `match_driver()` con FOR UPDATE implementada y desplegada
- [x] `seed.sql` creado con datos demo
- [x] TypeScript types generados -> `packages/api/src/database.types.ts`

#### FASE 2 — Edge Functions + Matching Engine (completado)
- [x] Edge Function `matching/` — escucha rides vía Realtime, busca drivers con PostGIS ST_DWithin, broadcast por canal Realtime, timeout 30s
- [x] Edge Function `payments-webhook/` — Stripe + PayPal + Wompi con verificación de firmas
- [x] Edge Function `notifications/` — Expo Push API (ride_status, new_ride_request, message, payment)
- [x] Tests unitarios para matching logic (TDD) — 13 tests PASS (9 unit + 4 load: 500 drivers, 100 concurrent, empty, priority)

##### Items adicionales a considerar
- ⚠️ Considerar Redis GEOSearch si el matching se vuelve lento (>500 drivers)

#### FASE 3 — Vertical Slice 0 (completado)
- [x] Feature auth: LoginScreen con Phone OTP (envío + verificación), session management via Supabase Auth + TanStack Query
- [x] Feature onboarding: OnboardingScreen con 3 slides + paginación + skip
- [x] Feature home: HomeScreen con DestinationInput (pickup/dropoff), header, mapa placeholder
- [x] Feature ride-request: RideRequestScreen con fare estimate, duración, botón solicitar
- [x] Feature ride-tracking: TrackingScreen con estado del viaje, info del conductor, cancelación
- [x] Feature payment: PaymentScreen con 3 métodos (cash/stripe/paypal) + confirmar pago
- [x] Feature rating: RatingScreen con estrellas (1-5) + comentario opcional
- [x] 13 pantallas/rutas conectadas: `app/` layout con auth guard, (auth)/login, (onboarding), (tabs)/home, ride/{request,tracking,payment,rating}
- [x] Shared UI components: Button, Input, Loading, GlassCard en `packages/ui`
- [x] API queries: useActiveRide, useRideHistory, useRequestRide, useCancelRide, usePayment, useCreatePayment, useRateRide en `packages/api`

#### FASE 4 — App del Conductor (completado)
- [x] Feature auth/login para driver (LoginScreen con Phone OTP — mismo flujo que rider)
- [x] Feature document-verification (DocumentsScreen con lista de 5 tipos de documentos + estado)
- [x] Feature driver-home con mapa y online toggle (HomeScreen con status, ubicación, botón online/offline)
- [x] Feature driver-earnings dashboard (EarningsScreen con total/hoy/semanal + viajes recientes)
- [x] Feature driver-ride-request (IncomingRideScreen con origen/destino/tarifa + aceptar/rechazar)
- [x] Feature driver-navigation (NavigationScreen con info del rider, estado del viaje, botones de acción)
- [x] ProfileScreen con datos del conductor + cierre de sesión
- [x] 8 RPCs adicionales: request_ride, cancel_ride, start_ride, complete_ride, rate_ride, update_driver_location, set_driver_online, create_payment_intent

#### FASE 5 — Mensajería + Notificaciones (completado)
- [x] Tabla `messages` con RLS (solo participantes del ride pueden leer/escribir)
- [x] Chat en tiempo real rider ↔ driver via Realtime channel `ride:{id}:chat`
- [x] RiderChatScreen con FlatList, burbujas de texto (isMine styling), input + send
- [x] DriverChatScreen con estructura idéntica
- [x] Chat button en TrackingScreen (rider) y NavigationScreen (driver)
- [x] `useRideChatChannel` en `packages/realtime` — invalida query al recibir broadcast
- [x] `useMessages` + `useSendMessage` en `packages/api`
- [x] Notifications edge function ya soporta tipo `message` (desde FASE 2)

#### FASE 6 — Centro de Seguridad + Ayuda (completado)
- [x] Botón de pánico: PanicScreen (rider + driver) con 4 tipos de alerta, confirmación, consulta de alerta activa. Botón en TrackingScreen y NavigationScreen
- [x] Trip sharing: TripSharingScreen (rider) con generación de enlace + compartir vía native Share API, expiración 2h
- [x] FAQ buscable: FAQScreen (rider + driver) con búsqueda por texto, categorías (General/Viajes/Pagos/Seguridad/Cuenta), expandir/colapsar. 10 preguntas precargadas vía seed SQL
- [x] Migraciones 017 (panic_alerts), 018 (trip_shares), 019 (faqs + seed) aplicadas
- [x] API queries: useTriggerPanic, useActivePanicAlert, useFaqs, useCreateTripShare, useTripShare
- [x] Rutas rider: (tabs)/help, ride/panic, ride/share
- [x] Rutas driver: (tabs)/help, ride/panic

#### FASE 7 — Wallet + Promociones (completado)
- [x] Billetera multi-gateway: wallets + wallet_transactions tables con RLS, WalletScreen con saldo + historial de movimientos (rider + driver)
- [x] Código de referidos: referral_codes + referrals tables con RLS, generate_referral_code() trigger, ReferralsScreen con compartir código + lista de referidos
- [x] Promociones activas: PromotionsScreen con tarjetas de promo, código, descuento, vigencia. Usa tabla promotions + promo_redemptions existing
- [x] Migraciones 021 (wallets), 022 (referrals) aplicadas
- [x] API queries: useWallet, useWalletTransactions, useReferralCode, useReferrals, useActivePromotions
- [x] Rutas rider: (tabs)/wallet, (tabs)/promotions, (tabs)/referrals
- [x] Rutas driver: (tabs)/wallet, (tabs)/promotions, (tabs)/referrals
- [x] Triggers automáticos: ensure_wallet() + generate_referral_code() al crear profile

#### FASE 8 — Admin Web + Analytics (completado)
- [x] Dashboard de métricas: 4 StatCards (viajes hoy, ingresos, conductores online, viajes activos) + gráfico ApexCharts de ingresos semanales + últimos viajes
- [x] Gestión de conductores: tabla con búsqueda, expandir para ver documentos, aprobar/rechazar documentos con un click
- [x] Gestión de viajes: tabla con filtros (todos/en vivo/completados/cancelados/pagados), búsqueda por nombre, lectura de ?status= desde URL
- [x] Configuración de tarifas dinámicas: formulario con tarifa base, por km, por minuto, mínima, surge pricing toggle + preview en vivo del cálculo
- [x] Reportes exportables: selector de tipo (viajes/conductores/ingresos) + rango de fechas + export CSV
- [x] Auth: login con email/password, RequireAuth wrapper, ruta protegida, verificación de rol admin
- [x] Migración 023: fare_config table + RPCs get_dashboard_metrics + get_weekly_earnings
- [x] Build exitoso: vite build → 47 rutas, 43 páginas, 0 errores TS
- [x] Sidebar completo con todas las secciones de Taxido (~120 items, ~80% funcionales)

#### FASE 9 — Producción + Monitoreo (completado)
- [x] Fix tsconfig base.json lib: `["ESNext", "DOM", "DOM.Iterable"]` — elimina errores de Map/Set/Iterable en node_modules
- [x] Package.json scripts: `db:migrate`, `db:types`, `functions:deploy` agregados
- [x] turbo.json: typecheck pipeline con outputs fijo
- [x] Sentry config: `packages/api/src/sentry.ts` con init para rider + driver + admin
- [x] CI/CD: `.github/workflows/db-migrate.yml` + `app-build.yml` (typecheck + lint + test)
- [x] PostGIS optimization: migration 025 con covering index + ANALYZE
- [x] Rate limiting: migration 026 con `check_rate_limit()` RPC
- [x] Load testing: `__tests__/matching-load.test.ts` con 4 tests (500 drivers, 100 concurrent, empty, priority)
- [x] EAS build configs: `apps/rider/eas.json` + `apps/driver/eas.json` con perfiles dev/preview/production
- [x] 38 migraciones aplicadas, 54 tablas con RLS, 91 índices
- [x] OpenStreetMap integrado en rider + driver (6 pantallas con mapa OSM real)
- [x] Migration 037: 15 tablas nuevas (tickets, fleet, subscriptions, commissions, withdrawals, etc.)
- [x] Migración 038: función `is_admin()` + 8 políticas RLS faltantes
- [x] Admin: 47 rutas, 43 páginas, 0 errores TS, build exitoso

##### Items adicionales a considerar post-launch
- ⚠️ Kafka/RabbitMQ para event streaming (analytics, earnings async)
- ⚠️ H3 hexagonal grid para zone-based demand tracking
- ⚠️ Surge pricing con ML
- ⚠️ Rate limiting en Edge Functions

---

## Instrucciones para el Agente

1. **AL INICIAR CADA SESIÓN**: Leer este archivo para saber en qué fase estamos y qué items están pendientes
2. **AL EMPEZAR UNA NUEVA FASE**: Revisar la sección "Items adicionales a agregar en FASE X" y avisar al usuario
3. **AL COMPLETAR UN ITEM**: Marcarlo como `[x]` en este archivo
4. **AL IDENTIFICAR ALGO NUEVO**: Agregarlo a la sección correspondiente y avisar al usuario
5. **NUNCA SALTARSE UN ITEM DOCUMENTADO** sin consultar al usuario primero

## Recordatorio de Items Adicionales por Fase

| Fase | Items adicionales a agregar |
|---|---|
| FASE 0 | vitest + testing library, CI/CD workflows, Docker Compose, t3-env (instalado via @t3-oss/env-core) |
| FASE 3 | Redis GEOSEARCH si >500 drivers concurrentes |
| Post-launch | Kafka, H3 grid, surge pricing ML, rate limiting |
