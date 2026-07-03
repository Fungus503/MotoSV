# Sistema de Diseño — MotoSV

Basado en el archivo `stitch-design/motosv/screens/motosv_design_system/DESIGN.md`
exportado de Google Stitch.

## 1. Filosofía Visual

**"Premium 2026"** — Una combinación refinada de **Modern Minimalism** y
**Glassmorphism**, influenciado por **Material Design 3** con tonal layering.

- **Minimalismo**: espacio negativo generoso para reducir carga cognitiva
- **Glassmorphism**: aplicado selectivamente en sheets y cards sobre el mapa
- **Profesionalismo**: tipografía de alto contraste, paleta de color sobria
- **"Controlled Velocity"**: UI se siente rápida y responsiva pero sólida y confiable

## 2. Colores

### Paleta Principal

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#006e2a` | Botones primarios, branding |
| `primary-container` | `#00c853` | Fondos de acento, contenedores activos |
| `on-primary` | `#ffffff` | Texto sobre primary |
| `on-primary-container` | `#004c1b` | Texto sobre primary-container |
| `inverse-primary` | `#3ce36a` | Primary en dark mode |

### Paleta de Superficie

| Token | Hex | Uso |
|---|---|---|
| `surface` | `#f7f9fc` | Fondo base (light mode) |
| `surface-dim` | `#d8dadd` | Superficie atenuada |
| `surface-bright` | `#f7f9fc` | Superficie brillante |
| `surface-container-lowest` | `#ffffff` | Tarjetas, modales |
| `surface-container-low` | `#f2f4f7` | Contenedores ligeros |
| `surface-container` | `#eceef1` | Contenedores |
| `surface-container-high` | `#e6e8eb` | Contenedores elevados |
| `surface-container-highest` | `#e0e3e6` | Contenedores máx elevación |
| `on-surface` | `#191c1e` | Texto principal |
| `on-surface-variant` | `#3c4a3c` | Texto secundario |

### Paleta Secundaria

| Token | Hex | Uso |
|---|---|---|
| `secondary` | `#525f71` | Elementos secundarios |
| `secondary-container` | `#d3e1f6` | Fondos secundarios |

### Paleta Terciaria

| Token | Hex | Uso |
|---|---|---|
| `tertiary` | `#006d35` | Acentos terciarios |
| `tertiary-container` | `#00c765` | Fondos terciarios |

### Errores y Estados

| Token | Hex | Uso |
|---|---|---|
| `error` | `#ba1a1a` | Texto/iconos de error |
| `error-container` | `#ffdad6` | Fondo de error |
| `outline` | `#6c7b6a` | Bordes |
| `outline-variant` | `#bbcbb8` | Bordes secundarios |

## 3. Tipografía

**Familia:** Plus Jakarta Sans

| Nivel | Size | Weight | Line Height | Letter Spacing | Uso |
|---|---|---|---|---|---|
| `display-lg` | 48px | 700 | 56px | -1px | Splash, hero |
| `display-md` | 36px | 700 | 44px | -0.5px | Onboarding |
| `headline-lg` | 28px | 600 | 36px | — | Títulos de pantalla |
| `headline-lg-mobile` | 24px | 600 | 32px | — | Títulos mobile |
| `title-lg` | 20px | 600 | 28px | — | Subtítulos |
| `body-lg` | 16px | 400 | 24px | — | Cuerpo principal |
| `body-md` | 14px | 400 | 20px | — | Cuerpo secundario |
| `label-lg` | 12px | 600 | 16px | 0.5px | Labels, metadata |
| `label-md` | 10px | 500 | 14px | — | Labels pequeños |

## 4. Formas y Bordes

| Token | Valor | Uso |
|---|---|---|
| `rounded-sm` | 4px (0.25rem) | Elementos pequeños |
| `rounded-default` | 8px (0.5rem) | Inputs, cards |
| `rounded-md` | 12px (0.75rem) | Cards elevadas |
| `rounded-lg` | 16px (1rem) | Botones primarios, inputs flotantes |
| `rounded-xl` | 24px (1.5rem) | Bottom sheets (top-only) |
| `rounded-full` | 9999px | Avatars, badges |

## 5. Espaciado

| Token | px | Rem |
|---|---|---|
| `base` | 4px | 0.25rem |
| `xs` | 8px | 0.5rem |
| `sm` | 12px | 0.75rem |
| `md` | 16px | 1rem |
| `lg` | 24px | 1.5rem |
| `xl` | 32px | 2rem |
| `2xl` | 48px | 3rem |
| `edge-margin` | 20px | 1.25rem |
| `gutter` | 16px | 1rem |

## 6. Elevación y Sombras

| Level | Técnica | Uso |
|---|---|---|
| 0 (Base) | Ninguna | Capa del mapa, fondo |
| 1 (Surface) | `0px 4px 20px rgba(13,27,42,0.08)` | Floating cards, inputs |
| 2 (Glass) | backdrop-filter: blur(20px), 1px border 10% white | Bottom sheets, overlays |
| Interactive | reduce shadow + scale(0.98) on press | Feedback táctil |

## 7. Componentes Principales

### Botón Primario
```
- Full width
- Background: #00c853
- Text: white, body-lg weight 600
- Border radius: 16px
- Height: 56px
- Haptic feedback: medium impact
```

### Botón Secundario
```
- Transparent
- Border: 1.5px solid #0D1B2A
- Border radius: 16px
- Height: 56px
```

### Floating Input
```
- Background: white (#ffffff)
- Border radius: 16px
- Padding horizontal: 12px
- Shadow: Level 1
- Active: 2px border #00c853
```

### Bottom Sheet ("¿A dónde vas?")
```
- Detents: 40% y 95% height
- Background: glassmorphic (blur 20px, opacity 85%)
- Grabber: 40px wide bar centered at top
- Top border radius: 24px
```

### Glassmorphic Driver Card
```
- Border radius: 16px
- backdrop-filter: blur(15px)
- Layout: avatar (48px circle) | name + rating | plate badge
```

### Map Markers
```
- User location: blue pulse with heading
- Driver: green #00c853 motorcycle icon
- Destination: deep navy #0D1B2A pin with white dot
```

## 8. Thumb Zone (Zona del Pulgar)

- Elementos interactivos primarios en el 40% inferior de la pantalla
- Bottom sheets y botones "Request" accesibles con el pulgar
- Mínimo 48px de touch target en todos los elementos interactivos

## 9. Modo Oscuro

| Token | Valor |
|---|---|
| Base background | `#0B0F14` |
| Surface | `#121821` |
| On-surface | `#E0E3E6` |

## 10. Implementación en packages/ui/

```
packages/ui/
├── src/
│   ├── tokens/
│   │   ├── colors.ts       # Todas las paletas
│   │   ├── typography.ts   # Escala tipográfica
│   │   ├── spacing.ts      # Sistema de espaciado
│   │   └── shapes.ts       # Border radius tokens
│   ├── components/
│   │   ├── Button.tsx       # Botón primario/secundario
│   │   ├── FloatingInput.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── DriverCard.tsx
│   │   ├── MapMarker.tsx
│   │   └── GlassCard.tsx
│   └── index.ts
```

## 11. Screens de Stitch (25 exportadas)

```
billetera_y_pagos                    → Wallet & payments
buscando_conductor                   → Looking for driver
calificacion_de_viaje                → Trip rating
centro_de_ayuda                      → Help center
centro_de_seguridad                  → Safety center
conductor_encontrado                 → Driver found
configuracion_y_ajustes              → Settings
dashboard_de_ganancias_optimizado    → Earnings dashboard (optimized)
dashboard_de_ganancias_piloto        → Earnings dashboard
detalle_de_recibo_de_viaje           → Trip receipt
direcciones_guardadas                → Saved addresses
historial_de_viajes                  → Trip history
home_passenger                       → Home (passenger)
login_motosv                         → Login
mensajeria_chat_con_piloto           → Chat
motosv_design_system                 → Design system reference
motosv_logo_premium                  → Premium logo
onboarding                           → Onboarding
perfil_de_usuario_motosv             → User profile
referidos_y_promociones              → Referrals & promotions
registro_motosv                      → Registration
solicitud_de_viaje_tarifas           → Trip request & fares
splash_screen                        → Splash
verificacion_de_documentos_piloto    → Document verification
viaje_en_curso                       → Trip in progress
```
