# Plan de Desarrollo — 9 Fases

## Filosofía: Vertical Slice (Tracer Bullet)

En lugar de construir capas horizontales (DB → API → UI) para todo el sistema,
cada fase entrega una **funcionalidad completa y operativa** de principio a fin.

La Fase 3 es el **Vertical Slice 0**: el flujo completo de un viaje de pasajero,
desde login hasta pago. Todo lo anterior (Fases 0-2) es infraestructura que
lo hace posible. Todo lo posterior (Fases 4-8) agrega features sobre la misma
base.

## Fase 0: Fundación del Monorepo

**Duración estimada:** 2-3 sesiones

### Objetivo
Scaffold completo del monorepo con Turborepo + pnpm, 3 apps, 5 packages, y
configuración base de TypeScript, ESLint, NativeWind.

### Entregables
- `pnpm-workspace.yaml` con apps/ y packages/
- `apps/rider` — Expo app inicializada con Expo Router + NativeWind
- `apps/driver` — Expo app inicializada
- `apps/admin` — React 18 + Vite + Tailwind
- `packages/config` — tsconfig.base.json, eslint config
- `packages/domain` — Tipos base, constantes, Zod schemas
- `packages/api` — Cliente Supabase tipado + hooks TanStack Query base
- `packages/ui` — Tokens de diseño (colores, tipografía, spacing) desde DESIGN.md
- `packages/realtime` — Esqueleto de suscripciones Realtime

### Criterios de éxito
- `pnpm build` corre sin errores en los 3 apps
- TypeScript strict mode funciona
- ESLint pasa en todos los packages
- Los tokens de diseño están exportados y son consumibles

---

## Fase 1: Base de Datos + Auth

**Duración estimada:** 2-3 sesiones

### Objetivo
11 migraciones de base de datos completas con PostGIS, RLS, índices, funciones,
y configuración de Supabase Auth.

### Entregables
- 11 archivos SQL en `supabase/migrations/`
- Auth configurado: Phone OTP + Google + Apple providers
- Storage bucket para documentos de conductores
- RLS policies en cada tabla
- Función `match_driver()` con protección FOR UPDATE
- Seed data para desarrollo

### Criterios de éxito
- `supabase db push` aplica las 11 migraciones sin errores
- `supabase gen types` genera TypeScript types correctos
- Phone OTP login funciona en entorno local
- Función match_driver() es atómica (no permite doble asignación)
- PostGIS ST_DWithin funciona con datos de seed

---

## Fase 2: Edge Functions + Matching Engine

**Duración estimada:** 2 sesiones

### Objetivo
Edge Functions en Deno para matching, pagos y notificaciones. Lógica de
matching engine con PostGIS.

### Entregables
- `supabase/functions/matching/` — Escucha solicitudes, busca drivers, broadcast Realtime
- `supabase/functions/payments-webhook/` — Webhooks Stripe + PayPal + Wompi
- `supabase/functions/notifications/` — Expo Push notifications
- Tests unitarios para matching logic con TDD

### Criterios de éxito
- Matching engine encuentra driver más cercano en < 500ms
- Webhooks procesan eventos de pago correctamente
- Notificaciones push llegan en < 5s

---

## Fase 3: Vertical Slice 0 — Flujo Completo del Rider

**Duración estimada:** 3-4 sesiones

### Objetivo
PRIMERA funcionalidad completa: rider puede hacer login, ver mapa, solicitar
viaje, ver matching, trackear, completar y pagar. Todo conectado de extremo a
extremo.

### Pantallas involucradas (de Stitch)
| Pantalla | Ruta Expo Router |
|---|---|
| splash_screen | `/` |
| onboarding | `/onboarding` |
| login_motosv | `/login` |
| registro_motosv | `/register` |
| home_passenger | `/(tabs)/home` |
| solicitud_de_viaje_tarifas | `/ride/request` |
| buscando_conductor | `/ride/searching` |
| conductor_encontrado | `/ride/found` |
| viaje_en_curso | `/ride/active` |
| detalle_de_recibo_de_viaje | `/ride/receipt` |
| calificacion_de_viaje | `/ride/rate` |

### Features involucradas
| Feature | Contenido |
|---|---|
| `features/auth/` | Login, register, session management |
| `features/onboarding/` | Onboarding screens |
| `features/home/` | Mapa, current location, "¿A dónde vas?" |
| `features/ride-request/` | Destino, tarifa estimada, solicitud |
| `features/ride-tracking/` | Matching, tracking del driver, viaje en curso |
| `features/payment/` | Checkout multi-gateway |
| `features/rating/` | Calificación post-viaje |

### Criterios de éxito
- Flujo completo funciona en simulador iOS/Android
- Realtime broadcast de ubicación del conductor
- Race condition: dos drivers no pueden aceptar el mismo ride
- Pago de prueba con Stripe test mode
- Diseño visual coincide con el archivo DESIGN.md de Stitch

---

## Fase 4: App del Conductor

**Duración estimada:** 3 sesiones

### Objetivo
App funcional para conductores: login, verificación de documentos, dashboard
de ganancias, recepción de solicitudes, navegación al pasajero.

### Pantallas involucradas
| Pantalla | Ruta Expo Router |
|---|---|
| login_motosv | `/login` |
| verificacion_de_documentos_piloto | `/onboarding/documents` |
| home_passenger | `/(tabs)/home` |
| dashboard_de_ganancias_piloto | `/(tabs)/earnings` |
| dashboard_de_ganancias_optimizado_piloto | `/(tabs)/earnings/optimized` |
| configuracion_y_ajustes | `/(tabs)/settings` |
| perfil_de_usuario_motosv | `/profile` |

### Criterios de éxito
- Driver recibe solicitudes en tiempo real
- Navegación GPS al pickup del rider
- Earnings dashboard con datos reales
- Documentos se suben y verifican

---

## Fase 5: Mensajería + Notificaciones

**Duración estimada:** 2 sesiones

### Objetivo
Chat en tiempo real entre rider y driver durante el viaje. Notificaciones push
para eventos clave.

### Pantallas involucradas
| Pantalla | Ruta |
|---|---|
| mensajeria_chat_con_piloto | `/ride/chat` |

### Criterios de éxito
- Mensajes entregan en < 1s vía Realtime
- Notificaciones push en estado idle/background
- Historial de mensajes preservado

---

## Fase 6: Centro de Seguridad + Ayuda

**Duración estimada:** 1 sesión

### Objetivo
Pantallas de seguridad y ayuda con contacto de emergencia, sharing de viaje,
y FAQ.

### Pantallas involucradas
| Pantalla | Ruta |
|---|---|
| centro_de_seguridad | `/safety` |
| centro_de_ayuda | `/help` |

### Criterios de éxito
- Botón de pánico envía alerta
- Trip sharing funciona con link público temporario
- FAQ es buscable

---

## Fase 7: Wallet + Promociones + Referidos

**Duración estimada:** 2 sesiones

### Objetivo
Billetera digital multi-gateway, código de referidos, promociones.

### Pantallas involucradas
| Pantalla | Ruta |
|---|---|
| billetera_y_pagos | `/wallet` |
| referidos_y_promociones | `/promotions` |

### Criterios de éxito
- Rider puede pagar con Stripe, PayPal, Wompi o Cash
- Código de referido funciona
- Promociones se aplican automáticamente al checkear elegibilidad

---

## Fase 8: Admin Web + Analytics

**Duración estimada:** 3 sesiones

### Objetivo
Dashboard web completo para administración: gestión de conductores, usuarios,
viajes en vivo, reportes, configuración de tarifas.

### Pantallas involucradas
- Dashboard de métricas
- Gestión de conductores (aprobación documentos)
- Gestión de viajes (en vivo + histórico)
- Configuración de tarifas dinámicas
- Reportes exportables (CSV, PDF)

### Criterios de éxito
- Admin ve métricas de la semana en tiempo real
- Aprobación/rechazo de documentos
- Exportación de reportes
- Configuración de tarifas persiste y afecta nuevos viajes

---

## Fase 9: Producción + Monitoreo + Optimización

**Duración estimada:** 2 sesiones

### Objetivo
Hardening para producción: Sentry avanzado, performance profiling, analytics,
Grafana dashboards, load testing.

### Entregables
- Sentry con source maps + breadcrumbs + performance tracing
- Dashboards de Grafana para métricas clave
- Load testing con k6 o Artillery
- Optimización de consultas PostGIS (EXPLAIN ANALYZE)
- EAS Build + EAS Submit configurado para stores
- Documentación de runbook

### Criterios de éxito
- Sentry captura errores con contexto completo
- Grafana muestra métricas de riders, drivers, viajes, pagos
- App pasa load test de 100 solicitudes/minuto
- Build de producción compila y firma correctamente
