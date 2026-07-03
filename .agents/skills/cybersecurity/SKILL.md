# Cybersecurity — Skill de Auditoría de Seguridad

Se activa AUTOMÁTICAMENTE en TODA tarea que involucre: creación de tablas, Edge Functions, autenticación, manejo de datos de usuarios, pagos, API keys, o cualquier cambio en la capa de seguridad del proyecto.

## Checklist de Auditoría Obligatoria

Antes de escribir o modificar código con implicaciones de seguridad, verificar CADA punto:

### 1. RLS (Row Level Security)

- [ ] ¿La nueva tabla tiene `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`?
- [ ] ¿Tiene al menos una política para `authenticated` y otra para `admin`?
- [ ] ¿Las políticas usan `public.is_admin()` para acciones administrativas?
- [ ] ¿Se verificó que `anon` no tenga permisos de escritura en la tabla?

### 2. Edge Functions

- [ ] ¿`verify_jwt` está en `true` a menos que sea un webhook?
- [ ] Si es webhook: ¿verifica firma HMAC del payload?
- [ ] ¿Las funciones NO exponen datos internos (stack traces, SQL errors)?
- [ ] ¿Se revocó `PUBLIC` y `anon` de la ejecución?

### 3. Manejo de Errores

- [ ] ¿Los errores NUNCA exponen `(e as Error).message` directamente al usuario?
- [ ] Los mensajes de error deben ser genéricos: `t('errors.generic')`, `t('errors.deleteFailed')`
- [ ] ¿Los errores de autenticación no revelan si el usuario existe?
- [ ] ¿Se usa un helper centralizado para sanitizar errores?

### 4. Environment Variables

- [ ] ¿Las keys de Supabase se leen de `import.meta.env.VITE_*`?
- [ ] ¿NUNCA se usa `VITE_` para secrets (service_role key, API keys)?
- [ ] ¿`.env` y `.env*.local` están en `.gitignore`?
- [ ] ¿Los `.env.example` contienen placeholders, NO valores reales?

### 5. XSS Prevention

- [ ] ¿No se usa `dangerouslySetInnerHTML`?
- [ ] Si se usa Leaflet `divIcon`: ¿los valores dinámicos son numéricos o sanitizados?
- [ ] ¿Todo input de usuario se renderiza via JSX (auto-escaped)?
- [ ] ¿Los datos de la BD se tratan como no-confibles al renderizar?

### 6. HTTP Security Headers (Admin Web)

- [ ] ¿`index.html` o `vite.config.ts` tiene CSP configurado?
- [ ] ¿Hay `X-Content-Type-Options: nosniff`?
- [ ] ¿Hay `X-Frame-Options: DENY`?
- [ ] ¿Hay `Referrer-Policy: no-referrer`?

### 7. Autenticación

- [ ] ¿El login tiene rate limiting (cooldown entre intentos)?
- [ ] ¿Las passwords se envian por HTTPS (nunca HTTP)?
- [ ] ¿JWT expiry ≤ 1 hora?
- [ ] ¿Los tokens de sesión no se almacenan en AsyncStorage (usar SecureStore en mobile)?

### 8. Dependencias

- [ ] ¿Se corrió `pnpm audit` después de agregar/quitar dependencias?
- [ ] ¿Las versiones están fijadas en `package.json` (sin `^`/`~`)?
- [ ] ¿No hay dependencias con vulnerabilidades HIGH/CRITICAL conocidas?

### 9. Base de Datos

- [ ] ¿Los campos sensibles (PII, API keys) usan `pgp_sym_encrypt()` de pgcrypto?
- [ ] ¿Las funciones `SECURITY DEFINER` tienen `SET search_path = 'public'`?
- [ ] ¿Las contraseñas usan `crypt()` + `gen_salt('bf', 8)` de pgcrypto?

### 10. Producción

- [ ] ¿HTTPS está forzado?
- [ ] ¿HSTS está configurado (`max-age=31536000`)?
- [ ] ¿Los backups están encriptados?
- [ ] ¿Las network restrictions de Supabase están activadas?

## Protocolo de Bloqueo

Si CUALQUIER item del checklist falla en código nuevo/modificado:
1. DETENER la implementación inmediatamente
2. Reportar el hallazgo como BLOQUEANTE
3. No continuar hasta que el issue esté resuelto

Si se encuentra un issue de seguridad en código existente:
1. Reportar con severidad (CRITICAL / HIGH / MEDIUM / LOW)
2. Si es CRITICAL o HIGH: priorizar sobre cualquier otra tarea
3. Si es MEDIUM o LOW: agregar a backlog técnico con prioridad

## Referencias

- OWASP Top 10 2026: https://owasp.org/www-project-top-ten/
- Supabase Security Guide: https://supabase.com/docs/guides/platform/security
- Vite Security: https://vite.dev/guide/env-and-mode
