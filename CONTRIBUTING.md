# Contribuir a MotoSV

## Primeros pasos

### Requisitos
- Node.js 20+ (ver `.nvmrc`)
- pnpm 9+ (`npm install -g pnpm@9`)
- Supabase CLI (`npm install -g supabase`)
- Expo CLI (`npm install -g expo-cli`)

### Setup local
```bash
# 1. Clonar e instalar
git clone <repo-url>
cd Mototaxiapp
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con las keys correspondientes

# 3. Iniciar Supabase local
supabase start

# 4. Generar tipos de TypeScript
supabase gen types typescript --local > packages/api/src/database.types.ts

# 5. Iniciar app de desarrollo
cd apps/rider
npx expo start
```

### Puertos locales
| Servicio | Puerto |
|---|---|
| Rider app (Expo) | 8081 |
| Driver app (Expo) | 8082 |
| Admin (Vite) | 5173 |
| Supabase Studio | 54323 |
| Supabase API | 54321 |
| Supabase DB | 54322 |

## Workflow

### Commits
Usar conventional commits:
```
feat(rider): implement ride request flow
fix(driver): prevent double-accept race condition
docs: add database schema documentation
ci: add GitHub Actions workflow
```

### Branches
- `main` — producción
- `develop` — integración
- `feature/<name>` — features nuevas

### PR Checklist
- [ ] TypeScript strict pasa
- [ ] ESLint sin errores
- [ ] Tests pasan (cuando existan)
- [ ] RLS policies verificadas
- [ ] Commits atómicos

## Debugging
- Rider app: `expo start --tunnel` para device físico
- Supabase logs: `supabase logs`
- Edge Functions: `supabase functions serve`
- Sentry: dashboard de errores en producción
