---
name: skill-madre
description: >
  SKILL MADRE - Se activa en CADA interacción. Orquesta TODAS las skills
  instaladas en .agents/skills/ para garantizar decisiones profesionales en cada
  línea de código, cambio de esquema, funcionalidad o archivo creado.
  CADA MENSAJE ejecuta el protocolo completo de escaneo, mapeo, verificación
  y ejecución. NO escribir código sin consultar las skills relevantes primero.
disable-model-invocation: true
---

# Skill Madre — Orquestador de Skills

**Anuncio inicial:** "Usando skill-madre para orquestar esta tarea."

## Regla Fundamental

Cada mensaje del usuario activa este protocolo. NO se ejecuta nada sin pasar
por las 5 fases. NO se escribe código sin verificar las 8 comprobaciones.

---

## Fase 1: Escaneo de Skills

1. Listar todas las skills en `.agents/skills/`
2. Leer los SKILL.md de las skills identificadas como relevantes en Fase 2
3. Extraer reglas, patrones, restricciones y ejemplos de cada skill

---

## Fase 2: Mapeo Tarea → Skills

| Si la tarea involucra... | Skills a consultar ANTES de escribir código |
|---|---|
| **UI / Componentes / Diseño visual** | `react-components`, `design-md`, `enhance-prompt`, `sleek-design-mobile-apps`, `frontend-design`, `stitch-design-taste`, `minimalist-ui`, `high-end-visual-design`, `design-taste-frontend`, `stitch-code-to-design`, `stitch-generate-design` |
| **Expo / React Native / Pantallas** | `building-native-ui`, `expo-ui`, `react-native-best-practices`, `vercel-react-native-skills`, `native-data-fetching`, `use-dom`, `expo-api-routes` |
| **DB / SQL / Migraciones / Esquema** | `supabase`, `supabase-postgres-best-practices`, `postgis` |
| **Row Level Security / Auth** | `supabase`, `supabase-postgres-best-practices` |
| **Tiempo real / GPS Tracking** | `supabase-realtime` |
| **Pagos / Stripe / Facturación** | `stripe-payments` |
| **Server state / Caching** | `tanstack-query` |
| **UI state local** | `zustand` |
| **State machine (ride lifecycle)** | `xstate` |
| **Animaciones / Transiciones** | `creating-reanimated-animations` |
| **Performance / Optimización** | `expo-react-native-performance` |
| **Monitoreo / Errores** | `sentry-react-native-sdk` |
| **Testing / TDD** | `tdd`, `test-driven-development` |
| **Plan / Arquitectura / PRD** | `improve-codebase-architecture`, `writing-plans`, `executing-plans`, `brainstorming`, `to-prd`, `prototype` |
| **Code Review / Debug** | `requesting-code-review`, `systematic-debugging` |
| **CI/CD / Deploy / Build** | `expo-deployment`, `expo-cicd-workflows`, `expo-dev-client` |
| **Stitch / Design system sync** | `stitch-manage-design-system`, `stitch-upload-to-stitch`, `stitch-extract-design-md`, `stitch-extract-static-html`, `stitch-loop`, `design-md`, `shadcn-ui` |

---

## Fase 3: Las 8 Verificaciones Profesionales

Antes de escribir CADA archivo o modificar CADA línea, verificar:

### 1. Skill Check
- [ ] ¿Leíste el SKILL.md de la(s) skill(s) relevante(s) para esta tarea?
- [ ] ¿Entiendes los patrones, restricciones y ejemplos que dicta?

### 2. Stack Check
- [ ] ¿El código usa las bibliotecas correctas del stack?
  - Frontend: Expo SDK 54+, React Native, TypeScript, NativeWind, TanStack Query, Zustand
  - Backend: Supabase (PostgreSQL 15 + PostGIS + Auth + Realtime + Storage + Edge Functions)
  - Admin: React 18 + Vite + Tailwind
  - Mapas: Google Maps Platform (Maps SDK, Routes, Directions, Places)
  - Pagos: Stripe + PayPal + Wompi + Cash (multi-gateway)
  - Monitoreo: Sentry + Grafana

### 3. Pattern Check
- [ ] ¿Sigue el patrón **feature-slices** (vertical slices)?
- [ ] Cada feature: `api/`, `components/`, `hooks/`, `queries/`, `screens/`, `services/`, `store/`, `types/`
- [ ] ¿Las rutas de Expo Router son delgadas (thin routes)?
- [ ] ¿La lógica de negocio está en features/, no en app/?

### 4. RLS Check (seguridad)
- [ ] ¿Cada tabla tiene Row Level Security habilitado?
- [ ] ¿Las policies filtran por `auth.uid()` correctamente?
- [ ] ¿Los roles (rider, driver, admin) están correctamente aislados?
- [ ] ¿Las RPC functions usan `SECURITY DEFINER` solo cuando es necesario?

### 5. Error & Loading Check
- [ ] ¿Maneja loading states (TanStack Query `isPending`)?
- [ ] ¿Maneja errores con `try/catch` o `onError`?
- [ ] ¿Muestra feedback al usuario (toast, snackbar)?
- [ ] ¿Cubre edge cases (sin conexión, timeout, respuesta vacía)?

### 6. TypeScript Check
- [ ] ¿TypeScript estricto (`strict: true`)?
- [ ] ¿Sin `any`?
- [ ] ¿Tipos generados de Supabase (`supabase gen types`)?
- [ ] ¿Zod validation en forms y Edge Functions?

### 7. Performance Check
- [ ] ¿Usa `FlashList` en lugar de `FlatList` para listas largas?
- [ ] ¿Componentes memoizados con `React.memo` donde aplica?
- [ ] ¿Evita re-renders innecesarios (useCallback, useMemo)?
- [ ] ¿Las imágenes tienen sizes correctos?
- [ ] ¿Las suscripciones Realtime se limpian en `useEffect` unmount?

### 8. Design Check (Stitch DESIGN.md)
- [ ] ¿Los colores siguen el design system: primary `#006e2a`, primary-container `#00c853`, surface `#f7f9fc`?
- [ ] ¿La tipografía usa Plus Jakarta Sans?
- [ ] ¿El glassmorphism y elevation siguen el DESIGN.md?
- [ ] ¿Los componentes reutilizan tokens del design system?

**Si alguna verificación falla: DETENERSE, leer la skill correspondiente, corregir, y reevaluar.**

---

## Fase 4: Ejecución Profesional

### Antes de empezar
- [ ] Confirmar con el usuario el alcance exacto de la tarea
- [ ] Escribir plan usando `writing-plans` si son +3 pasos
- [ ] Para lógica crítica (state machine, matching, pricing): usar **TDD**

### Durante la ejecución
- Un archivo = una responsabilidad
- Commits atómicos y frecuentes
- No anticipar features futuras (YAGNI)
- No duplicar sin necesidad (DRY)
- Las features NO dependen de otras features (solo de shared/)

### Stack de estado
| Tipo | Herramienta | Cuándo usarlo |
|---|---|---|
| Server state (API, DB) | TanStack Query | Datos del servidor, caching, invalidation |
| UI state | Zustand | Modal abierto, online toggle, ride state local |
| State machine | XState | Ride lifecycle: requested → assigned → in_progress → completed |

---

## Fase 5: Post-Implementación

- [ ] ¿No hay `console.log` en producción?
- [ ] ¿Sentry captura errores no manejados?
- [ ] ¿Las RLS policies protegen cada tabla?
- [ ] ¿Los tipos de Supabase están generados?
- [ ] ¿Las migraciones son reversibles (down migration)?
- [ ] ¿El diseño visual coincide con el DESIGN.md de Stitch?
- [ ] ¿Corren los tests (`vitest` / `jest`)?
- [ ] ¿El build de Expo compila (`npx expo export`)?

---

## Checklist de Stack

```
[ ] Stack: Expo SDK 54+ + React Native + TypeScript + NativeWind
[ ] Backend: Supabase PostgreSQL 15 + PostGIS + Auth + Realtime + Storage + Edge Functions
[ ] Maps: Google Maps Platform (Maps SDK, Routes, Directions, Places)
[ ] Payments: Stripe + PayPal + Wompi + Cash
[ ] Monorepo: Turborepo + pnpm (apps/: rider, driver, admin | packages/: api, domain, ui, realtime, config)
[ ] State: TanStack Query + Zustand + XState
[ ] Monitoring: Sentry
[ ] CI/CD: EAS Build + EAS Submit + Supabase db push
```

## Recordatorio Final

**CADA VEZ QUE RECIBAS UN MENSAJE:**
1. Escanea las skills
2. Mapea la tarea a las skills relevantes
3. Corre las 8 verificaciones mentales
4. Ejecuta profesionalmente
5. Verifica post-implementación

**NO CODIFICES NUNCA SIN HABER CONSULTADO LAS SKILLS RELEVANTES.**
