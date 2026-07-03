# CI/CD y Despliegue — MotoSV

## 1. Estrategia General

| Entorno | Base de Datos | Apps Móviles | Admin Web |
|---|---|---|---|
| **Desarrollo local** | Supabase CLI (`supabase start`) | `expo start` | `vite dev` |
| **Preview branch** | Supabase branch (DB preview) | EAS Update channel: preview | Vercel preview |
| **Staging** | Supabase project staging | EAS Build: staging profile | Vercel staging |
| **Producción** | Supabase project prod | EAS Submit → App Store + Play Store | Vercel production |

## 2. Supabase CLI (Base de Datos)

### Comandos Principales

```bash
# Iniciar stack local
supabase start

# Aplicar migraciones locales
supabase db push

# Generar TypeScript types desde DB local
supabase gen types typescript --local > packages/api/src/database.types.ts

# Aplicar migraciones a producción
supabase db push --linked

# Crear branch de desarrollo (DB preview)
supabase branches create feature/my-feature

# Merge branch a producción
supabase branches merge <branch_id>
```

### Flujo de Migraciones

```
1. Editar migración local en supabase/migrations/XXX_name.sql
2. supabase db push → aplicar localmente
3. Probar cambios localmente
4. supabase gen types → regenerar TypeScript types
5. Commit + PR
6. CI aplica migración a preview branch
7. Merge → GitHub Action ejecuta supabase db push a producción
```

## 3. EAS Build + Submit (Apps Móviles)

### Perfiles de Build

```json
// apps/rider/eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true },
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "ios": { "buildType": "simulator" }
    },
    "production": {
      "channel": "production",
      "ios": { "buildType": "release" },
      "android": { "buildType": "app-bundle" }
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "...", "ascAppId": "..." },
      "android": { "track": "production" }
    }
  }
}
```

### Flujo de Release

```bash
# 1. Build producción
eas build --platform all --profile production

# 2. Subir a stores
eas submit --platform all --profile production

# 3. OTA updates (sin rebuild)
eas update --channel production --message "fix: price formatting"
```

## 4. GitHub Actions (CI)

### Workflow: Base de Datos

```yaml
# .github/workflows/db-migrate.yml
name: Database Migration
on:
  push:
    branches: [main]
    paths: ['supabase/migrations/**']

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase db push --linked
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
```

### Workflow: Apps

```yaml
# .github/workflows/app-build.yml
name: App Build
on:
  push:
    branches: [main, develop]
    paths: ['apps/**', 'packages/**']

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm typecheck

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm test
```

## 5. Admin Web (Vercel)

```bash
# Deploy automático conectando repo a Vercel
# Preview en cada PR
# Production en push a main

# Variables de entorno en Vercel dashboard:
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=
# VITE_GOOGLE_MAPS_API_KEY=
```

## 6. Edge Functions (Supabase)

```bash
# Deploy manual
supabase functions deploy matching --no-verify-jwt
supabase functions deploy payments-webhook --no-verify-jwt
supabase functions deploy notifications

# Secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set EXPO_ACCESS_TOKEN=...
```

## 7. Monitoreo

### Sentry (Errores)
```typescript
// packages/api/src/sentry.ts
import * as Sentry from '@sentry/react-native'

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  tracesSampleRate: 0.2, // 20% de transacciones
  attachScreenshot: true,
  enableAutoPerformanceTracing: true,
})
```

### Métricas Clave (Grafana)
| Métrica | Fuente | Alerta si... |
|---|---|---|
| Ride requests/minuto | Supabase query | Caída > 50% vs promedio |
| Matching success rate | Edge Function log | < 80% en matching |
| Payment failure rate | Stripe webhook | > 5% |
| Average pickup time | Cálculo en rides | > 10 minutos |
| Edge Function latency | Logs Deno | > 2s p95 |
| Error rate (5xx) | Sentry | > 1% |

## 8. Convenciones de Commit

```
type(scope): description

Tipos: feat, fix, refactor, perf, test, docs, chore, ci, security
Scope: rider, driver, admin, api, domain, ui, realtime, db, functions

Ejemplos:
feat(rider): implement ride request flow with fare estimation
fix(driver): prevent double-accept race condition
security(db): add RLS policies for driver_locations table
ci: add GitHub Actions workflow for database migrations
db: add 005_create_matching_rpc migration
```

## 9. Checklist Pre-Producción

- [ ] RLS policies verificadas en cada tabla (sin leaks)
- [ ] Edge Functions verifican JWT (verify_jwt: true)
- [ ] Sentry configurado en rider + driver + admin
- [ ] Source maps subidos a Sentry
- [ ] Stripe webhooks en modo production
- [ ] PayPal webhooks configurados
- [ ] Wompi webhooks configurados
- [ ] Google Maps API key restringida por app + HTTP referrers
- [ ] EAS Submit configurado para App Store + Play Store
- [ ] Supabase project en modo production (sin anon key expuesta)
- [ ] Rate limiting en Edge Functions
- [ ] Backup automático de DB habilitado
- [ ] Grafana dashboard configurado con alertas
- [ ] Load test pasado (100 solicitudes/minuto)
- [ ] Analytics de eventos clave registrados
