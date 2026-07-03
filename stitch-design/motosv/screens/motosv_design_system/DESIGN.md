---
name: MotoSV Design System
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#3c4a3c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#6c7b6a'
  outline-variant: '#bbcbb8'
  surface-tint: '#006e2a'
  primary: '#006e2a'
  on-primary: '#ffffff'
  primary-container: '#00c853'
  on-primary-container: '#004c1b'
  inverse-primary: '#3ce36a'
  secondary: '#525f71'
  on-secondary: '#ffffff'
  secondary-container: '#d3e1f6'
  on-secondary-container: '#566475'
  tertiary: '#006d35'
  on-tertiary: '#ffffff'
  tertiary-container: '#00c765'
  on-tertiary-container: '#004c22'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#69ff87'
  primary-fixed-dim: '#3ce36a'
  on-primary-fixed: '#002108'
  on-primary-fixed-variant: '#00531e'
  secondary-fixed: '#d6e4f9'
  secondary-fixed-dim: '#bac8dc'
  on-secondary-fixed: '#0f1c2c'
  on-secondary-fixed-variant: '#3a4859'
  tertiary-fixed: '#62ff96'
  tertiary-fixed-dim: '#00e475'
  on-tertiary-fixed: '#00210b'
  on-tertiary-fixed-variant: '#005226'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -1px
  display-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.5px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.5px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  edge-margin: 20px
  gutter: 16px
---

## Brand & Style

The design system is engineered for **MotoSV**, a premium motorcycle ride-sharing platform in El Salvador. It targets a professional urban demographic that values speed, safety, and reliability. 

The aesthetic, "Premium 2026," is a refined blend of **Modern Minimalism** and **Glassmorphism**, heavily influenced by **Material Design 3**'s tonal layering. It evokes an emotional response of "Controlled Velocity"—the UI feels fast and responsive but remains grounded and trustworthy. High-fidelity motion is a core tenet, utilizing spring-based physics for all transitions to mimic physical weight and inertia.

- **Minimalism:** Use of generous negative space to reduce cognitive load during high-speed navigation.
- **Glassmorphism:** Applied selectively to foreground elements like "Where to?" sheets and driver cards to maintain context of the underlying map.
- **Professionalism:** High-contrast typography and a restrained color palette ensure the app feels like a high-end enterprise tool rather than a casual utility.

## Colors

The palette is designed for high visibility in outdoor Salvadoran environments.

- **Primary (#00C853):** Used for critical action buttons, active route paths, and branding. It signifies "Go" and growth.
- **Secondary (#0D1B2A):** The grounding force. Used for text, iconography, and deep-surface backgrounds to provide a premium, "Midnight" feel.
- **Semantic Colors:** Success, Warning, and Error follow standard protocols but are calibrated for WCAG AA contrast ratios against both the `#FFFFFF` and `#F5F7FA` surfaces.
- **Surface Strategy:** This design system utilizes a "Step-Up" elevation logic. In light mode, the base is `#F5F7FA` and active surfaces are `#FFFFFF`. In dark mode, the base is `#0B0F14` and surfaces are `#121821`.

## Typography

While "Google Sans" was requested, **Plus Jakarta Sans** is implemented as the nearest high-performance alternative, offering the same geometric clarity and premium modernism required for React Native environments.

- **Scale:** A 1.25x type scale is used.
- **Hierarchy:** Display and Headline levels use Bold (700) or SemiBold (600) to ensure legibility while on the move.
- **Optimization:** Body text is set with a slightly increased line-height (1.5x) to accommodate vibration and glance-readability while riding.
- **Accessibility:** Minimum touch-target labels never drop below 10px, with 12px preferred for all interactive metadata.

## Layout & Spacing

This design system employs a **Fluid Grid** model optimized for one-handed thumb navigation. 

- **Thumb Zone:** Primary interactive elements (Bottom Sheets, "Request" buttons) are localized to the bottom 40% of the screen.
- **Rhythm:** An 8pt grid system (with 4pt sub-steps) governs all spacing.
- **Margins:** A standard 20px safe-area margin is applied to the left and right of all mobile screens to prevent visual crowding on curved displays.
- **Safe Areas:** Bottom sheets must account for the iOS Home Indicator and Android Navigation Bar, typically adding 32px of bottom padding.

## Elevation & Depth

The design system uses a combination of **Tonal Layers** and **Light Glassmorphism**.

- **Level 0 (Base):** Map layer or Base Background.
- **Level 1 (Surface):** Floating cards and inputs. Use a subtle `0px 4px 20px rgba(13, 27, 42, 0.08)` shadow.
- **Level 2 (Glass):** Bottom sheets and overlays. Use a backdrop blur of 20px and a 1px border with 10% white opacity (Light Mode) or 10% black opacity (Dark Mode).
- **Interactive Depth:** On press, elements should visually "sink" (reduce shadow and scale to 0.98) to provide haptic visual feedback.

## Shapes

The shape language is "Sophisticated Organic." 

- **Standard Elements:** Buttons and Input fields use a 16px (rounded-lg) radius to feel friendly but professional.
- **Containers:** Bottom sheets use a 24px (rounded-xl) top-only radius to create a soft, distinct separation from the map.
- **Map Markers:** Distinctive "Teardrop" or "Puck" shapes with a 50% (circle) radius for vehicle icons.

## Components

### Buttons
- **Primary:** Full-width, `#00C853` background, white text, 16px radius. Height: 56px for optimal thumb target.
- **Secondary:** Transparent with a 1.5px border of `#0D1B2A`.
- **Haptic Feedback:** All buttons must trigger a 'medium' impact haptic on touch down.

### Floating Inputs
- **Style:** Background `#FFFFFF` (or `#121821` in dark), 16px radius, 12px horizontal padding.
- **Shadow:** Use Level 1 shadow to appear floating above the map.
- **State:** Active state gains a 2px border of `#00C853`.

### Bottom Sheets ("Where to?")
- **Behavior:** Detented at 40% and 95% height. 
- **Visuals:** Glassmorphic background (blur: 20px, opacity: 85%). Includes a 40px wide "grabber" bar at the top center.

### Glassmorphic Driver Cards
- **Construction:** 16px radius, backdrop-filter: blur(15px).
- **Layout:** Avatar on left (48px circle), Name and Rating in center, Vehicle plate in a high-contrast badge on the right.

### Map Markers
- **User Location:** Blue pulse with directional heading.
- **Driver Location:** Primary Green `#00C853` motorcycle icon, simplified for high-speed rendering.
- **Destination:** Deep Navy `#0D1B2A` pin with a white center dot.

### Lists & Navigation
- **Lists:** Clean dividers (1px, 5% opacity), 16px vertical padding.
- **Navigation:** Bottom-tab bar with active state indicated by a pill-shaped background behind the icon, following Material Design 3 patterns.