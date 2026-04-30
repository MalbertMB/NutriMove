# Guia d'Estil — NutriMove
**Grup AF1 · FHiC 25-26 · Prototip P3**

> **Com llegir aquest document**
>
> Aquesta guia descriu el sistema visual de NutriMove tal com es fa servir al codi: tokens globals, patrons reutilitzables, jerarquia de components i criteris d’accessibilitat. Serveix com a referència per mantenir una mateixa veu visual quan s’afegeixen noves vistes o s’estenen les existents.

---

## Índex

1. [Tipografia](#1-tipografia)
2. [Paleta de colors](#2-paleta-de-colors)
3. [Espaiat i mides del sistema](#3-espaiat-i-mides-del-sistema)
4. [Radi de vores](#4-radi-de-vores)
5. [Ombres](#5-ombres)
6. [Icones](#6-icones)
7. [Etiquetatge i vocabulari canònic](#7-etiquetatge-i-vocabulari-canònic)
8. [Botons (CTA)](#8-botons-cta)
9. [Camps de formulari](#9-camps-de-formulari)
10. [Navegació](#10-navegació)
11. [Components de la IA simulada](#11-components-de-la-ia-simulada)
12. [Animacions i transicions](#12-animacions-i-transicions)
13. [Accessibilitat (WCAG 2.1 AA)](#13-accessibilitat-wcag-21-aa)
14. [Patrons de disseny documentats](#14-patrons-de-disseny-documentats)
15. [Resum d'inconsistències i accions](#15-resum-dinconsistències-i-accions)

---

## 1. Tipografia

### Famílies de lletra

| Rol | Família | Ús |
|-----|---------|-----|
| **Display** | `Syne` | Títols, noms de seccions, valors numèrics destacats (KPIs), logotip |
| **Body** | `DM Sans` | Tot el text de cos: etiquetes, descripcions, botons, inputs |

Importació via Google Fonts (a `index.html`):
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
```

> ⚠️ **Nota important**: DM Sans es carrega fins a `font-weight: 600`. Qualsevol element `body` amb `font-weight: 700` o `800` i `font-family: var(--font-body)` usarà el fallback del navegador. Reservar 700+ exclusivament per a elements que usin `var(--font-display)`.

### Escala tipogràfica

| Token (classe/ús) | Mida | Pes | Família | Line-height | Ús típic |
|---|---|---|---|---|---|
| `display-xl` | `28px` | 800 | Display | 1.0 | Valors KPI grans (StatCard) |
| `display-lg` | `22–26px` | 800 | Display | 1.0 | Kcal destacades (MealCard) |
| `display-md` | `18–20px` | 700–800 | Display | 1.1 | Títol de pàgina (TopBar), nom de perfil |
| `title` | `16–18px` | 700 | Display | 1.2 | Títols de targetes, noms de panells |
| `subtitle` | `14–15px` | 700 | Display | 1.2 | Subtítols de secció, títols de formulari |
| `body-md` | `14px` | 400–500 | Body | 1.5 | Text de cos principal |
| `body-sm` | `13px` | 400–500 | Body | 1.5 | Metadades, descripció de passos |
| `caption` | `12px` | 500–600 | Body | 1.4 | Notes, unitats, text secundari |
| `label` | `11px` | 600–700 | Body | 1.0 | Etiquetes de camps, tags, badges |
| `micro` | `10px` | 500–600 | Body | 1.0 | Text mínim (timestamps, crèdits) |

**Tokens tipogràfics recomanats** — Aquests valors es poden centralitzar a `base.css` per compartir la mateixa escala entre totes les vistes:

```css
:root {
  --text-display-xl: 28px;
  --text-display-lg: 24px;
  --text-display-md: 20px;
  --text-title: 16px;
  --text-subtitle: 14px;
  --text-body-md: 14px;
  --text-body-sm: 13px;
  --text-caption: 12px;
  --text-label: 11px;
  --text-micro: 10px;
}
```

### Letter-spacing (interletrat)

| Context | Valor |
|---------|-------|
| Etiquetes de camp (`field__label`) | `0.4–0.6px` |
| Tags i badges de tipus | `0.4–0.6px` |
| Cos normal | `0` (natural) |

---

## 2. Paleta de colors

### Variables CSS principals (`base.css`)

```css
:root {
  /* === Fons del Sidebar / elements foscos === */
  --navy:    #0D1B2A;   /* Sidebar, capçaleres de modals IA */
  --navy-2:  #1A2F45;   /* Gradients secundaris */
  --navy-3:  #243852;   /* Elements terciaris foscos */

  /* === Color d'acció principal === */
  --accent:       #00C896;              /* Botó primari, indicadors actius */
  --accent-dark:  #00A87E;              /* Hover del botó primari */
  --accent-light: rgba(0,200,150,0.12); /* Fons d'èxit, nav actiu */

  /* === Alerta / càrrega alta === */
  --warning:       #FF7A35;              /* Indicadors de càrrega alta */
  --warning-light: rgba(255,122,53,0.12);/* Fons d'avís */

  /* === Estat crític === */
  --danger:  #EF4444;   /* Accions destructives (eliminar) */
  --success: #00C896;   /* Àlies de --accent per semàntica */

  /* === Superfícies === */
  --surface:   #FFFFFF;   /* Targetes, modals */
  --surface-2: #F6F8FB;   /* Fons de la pàgina, sidebar dret */
  --surface-3: #EEF1F6;   /* Fons de camps, elements inactius */

  /* === Vores === */
  --border:   #E2E8F0;    /* Vores estàndard */
  --border-2: #CBD5E1;    /* Vores amb més contrast (hover, scrollbar) */

  /* === Text === */
  --text:     #0F1B2D;    /* Text principal */
  --text-2:   #475569;    /* Text secundari */
  --text-3:   #94A3B8;    /* Text terciari (placeholders, meta) */
  --text-inv: #FFFFFF;    /* Text sobre fons fosc */
}
```

### Colors semàntics de toast

Els estats de toast fan servir variables CSS pròpies per mantenir una aparença coherent i fàcil de reutilitzar:

```css
/* Afegir a base.css */
:root {
  --toast-success-bg:     #ECFDF5;
  --toast-success-text:   #065F46;
  --toast-success-border: #A7F3D0;

  --toast-warning-bg:     #FFFBEB;
  --toast-warning-text:   #92400E;
  --toast-warning-border: #FCD34D;

  --toast-error-bg:       #FEF2F2;
  --toast-error-text:     #991B1B;
  --toast-error-border:   #FECACA;

  --toast-info-bg:        #EFF6FF;
  --toast-info-text:      #1E40AF;
  --toast-info-border:    #BFDBFE;
}
```

**Fitxer afectat**: `src/components/ui/BaseToast.vue` (línies 64–67).

### Colors per als tipus de sessió

Definits al `weekStore.js`, usats dinàmicament via `--sess-color` i `--lib-color`:

| Tipus | Color | Hex |
|-------|-------|-----|
| Ciclisme | Índigo | `#6366F1` |
| Natació | Blau cel | `#0EA5E9` |
| Força | Violeta | `#8B5CF6` |
| Córrer | Ambre | `#F59E0B` |
| Ioga | Verd esmeralda | `#10B981` |
| Sessió doble | Vermell | `#EF4444` |

### Colors d'intensitat

La intensitat "Baixa" disposa de variables pròpies; la resta reutilitza tokens compartits del sistema:

| Intensitat | Fons | Vora | Text | Variables suggerides |
|-----------|------|------|------|---------------------|
| Baixa | `#F0FDF4` | `#86EFAC` | `#16A34A` | `--intensity-low-*` |
| Moderada | `var(--accent-light)` | `var(--accent)` | `var(--accent-dark)` | ✅ Usa variables |
| Alta | `var(--warning-light)` | `var(--warning)` | `var(--warning)` | ✅ Usa variables |

**Fitxer afectat**: `src/components/session/SessionEditPanel.vue` (línia 279).

```css
/* Afegir a base.css */
:root {
  --intensity-low-bg:     #F0FDF4;
  --intensity-low-border: #86EFAC;
  --intensity-low-text:   #16A34A;
}
```

### Ús del color i accessibilitat

- **Mai** usar el color com a únic indicador d'estat. Sempre combinar amb icona i/o text.
- La combinació `--text` (`#0F1B2D`) sobre `--surface` (`#FFFFFF`) dóna un contrast de **15.8:1** ✅
- La combinació `--text-2` (`#475569`) sobre `--surface` dóna **5.7:1** ✅
- La combinació `--text-3` (`#94A3B8`) sobre `--surface` dóna **2.9:1** ⚠️ — Usar exclusivament per a text decoratiu/meta, mai per a informació crítica.
- El verd `--accent` (`#00C896`) sobre `--navy` (`#0D1B2A`) dóna **7.2:1** ✅

---

## 3. Espaiat i mides del sistema

### Variables de layout

```css
:root {
  --sidebar-w:  240px;   /* Amplada del sidebar expandit */
  --topbar-h:   64px;    /* Alçada de la barra superior */
}
```

### Escala d'espaiat

No hi ha variables CSS per als espais. Es recomana la següent escala de referència per mantenir consistència:

| Token | Valor | Ús típic |
|-------|-------|----------|
| `--space-1` | `4px` | Gaps mínims entre icona i text |
| `--space-2` | `8px` | Gap entre elements de llista, gap de botons |
| `--space-3` | `12px` | Padding intern de badges, gap de grups |
| `--space-4` | `16px` | Padding de cel·les del calendari, gap de grid |
| `--space-5` | `20px` | Padding de targetes, seccions |
| `--space-6` | `24px` | Padding de vistes (page padding) |
| `--space-7` | `32px` | Separació entre seccions principals |

**Variables d'espaiat recomanades** — Declarar aquestes variables a `base.css` facilita que els components comparteixin els mateixos marges i separacions.

### Grid de contingut

| Zona | Configuració |
|------|-------------|
| Dashboard principal | `grid: 260px 1fr` (library + calendar) |
| KPI strip | `grid: repeat(4, 1fr)` |
| Calendari | `grid: 100px repeat(7, 1fr)` (gutter + 7 dies) |
| Sessions view | `grid: 1fr 320px` |
| Profile/Meals | `grid: repeat(auto-fill, minmax(300px, 1fr))` |

---

## 4. Radi de vores

### Variables definides

```css
:root {
  --radius-sm: 8px;    /* Opcions de picker, close buttons petits */
  --radius-md: 12px;   /* Botons principals, camps, panells interns */
  --radius-lg: 16px;   /* Toast, elements mitjos */
  --radius-xl: 24px;   /* Targetes (cards), modals, drawers */
}
```

### Radis complementaris

Els elements següents usen radis hard-coded que haurien d'usar les variables:

| Component | Valor actual | Variable correcta | Fitxer |
|-----------|-------------|-------------------|--------|
| `toast__close` | `6px` | `--radius-sm` (8px) o nova var `--radius-xs: 6px` | `BaseToast.vue:78` |
| `library__toggle` | `8px` | `var(--radius-sm)` | `SessionLibrary.vue:90` |
| `lib-item__icon` | `10px` | No té variable exacta → afegir `--radius-sm-plus: 10px` | `SessionLibrary.vue:134` |
| `close-btn` (EditPanel) | `8px` | `var(--radius-sm)` | `SessionEditPanel.vue:231` |
| `logo-mark` (Sidebar) | `10px` | `--radius-sm-plus` | `AppSidebar.vue:100` |
| `week-nav__btn` | `8px` | `var(--radius-sm)` | `AppTopBar.vue:91` |
| `ai-icon` (AIDrawer) | `10px` | `--radius-sm-plus` | `AIDrawer.vue:218` |
| `adj-item__day` | `6px` | `--radius-xs` | `AIDrawer.vue:288` |
| `close-btn` (AIPopover) | `8px` | `var(--radius-sm)` | `AIPopover.vue:150` |

**Complement de tokens**: Aquestes dues variables completen la escala de radi i s'apliquen en elements petits, botons d'icona i contenidors compactes:

```css
:root {
  --radius-xs:      6px;   /* Badgets petits, close buttons */
  --radius-sm-plus: 10px;  /* Icones contenidores, logo */
}
```

---

## 5. Ombres

### Variables definides

```css
:root {
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
  --shadow-xl: 0 24px 64px rgba(0,0,0,0.16);
}
```

### Jerarquia d'ús

| Variable | Ús |
|----------|----|
| `--shadow-sm` | Targetes en repòs (cards, calendar, library) |
| `--shadow-md` | Hover de targetes, botó primari en hover |
| `--shadow-lg` | Toast, tooltips, popovers |
| `--shadow-xl` | Modals, drawers, side panels |

### Ombres contextuals d'accent

Aquestes ombres reforcen l’estat actiu o la relació amb una sessió concreta utilitzant el color de context:

```css
/* Ombra de hover per al botó primari (IA + general) */
box-shadow: 0 4px 16px rgba(0, 200, 150, 0.3);  /* --accent amb 30% opacitat */

/* Ombra de hover per a session blocks al calendari */
box-shadow: 0 4px 12px color-mix(in srgb, var(--sess-color) 25%, transparent);
```

Localitzades a: `AIDrawer.vue:327`, `AIPopover.vue:207`, `WeekCalendar.vue:295`, `SessionLibrary.vue:125`.

---

## 6. Icones

### Sistema d'icones

**Material Symbols Rounded** (Google Fonts). Configuració base:

```css
.material-symbols-rounded {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-size: 20px;
}
.icon-fill {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

### Mida d'icones per context

| Context | Mida | Classe/estil |
|---------|------|--------------|
| Icones en navegació principal | `20px` | Per defecte |
| Icones en botons de text | `16px` | Escala manual |
| Icones en badges/tags | `12–13px` | Escala manual |
| Icones de tipus sessió (bloc calendari) | `14px` | Escala manual |
| Icones en panells d'IA (capçalera) | `22–24px` | Escala manual |
| Icones il·lustratives (empty state) | `20px` | Per defecte |

### Taula d'icones de navegació (P2 ✅ verificat)

| Secció | Icona | Estat al codi |
|--------|-------|--------------|
| Inici | `home` | ✅ |
| Sessions | `fitness_center` | ✅ |
| Àpats | `restaurant` | ✅ |
| Consells | `tips_and_updates` | ✅ |
| Progrés | `trending_up` | ✅ |
| Jo | `person` | ✅ |

### Icones de tipus de sessió

| Tipus | Icona |
|-------|-------|
| Ciclisme | `directions_bike` |
| Natació | `pool` |
| Força | `fitness_center` |
| Córrer | `directions_run` |
| Ioga | `self_improvement` |
| Sessió doble | `repeat` |

### Icones de slot d'àpat

| Àpat | Icona |
|------|-------|
| Esmorzar | `wb_sunny` |
| Dinar | `lunch_dining` |
| Berenar | `cookie` |
| Sopar | `dinner_dining` |

### Convencions d'ús

- Icones en botons: **sempre** a l'esquerra del text, mida `16px`.
- Icones en `icon-fill`: reservar per a estats actius, confirmació, IA i estats complets.
- Icones en mode outline (per defecte): estats neutres, navegació inactiva.

---

## 7. Etiquetatge i vocabulari canònic

### Termes canònics (P2 — Taula 7)

Aquests termes **no es poden substituir** per sinònims. Qualsevol text visible a la interfície ha d'usar estrictament els termes canònics.

| Terme canònic | Termes **descartats** | Motiu del descart |
|---|---|---|
| **Sessió** | Entrenament, workout | Terme neutre i curt; evita anglicismes |
| **Àpat** | Menjar, dieta, règim | Estàndard sense connotacions restrictives |
| **Bloc nutricional** | Menú, ració | Coherent amb la metàfora visual dels blocs |
| **Intensitat** | RPE, càrrega | Vocabulari natural usat pels usuaris |
| **Consell** | Alerta, recomanació | Amigable; "alerta" implica error |
| **Progrés** | Estadístiques, mètriques | Enfocat a la millora contínua |

### ✅ Verificació al codi

| Terme | Trobat al codi | Estat |
|-------|---------------|-------|
| "Sessió" | ✅ Usat arreu | Correcte |
| "Àpats" | ✅ Navegació + vistes | Correcte |
| "Consells" | ✅ Navegació i vista | Correcte |
| "Progrés" | ✅ Navegació i vista | Correcte |
| "Intensitat" | ✅ Formularis | Correcte |
| "Bloc nutricional" | 🔵 No implementat | Pendent de l'editor d'àpats |
| "workout" | ❌ No trobat | Correcte (absent) |
| "Dieta" | ❌ No trobat | Correcte (absent) |
| "Estadístiques" | ❌ No trobat | Correcte (absent) |

### Criteri de construcció d'etiquetes (P2)

1. **Orientació a l'acció**: verbs o noms en primera persona; s'eviten termes tècnics del sistema.
2. **Brevetat**: màxim 3 paraules per facilitar l'escaneig.
3. **Consistència**: el mateix terme per al mateix concepte arreu de l'aplicació.

---

## 8. Botons (CTA)

### Variants implementades

| Variant | Classe CSS | Aparença | Ús |
|---------|-----------|----------|----|
| **Primari** | `.btn--primary` | Fons `--accent`, text `--navy` | Acció principal, confirmació |
| **Ghost** | `.btn--ghost` | Transparent, vora `--border` | Cancel·lar, "Ara no", accions secundàries |
| **Secondary** | `.btn--secondary` | Fons `--accent-light`, text `--accent-dark` | Acció alternativa positiva (aplica parcial) |
| **Outline** | `.btn--outline` | Transparent, vora clara sobre fons fosc | Sobre fons `--navy` (ProfileHero) |

### Variants complementàries

| Variant | Classe suggerida | Ús previst |
|---------|-----------------|-----------|
| **Destructiu** | `.btn--danger` | Eliminar sessió, esborrar dades |
| **Desactivat** | `.btn:disabled` | Estat comú per a qualsevol variant que no pugui executar l'acció |

### Mides de botó

| Mida | Classe | Padding | Font-size | Ús |
|------|--------|---------|-----------|-----|
| **Normal** | `.btn` | `10–11px 18–20px` | `14px` | Botons de panell, modal |
| **Petit** | `.btn--sm` | `7–9px 14–16px` | `13px` | TopBar, accions compactes |
| **Ample complet** | `.btn--full` | (inherent) | — | Quick-add, formularis dins panells |

### Etiquetes de CTA (P2 — Taula 2)

Etiquetes **fixes** que no s'han de modificar per consistència:

| Acció | Etiqueta correcta | Estat al codi |
|-------|------------------|--------------|
| Confirmar canvi | **Aplica el canvi** | ✅ `SessionEditPanel.vue:89` |
| Rebutjar/cancel·lar | **Ara no** | ✅ `SessionEditPanel.vue:86`, `AIPopover.vue:51`, `AIDrawer.vue:107` |
| Desar la setmana | **Desa la setmana** | ✅ `AppTopBar.vue:22` |
| Acció originada per la IA | **Aplica el bloc IA** | Guia d'etiquetes IA |

### Etiqueta de l'acció de la IA

El botó principal dels diàlegs i panells d'assistència usa **"Aplica el bloc IA"** per identificar clarament que l'acció prové d'una recomanació automàtica.

```html
<button class="btn btn--primary" @click="applyAdjustment">
  <span class="material-symbols-rounded icon-fill">check_circle</span>
  Aplica el bloc IA
</button>
```

Quan hi ha una opció parcial o intermèdia, aquesta es manté com a variant secundària, però no substitueix l'acció principal.

### AdviceView i botons globals

`AdviceView.vue` comparteix el mateix sistema de botons global (`.btn`, `.btn--primary`, `.btn--ghost`) per mantenir la mateixa jerarquia visual que la resta de l'aplicació.

### Comportament interactiu dels botons

| Estat | Transformació | Ombra |
|-------|-------------|-------|
| `hover` (primari) | `translateY(-1px)` | `--shadow-md` |
| `hover` (primari IA) | `translateY(-1px)` | `0 4px 16px rgba(0,200,150,0.3)` |
| `active` | `translateY(0)` | Cap |
| `disabled` | `opacity: 0.4` | Cap; `cursor: not-allowed` |
| `focus-visible` | — | `outline: 2px solid --accent` offset 2px |

---

## 9. Camps de formulari

### Tipus implementats

| Tipus | Classe | Component |
|-------|--------|-----------|
| Select / desplegable | `.field__select` | DashboardView, SessionsView |
| Textarea | `.field__textarea` | SessionEditPanel |
| Duration picker (bottons) | `.dur-opt` | SessionEditPanel |
| Intensity picker (bottons) | `.int-opt` | SessionEditPanel |
| Toggle switch | `.toggle-btn` | ProfileView |

### Especificació de camps (P2 — Taula 2)

| Element | Etiqueta / Placeholder | Estat al codi |
|---------|----------------------|--------------|
| Durada | `Durada (ex. 1h 30min)` — La unitat es mostra al placeholder | ✅ Picker de botons amb format `1h 30min` |
| Intensitat | Opcions predefinides; evita dades numèriques | ✅ Baixa / Moderada / Alta |
| Objectiu personal | `Vull…` — Reforça en primera persona | Pendent de la pantalla de perfil |

### Camps previstos per a l'edició d'àpats

El patró d'edició d'àpats es basa en blocs nutricionals i pot incorporar aquests camps quan el flux inline estigui actiu:

- **Selector d'aliment**: cerca per nom, amb placeholder `Cerca un aliment...`
- **Quantitat**: camp numèric amb unitat visible al placeholder (`ex. 150g`)
- **Moment del dia**: selector entre `Esmorzar / Dinar / Berenar / Sopar`

### Estils de camp

```css
/* Estat de repòs */
border: 1.5px solid var(--border);
border-radius: var(--radius-md);
padding: 8–10px 10–12px;
font-family: var(--font-body);
font-size: 13px;
background: var(--surface);

/* Focus */
border-color: var(--accent);
outline: none;

/* Placeholder */
color: var(--text-3);
```

### Label dels camps

```css
font-size: 11px;
font-weight: 600;
color: var(--text-2);
text-transform: uppercase;
letter-spacing: 0.4–0.6px;
```

---

## 10. Navegació

### Navegació principal (L1) — ✅ Consistent amb P2

| Etiqueta | Ruta | Icona | Estat |
|----------|------|-------|-------|
| Inici | `/inici` | `home` | ✅ |
| Sessions | `/sessions` | `fitness_center` | ✅ |
| Àpats | `/apats` | `restaurant` | ✅ |
| Consells | `/consells` | `tips_and_updates` | ✅ |
| Progrés | `/progres` | `trending_up` | ✅ |
| Jo | `/jo` | `person` | ✅ |

### Navegació secundària (L2)

La navegació secundària s'ha implementat amb `SectionNav` per donar accés ràpid a les seccions principals de cada vista:

| Etiqueta | Secció pare | Justificació (P2) |
|----------|------------|------------------|
| **Nova sessió** | Sessions | Verb d'acció immediata |
| **Afegir àpat** | Àpats | Verb d'acció immediata |
| **Les meves rutines** | Sessions | Possessiu per reforçar la personalització |
| **Setmana** | Inici | Immediació temporal |
| **Avui** | Inici | Immediació temporal |
| **Pla setmanal** | Àpats | Visió global nutricional |
| **Log d'àpats** | Àpats | Registre diari |
| **Notificació predictiva** | Consells IA | Accés directe a alertes |
| **Historial de consells** | Consells IA | Historial de recomanacions |
| **Gràfics de rendiment** | Progrés | Visualització d'evolució |
| **Historial de sessions** | Progrés | Registre d'entrenaments |
| **Dades personals** | Jo | Perfil de l'usuari |
| **Preferències i objectius** | Jo | Configuració de la IA |

### Estils de l'element de navegació actiu

```css
/* Nav item actiu */
background: var(--accent-light);
color: var(--accent);

/* Nav item en hover (inactiu) */
background: rgba(255,255,255,0.06);
color: rgba(255,255,255,0.85);

/* Nav item inactiu */
color: rgba(255,255,255,0.5);
```

### Sidebar col·lapsable

- Amplada expandida: `var(--sidebar-w)` = `240px`
- Amplada col·lapsada: `72px`
- Transició: `width var(--dur-med) var(--ease)`
- Quan col·lapsat: es mostren únicament les icones (les etiquetes es treuen via `v-if` + `transition name="fade"`)

---

## 11. Components de la IA simulada

L'Assistent NutriMove és la IA simulada del front-end. El seu disseny segueix el patró definit al document P2.

### Patrons de missatge de la IA (P2)

| Patró | Format | Exemple |
|-------|--------|---------|
| **Notificació predictiva** | `[Nom], [acció] genera [conseqüència]. Et suggerim [acció] per [benefici].` | El motiu sempre apareix **abans** de la recomanació. |
| **Ajust automàtic** | `He ajustat [element] perquè [motiu]. Revisa els canvis.` | Veu activa; l'usuari manté el control final. |
| **Confirmació** | `Fet! [Resum breu del canvi].` | Retroalimentació immediata i positiva. |

### Identificació visual de la IA

- Nom consistent: **"Assistent NutriMove"** (no "IA", no "Bot", no "Robot")
- Icona: `auto_awesome` (icon-fill) en color `--accent`
- Fons de capçalera: `linear-gradient(135deg, var(--navy) 0%, var(--navy-2) 100%)`
- Badge "IA": fons `--navy`, text `--accent`, icona `auto_awesome`

### Components de la IA i quan usar-los

| Component | Patró | Context d'ús |
|-----------|-------|-------------|
| `AIPopover` | Diàleg contextual (_popover_) | **Tasca 1**: canvi en una sessió individual → impacte nutricional puntual |
| `AIDrawer` | Panell inferior (_bottom drawer_) | **Tasca 2**: planificació setmanal → impacte en múltiples dies |
| Inline (toast) | Retroalimentació (_toast/banner_) | Confirmació d'acció aplicada |
| 🔵 Inline contextual | Alerta en línia | Prototip B — missatge sota la fila de sessió afectada |

### Estructura del panell de l'Assistent (AIDrawer — 3 columnes)

Definida al document P2, correctament implementada al codi ✅:

```
[ Anàlisi ] [ Ajustos suggerits ] [ Acció ]
```

- **Anàlisi**: diagnòstic breu en llenguatge natural
- **Ajustos suggerits**: llista de canvis concrets amb icones
- **Acció**: botons amb jerarquia visual; l'opció recomanada és la prominent

---

## 12. Animacions i transicions

### Variables de temporització

```css
:root {
  --ease:      cubic-bezier(0.22, 1, 0.36, 1);       /* Easing estàndard (sortida suau) */
  --ease-back: cubic-bezier(0.34, 1.56, 0.64, 1);    /* Easing amb rebote (entrada) */
  --dur-fast:  150ms;   /* Hover, fade de badge */
  --dur-med:   300ms;   /* Panells, fade de pàgina */
  --dur-slow:  500ms;   /* Drawer, animació de càrrega de barres */
}
```

### Transicions de popover

`AIPopover.vue` usa la combinació `opacity` + `transform` amb `var(--dur-fast)` i `var(--ease)` per mantenir una sortida suau i coherent amb la resta de diàlegs.

### Animacions de keyframe disponibles

| Nom | Efecte | Ús típic |
|-----|--------|----------|
| `fadeIn` | Opacitat 0→1 | Elements simples |
| `fadeInUp` | Opacitat + translateY(12px→0) | Targetes, llistes |
| `fadeInDown` | Opacitat + translateY(-12px→0) | Dropdowns |
| `slideInRight` | Opacitat + translateX(24px→0) | Side panels |
| `slideInLeft` | Opacitat + translateX(-24px→0) | — |
| `slideInBottom` | Opacitat + translateY(32px→0) | Bottom drawer |
| `scaleIn` | Opacitat + scale(0.92→1) | Modals, popovers |
| `popoverIn` | scale(0.94) + translateY(-8px) | AIPopover |
| `drawerIn` | translateY(100%→0) | AIDrawer |
| `toastIn` | translateY(100%) + scale(0.9) | Toast |
| `progressFill` | width 0%→var(--target-width) | Barres de macros |
| `blockDrop` | scale(1.05→1) + shadow | Drop de sessió al calendari |
| `pulse` | opacitat pulsant | Estados de càrrega |

### Classes d'utilitat d'animació

```css
.animate-fadeInUp     /* fadeInUp 0.4s */
.animate-fadeIn       /* fadeIn 0.3s */
.animate-slideInRight /* slideInRight 0.35s */
.animate-pulse        /* pulse 2s infinite */

/* Delays encadenats */
.delay-1  /* 60ms */
.delay-2  /* 120ms */
.delay-3  /* 180ms */
.delay-4  /* 240ms */
.delay-5  /* 300ms */
```

### Transicions de Vue Router

| Nom de transició | Comportament d'entrada | Comportament de sortida |
|-----------------|----------------------|------------------------|
| `page-fade` | `fadeInUp 0.3s` | `opacity 0.15s` |
| `slide-right` | `slideInRight 0.35s` | `opacity + translateX(24px) 0.25s` |
| `slide-bottom` | `drawerIn 0.45s` | `translateY(100%) + opacity 0.3s` |
| `scale` | `popoverIn 0.35s` | `opacity 0.2s` |
| `fade` | `opacity 0.3s` | `opacity 0.3s` |
| `toast-anim` | `toastIn 0.35s` | `toastOut 0.25s` |

---

## 13. Accessibilitat (WCAG 2.1 AA)

Requisit establert al document P1 i concretat al P2. Tots els components han de complir els estàndards WCAG 2.1 Nivell AA.

### Implementat ✅

| Requisit | Implementació |
|----------|--------------|
| Indicadors d'alerta amb color + text | ✅ Totes les alertes tenen icona + text, no depenen únicament del color |
| Botons d'acció amb mida suficient | ✅ Mínims de 36×36px per a botons d'icona |
| `aria-label` en controls interactius | ✅ Tots els `<button>` sense text visible en tenen |
| `role="dialog"` + `aria-modal` | ✅ `SessionEditPanel`, `AIPopover`, `AIDrawer` |
| `aria-live="polite"` per a toasts | ✅ `BaseToast.vue` |
| `role="alert"` per a cada toast | ✅ |
| `aria-pressed` per a toggles i pickers | ✅ Intensity picker, toggle del perfil |
| `tabindex="0"` + `@keydown.enter` | ✅ Session blocks al calendari |
| `focus-visible` outline | ✅ `:focus-visible { outline: 2px solid var(--acc) }` |
| Text alternatiu per a contingut decoratiu | ✅ `aria-hidden="true"` en icones decoratives |
| `role="navigation"` + `aria-label` | ✅ Sidebar nav |
| `role="progressbar"` + `aria-valuenow` | ✅ `MacroBar.vue` |

### Punts d'accessibilitat per reforçar

| Requisit | Component afectat | Prioritat |
|----------|------------------|-----------|
| `aria-dropeffect` i `aria-grabbed` per al drag & drop | `WeekCalendar.vue`, `SessionLibrary.vue` | Alta |
| Alternativa de teclat per al drag & drop | Dashboard | **Crítica** — el drag & drop no és accessible per teclat |
| `aria-describedby` als camps de formulari | `SessionEditPanel.vue` | Mitjana |
| Skip-to-content link | `App.vue` | Baixa |
| Gestió del focus al obrir/tancar modals | `AIPopover`, `AIDrawer`, `SessionEditPanel` | Alta |
| Anunci de canvis via `aria-live` al calendari | `WeekCalendar.vue` | Mitjana |

> ⚠️ **Crític**: El drag & drop (`draggable="true"`) no és operable per a usuaris de teclat ni de lector de pantalla. L'alternativa amb botons o formulari ha de quedar sempre disponible i visible.

---

## 14. Patrons de disseny documentats

Implementats a P2 i presents al codi:

| Patró | Descripció | Component | Tasca |
|-------|-----------|-----------|-------|
| **Panell lateral inline** (_side panel_) | Edició sense canviar de pàgina | `SessionEditPanel` | T1 |
| **Diàleg contextual** (_popover_) | Ancorat al bloc afectat, suggeriment de la IA | `AIPopover` | T1 |
| **Notificació retroalimentació** (_toast/banner_) | Confirma l'acció sense interrompre el flux | `BaseToast` | T1, T2 |
| **Arrossegar i deixar anar** (_drag & drop_) | Planificació de sessions | `WeekCalendar` + `SessionLibrary` | T2 |
| **Mestre-Detall** | Veure paràmetres d'un bloc en clicar-lo | `WeekCalendar` → `SessionEditPanel` | T1 |
| **Panell inferior** (_bottom drawer_) | Recomanació de la IA, agrupa diagnòstic i botons | `AIDrawer` | T2 |

### Patrons en expansió

| Patró | Descripció | Ús previst |
|-------|-----------|-----------|
| **Alerta en línia** (_inline contextual feedback_) | Missatge i botons directament sota la sessió afectada | Edició d'àpats inline |
| **Desplegament progressiu** (_progressive disclosure_) | Mostra primer un avís concís, expandeix el detall si cal | Vista de consells |
| **Línia de temps** (_timeline_) | Estructura cronològica de sessions per hora del dia | Vista de sessions |

---

## 15. Mapa final del sistema

| Àrea | Tokens / components | Ús principal |
|---|---|---|
| Tipografia | `--font-display`, `--font-body`, `--text-display-*`, `--text-title`, `--text-body-*` | Títols, KPI, text de cos i etiquetes |
| Colors base | `--navy`, `--accent`, `--warning`, `--danger`, `--surface-*`, `--text-*` | Fons, acció, estats i contrast |
| Espaiat i radi | `--space-*`, `--radius-*`, `--sidebar-w`, `--topbar-h` | Layout, targetes, panells i botons |
| Ombres i moviment | `--shadow-*`, `--ease`, `--ease-back`, `--dur-*` | Hover, popovers, drawers i transicions |
| Botons | `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--outline`, `.btn--danger` | CTA compartides en tota la UI |
| Camps | `.field__select`, `.field__textarea`, `.dur-opt`, `.int-opt`, `.toggle-btn` | Edició, ajustos i preferències |
| Navegació | `AppSidebar`, `AppTopBar`, `SectionNav` | Navegació principal i secundària |
| IA simulada | `AIPopover`, `AIDrawer`, `BaseToast` | Recomanacions, confirmacions i feedback |
| Accessibilitat | `skip-link`, focus-visible, `aria-*`, teclat, `role="dialog"` | Navegació segura i usable |

Aquest mapa resumeix el llenguatge visual que ja està present al projecte i serveix de referència quan s'afegeixen noves vistes o components.

---