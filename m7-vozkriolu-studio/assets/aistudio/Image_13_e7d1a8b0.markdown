---
name: VozKriolu Studio
colors:
  surface: '#0d1322'
  surface-dim: '#0d1322'
  surface-bright: '#333949'
  surface-container-lowest: '#080e1d'
  surface-container-low: '#151b2b'
  surface-container: '#191f2f'
  surface-container-high: '#242a3a'
  surface-container-highest: '#2f3445'
  on-surface: '#dde2f7'
  on-surface-variant: '#bcc9cd'
  inverse-surface: '#dde2f7'
  inverse-on-surface: '#2a3040'
  outline: '#869397'
  outline-variant: '#3d494c'
  surface-tint: '#4cd7f6'
  primary: '#acedff'
  on-primary: '#003640'
  primary-container: '#4cd7f6'
  on-primary-container: '#005b6b'
  inverse-primary: '#00687a'
  secondary: '#b4c5ff'
  on-secondary: '#002a78'
  secondary-container: '#0053db'
  on-secondary-container: '#cdd7ff'
  tertiary: '#ffdbd7'
  on-tertiary: '#68000a'
  tertiary-container: '#ffb4ae'
  on-tertiary-container: '#a8071a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#0d1322'
  on-background: '#dde2f7'
  surface-variant: '#2f3445'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  timer-display:
    fontFamily: JetBrains Mono
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: 0.04em
  timer-display-mobile:
    fontFamily: JetBrains Mono
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: 0.03em
  mono-label-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  mono-label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a high-performance, studio-grade audio recording, editing, and natural language transcription interface tailored for linguistic preservation and Cape Verdean Creole (Kriolu) audio workflows. The identity bridges technical precision with contemporary Atlantic digital culture.

### Aesthetic Persona & Tone
- **Atmosphere:** Deep maritime night, high-fidelity acoustic hardware control room, and razor-sharp digital precision.
- **Personality:** Authoritative, focused, respectful of linguistic heritage, technically uncompromising.
- **Emotional Response:** Inspires confidence during high-stakes voice capture; delivers clear visual feedback during real-time speech processing and multilingual transcription.

### Design Paradigm
The interface utilizes a **Technical Studio Console** approach: deep slate/navy surfaces layered with measured tonal contrast, subtle edge highlights, hairline delimiters, and precise, luminous accents. It avoids visual clutter, offering generous negative space to minimize cognitive fatigue during extended editing and listening sessions. European Portuguese is the primary interface language.

## Colors

The palette is engineered for prolonged low-light focus, acoustic waveform clarity, and clear differentiation between audio capture states and computational linguistic tasks.

### Core Palette
- **Canvas Base (`#0d1322`):** Primary viewport backdrop; provides deep, non-fatiguing black-navy depth.
- **Card Surface Level 1 (`#151b2b`):** Primary container background for panels, sidebars, and inactive track regions.
- **Card Surface Level 2 (`#191f2f`):** Elevated modules, popovers, active track lanes, and nested inspection zones.
- **Border / Outline (`#26334d`):** Subtle structural boundaries, audio track dividers, and input borders.
- **Surface Hover (`#1e273d`):** Interactive feedback state for list items, cards, and secondary controls.

### Functional & Semantic Accents
- **Cyan (`#4cd7f6`):** Primary brand accent, active transport playheads, waveform peaks, live scrubbers, focus rings, and selection indicators.
- **Action 'Gravar' Solid Red (`#ef4444` / Hover: `#dc2626`):** Dedicated exclusively to the recording domain—live capture, microphone active states, armed tracks, and stop/record toggles.
- **Action 'Transcrever' Solid Vibrant Blue (`#2563eb` / Hover: `#1d4ed8`):** Dedicated exclusively to machine learning and transcription processes—initiating Creole model pipelines, dialect alignment, and text generation.
- **Success (`#10b981`):** Audio saved, transcription completed, export ready.
- **Warning / Quality Flag (`#f59e0b`):** Clipping audio levels, low signal-to-noise ratio, ambiguous phoneme flag.

### Accessibility Requirement
Color must never be the sole conveyor of information. All status chips, recording indicators, and audio diagnostics must accompany color tokens with explicit text tags (e.g., "[GRAVANDO]", "[A TRANSCREVER]", "[PROCESSADO]").

## Typography

The typographic hierarchy balances expressive tech-forward display forms with uncompromised legibility for linguistic analysis and data density.

### Font Roles
- **Headings & Brand (`Space Grotesk`):** Chosen for its geometric character, tech-native curves, and distinct modernism. Used across brand headers, page titles, and studio section landmarks.
- **Continuous Reading & System UI (`Inter`):** Applied to running prose, Portuguese interface descriptions, transcription editor blocks, options menus, and documentation modals.
- **Monospace Metadata & Timing (`JetBrains Mono`):** Applied to SMPTE timecodes (`00:04:12.430`), sample rates (`48.0 kHz / 24-bit`), confidence score chips (`98.4%`), dialect variant tags (`[ST - Santiago]`, `[SV - São Vicente]`), and audio level readings (`-12 dBFS`).

## Layout & Spacing

The layout operates on a flexible 12-column digital workstation grid, engineered to host audio tracks, waveform timelines, and synchronized text inspection side-by-side.

### Layout Rhythm
- **Global Structure:** Studio panels are framed by deliberate negative space (`margin-desktop: 3rem`) to prevent UI elements from crowding display borders.
- **Workstation Division:**
  - **Header Bar:** 64px fixed height pinned to top containing session identity, master VU metering, and global export actions.
  - **Left / Center Stage:** Fluid timeline, waveform visualization, and recording controls.
  - **Right Panel (Inspector & Transcription):** Collapsible panel (minimum 380px, maximum 520px) dedicated to dual Kriolu/Portuguese parallel transcription streams.
- **Responsive Adaptations:**
  - **Desktop (>1024px):** 12-column split; transport controls stay centered; timeline and transcription editor visible simultaneously.
  - **Tablet (768px - 1023px):** 8-column layout; transcription moves to a tabbed overlay or bottom-docked sliding drawer.
  - **Mobile (<768px):** Single-column stacked mode; primary screen emphasizes simplified recording transport, current VU monitor, and quick audio markers. Transcription editor operates full-screen via view toggle.

## Elevation & Depth

This design system avoids heavy decorative drop-shadows, using instead **Tonal Layers** accented with sharp hairline borders (`#26334d`) and subtle cyan ambient luminescence on focus.

### Surface Elevation Hierarchy
- **Base Level 0 (`#0d1322`):** Outer window canvas and structural track gutter margins.
- **Surface Level 1 (`#151b2b`):** Main studio workspace cards, inactive timeline channels, and auxiliary docks. Framed with a 1px solid border (`#26334d`).
- **Surface Level 2 (`#191f2f`):** Floating transport bars, active card focus states, dropdown menus, context inspectors, and active audio tracks.
- **Surface Level 3 / Overlay (`#212a3e`):** Modal dialogs, system alerts, audio export sheets, and floating tooltips.

### Active & Focused States
- When a track is active or an element receives keyboard/cursor focus, replace the muted border with a vibrant Cyan accent (`#4cd7f6`) paired with an ambient glow: `box-shadow: 0 0 0 1px #4cd7f6, 0 0 16px rgba(76, 215, 246, 0.15)`.
- When an armed recording state is active, the container receives a subtle Crimson perimeter glow: `box-shadow: 0 0 0 1px #ef4444, 0 0 20px rgba(239, 68, 68, 0.18)`.

## Shapes

The interface balances soft technical modularity through consistent medium-to-large corner radii, softening the high-contrast technical environment.

### Radius Assignments
- **Primary Studio Cards & Panels:** Apply `rounded-xl` (1.5rem / 24px) for major workspace containers, creating distinct modules against the deep canvas.
- **Sub-cards, Waveform Containers, & Modals:** Apply `rounded-lg` (1rem / 16px) for interior grouping units.
- **Buttons, Inputs, & Interactive Chips:** Apply standard `rounded-md` (0.5rem / 8px) to retain functional, tactile boundaries.
- **Circular Status Indicators & Record Triggers:** Complete pills or full circles (`rounded-full`) reserved strictly for the primary central record actuator and micro status pulses.

## Components

### Buttons

#### 1. Gravar (Record Trigger)
- **Visuals:** High-visibility Solid Crimson (`#ef4444`), text label in pure white `#ffffff`, font `Space Grotesk` medium 14px.
- **Hover / Active:** `#dc2626` hover; active scale transform `scale(0.98)`.
- **States:**
  - *Em Espera:* Solid red background, circular icon accompanied by text "Gravar Áudio".
  - *A Gravar:* Pulsing border with text "[A GRAVAR 00:03:12]", white square stop glyph.

#### 2. Transcrever para Crioulo (Primary Transcription Action)
- **Visuals:** Solid Vibrant Blue (`#2563eb`), white text, font `Space Grotesk` medium 14px.
- **Hover / Active:** `#1d4ed8` on hover.
- **States:**
  - *Normal:* "Transcrever para Crioulo" with spark/AI processing icon.
  - *Em Processamento:* Disabled state, spinner icon, label "[A PROCESSAR...]".

#### 3. Secondary & Ghost Actions
- **Ghost Action:** Background transparent, border 1px solid `#26334d`, text `#4cd7f6`. Hover: background `#151b2b`, border `#4cd7f6`.
- **Destructive Action:** Ghost border `#ef4444`, text `#ef4444`.

---

### Chips & Metadata Badges
- **Structure:** Always uses `JetBrains Mono` at `mono-label-sm` (11px).
- **Format:** Height 24px, padding 0 8px, border radius 6px.
- **Status Variants:**
  - **Gravando:** Background `rgba(239, 68, 68, 0.12)`, border `1px solid #ef4444`, text `#fca5a5`, text prefix dot `● GRAVANDO`.
  - **Processando:** Background `rgba(37, 99, 235, 0.15)`, border `1px solid #2563eb`, text `#93c5fd`, text `⚙ A TRANSCREVER`.
  - **Concluído:** Background `rgba(16, 185, 129, 0.12)`, border `1px solid #10b981`, text `#6ee7b7`, text `✓ CONCLUÍDO`.
  - **Variante Dialetal:** Background `#191f2f`, border `1px solid #26334d`, text `#4cd7f6`, text `VAR: BADIU (ST)`.

---

### Input Fields & Selectors
- **Surfaces:** Background `#151b2b`, border 1px solid `#26334d`, text `#f8fafc`.
- **Typography:** `Inter` 14px for content, `JetBrains Mono` for audio parameters (ex: sample rate selections).
- **Focus:** Border `#4cd7f6`, outline none, subtle glow `rgba(76, 215, 246, 0.2)`.
- **Labels:** Monospace uppercase (`JetBrains Mono` 11px), color `#94a3b8`, accompanied by explicit unit tags.

---

### Checkboxes & Radio Controls
- **Geometry:** 18x18px box, border 1.5px solid `#26334d`, radius 4px (checkbox) or circular (radio).
- **Checked State:** Background `#4cd7f6`, check/dot icon in `#0d1322`.

---

### Cards & Module Containers
- **Main Canvas Cards:** Background `#151b2b`, border 1px solid `#26334d`, border-radius 24px (`rounded-xl`), inner padding 24px (`space-lg`).
- **Inner Tool Cards:** Background `#191f2f`, border 1px solid `#26334d`, border-radius 16px (`rounded-lg`), inner padding 16px (`space-md`).

---

### Specialized Studio Components

#### 1. Audio Waveform Scrubber & Canvas
- **Background:** `#0d1322` recessed trough with inner hairline border.
- **Waveform Inactive:** Muted slate-cyan bars (`#26334d`).
- **Waveform Active / Played:** Luminous Cyan (`#4cd7f6`).
- **Playhead Needle:** 2px solid `#4cd7f6` with floating current time badge in `JetBrains Mono`.

#### 2. Dual-Stream Transcription Editor
- Split transcription viewport comparing original audio phonetics, Kriolu orthography (ALUPEC standard), and European Portuguese reference.
- **Active Timestamp Sync:** When an audio segment plays, the corresponding phrase block in the card transitions background from transparent to `#191f2f` with a left border highlight in 3px solid `#4cd7f6`.