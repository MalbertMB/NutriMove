# Especificació Tècnica — NutriMove
## Document de definició completa de la plataforma web

**Projecte**: NutriMove — Plataforma unificada d'entrenament i nutrició  
**Grup**: AF1 · FHiC 25-26  
**Versió**: 1.0 · Abril 2026

---

## Índex

1. [Visió general del producte](#1-visió-general-del-producte)
2. [Arquitectura de la informació](#2-arquitectura-de-la-informació)
3. [Estructura global i components de layout](#3-estructura-global-i-components-de-layout)
4. [Pàgina: Inici — Dashboard setmanal](#4-pàgina-inici--dashboard-setmanal)
5. [Pàgina: Sessions](#5-pàgina-sessions)
6. [Pàgina: Àpats](#6-pàgina-àpats)
7. [Pàgina: Consells](#7-pàgina-consells)
8. [Pàgina: Progrés](#8-pàgina-progrés)
9. [Pàgina: Jo](#9-pàgina-jo)
10. [Tasca 1 — Editar sessió i confirmar ajust nutricional](#10-tasca-1--editar-sessió-i-confirmar-ajust-nutricional)
11. [Tasca 2 — Planificar la setmana i obtenir el pla nutricional](#11-tasca-2--planificar-la-setmana-i-obtenir-el-pla-nutricional)
12. [Components de l'Assistent NutriMove (IA simulada)](#12-components-de-lassistent-nutrimove-ia-simulada)
13. [Sistema de notificacions i retroalimentació](#13-sistema-de-notificacions-i-retroalimentació)
14. [Animacions i microinteraccions](#14-animacions-i-microinteraccions)
15. [Model de dades i estat de l'aplicació](#15-model-de-dades-i-estat-de-laplicació)
16. [Accessibilitat](#16-accessibilitat)
17. [Disseny responsiu](#17-disseny-responsiu)
18. [Flux d'onboarding](#18-flux-donboarding)
19. [Consideracions de rendiment](#19-consideracions-de-rendiment)

---

## 1. Visió general del producte

### 1.1 Proposta de valor

NutriMove és una plataforma web que integra la planificació d'entrenaments i la gestió nutricional en una única interfície, assistida per una intel·ligència artificial simulada. L'oportunitat clau del projecte és que cap aplicació del mercat resol la integració paral·lela de "com afecta el que menjo avui a l'entrenament de demà", tot fent-ho sense generar càrrega cognitiva a l'usuari.

### 1.2 Principis de disseny

Totes les decisions de disseny han de respectar els quatre principis següents, derivats directament de la investigació d'usuaris:

1. **Registre mínim**: Qualsevol interacció que requereixi entrada manual de dades ha de ser opcional o estar automatitzada. L'objectiu és que l'usuari pugui planificar la setmana sencera en menys de cinc minuts.

2. **Recomanacions justificades**: Tota acció suggerida per la IA ha d'anar acompanyada del motiu visible. Les recomanacions sense justificació es perceben com a imposicions i no s'accepten.

3. **Connexió visual immediata**: L'usuari ha de poder veure d'un cop d'ull la relació entre la càrrega d'entrenament i el pla nutricional, sense navegar entre pantalles.

4. **To adaptatiu**: L'Assistent NutriMove usa un to empàtic i motivador per a usuaris novells, i un to basat en dades i concís per a usuaris experts.

### 1.3 Perfil principal d'usuari (Persona)

L'aplicació s'ha dissenyat centrada en **Pau, 35 anys**, treballador actiu amb alta activitat física (5–6 sessions setmanals de ciclisme, natació i força). El seu nivell tecnològic és mitjà, usa el portàtil per a la planificació setmanal, i ha abandonat diverses apps per excés de complexitat o manca d'integració entre esport i nutrició. Accepta recomanacions de la IA si van acompanyades d'una justificació clara.

### 1.4 Mètriques d'èxit (SMART)

| Tasca | Temps objectiu | Taxa d'èxit |
|-------|---------------|-------------|
| Tasca 1 — Editar sessió + ajust nutricional | < 2 minuts | ≥ 90% |
| Tasca 2 — Planificació setmanal completa | < 5 minuts | ≥ 90% |

---

## 2. Arquitectura de la informació

### 2.1 Sistema d'organització

El contingut de NutriMove s'organitza principalment mitjançant un **esquema ambigu orientat a tasques** (_task-based organization_): les seccions s'anomenen per accions (planificar, gestionar, rebre, revisar, configurar), no per tipus de dada. Dins de la pantalla principal, un **esquema exacte cronològic** secundari mostra la setmana en curs de dilluns a diumenge.

Aquesta decisió emergeix de la investigació d'usuaris: tots els perfils entrevistats comparteixen un model mental comú on primer pensen en el que volen aconseguir i únicament després busquen les dades.

### 2.2 Esquema de navegació jeràrquica (Sitemap)

```
NutriMove
│
├── Inici / Dashboard          (L1) — Vista setmanal unificada
│   ├── Setmana actual         (L2) — Selector de setmana
│   └── Avui                   (L2) — Filtre al dia present
│
├── Sessions                   (L1) — Gestió d'entrenaments
│   ├── Nova sessió            (L2) — Formulari d'afegir
│   ├── Les meves rutines      (L2) — Biblioteca de sessions preconfigurades
│   └── Historial de sessions  (L2) — Registre d'entrenaments passats
│
├── Àpats                      (L1) — Planificació nutricional
│   ├── Afegir àpat            (L2) — Formulari d'entrada d'aliments
│   ├── Pla setmanal           (L2) — Vista de 7 dies
│   └── Log d'àpats            (L2) — Registre diari
│
├── Consells                   (L1) — Recomanacions de la IA
│   ├── Notificació predictiva (L2) — Alertes actives
│   └── Historial de consells  (L2) — Recomanacions passades
│
├── Progrés                    (L1) — Evolució i estadístiques
│   ├── Gràfics de rendiment   (L2) — Visualització temporal
│   └── Historial de sessions  (L2) — Dades acumulades
│
└── Jo                         (L1) — Perfil i configuració
    ├── Dades personals        (L2) — Informació biogràfica i biomètrica
    └── Preferències i objectius (L2) — Configuració de la IA i objectius
```

### 2.3 Sistema d'etiquetes

Totes les etiquetes de la interfície segueixen tres principis:
- **Orientació a l'acció**: verbs o noms en primera persona
- **Brevetat**: màxim 3 paraules
- **Consistència**: el mateix terme per al mateix concepte sempre

---

## 3. Estructura global i components de layout

### 3.1 Shell de l'aplicació

L'aplicació usa un layout de dues columnes:

```
┌────────────────┬─────────────────────────────────────────┐
│                │  TopBar (64px d'alçada, sticky)         │
│   Sidebar      ├─────────────────────────────────────────┤
│   (240px)      │                                         │
│   (sticky,     │       Contingut de la vista             │
│   100vh)       │       (scroll independent)              │
│                │                                         │
└────────────────┴─────────────────────────────────────────┘
```

### 3.2 Sidebar de navegació

**Comportament general**:
- Posició fixa a l'esquerra, alçada total de la finestra (`100vh`), `position: sticky; top: 0`
- Fons de color `--navy` (`#0D1B2A`)
- Amplada expandida: `240px`; col·lapsada: `72px`
- La transició entre estats és suau: `width 300ms cubic-bezier(0.22, 1, 0.36, 1)`

**Secció del logotip** (part superior):
- Quadrat de `36×36px` amb fons `--accent`, border-radius `10px`, icona `bolt` (Material Symbols, filled) en color `--navy`
- Nom "NutriMove" en font Syne, `18px`, `font-weight: 700`, color blanc
- Quan col·lapsat, el nom desapareix amb una transició `fade` (opacitat 0→1, 300ms)
- Separat del nav per una línia divisòria subtil `rgba(255,255,255,0.06)`

**Elements de navegació**:
- Sis elements principals (L1): Inici, Sessions, Àpats, Consells, Progrés, Jo
- Cada element té: icona a l'esquerra (`20px`) + etiqueta de text (quan expandit)
- Quan el cursor hi passa per sobre: fons `rgba(255,255,255,0.06)`, text `rgba(255,255,255,0.85)`; transició `150ms`
- Quan actiu (ruta coincident): fons `rgba(0,200,150,0.12)`, text i icona en color `--accent`; l'element actiu mostra un punt indicador (`6px`, color `--accent`) a la dreta
- Quan col·lapsat, les etiquetes desapareixen i es mostren únicament les icones; el tooltip del navegador mostra el nom en fer hover

**Secció d'usuari** (part inferior):
- Avatar circular de `36px` amb gradient de `--accent` a `#00A0D4`, lletra inicial del nom en negreta
- Nom de l'usuari (`13px`, `font-weight: 600`, blanc al 85%) i badge de mode ("Mode Avançat" en color `--accent`, `11px`)
- Quan col·lapsat, es mostra únicament l'avatar

**Botó de col·lapsar/expandir**:
- Ubicat a la part inferior del sidebar, amplada total
- Icona `chevron_left` / `chevron_right` segons l'estat
- Color `rgba(255,255,255,0.3)` en repòs, `rgba(255,255,255,0.7)` en hover
- Aria-label dinàmic: "Col·lapsar menú" / "Expandir menú"

### 3.3 Barra superior (TopBar)

**Comportament general**:
- Alçada fixa `64px`, `position: sticky; top: 0`, z-index `50`
- Fons blanc, `border-bottom: 1px solid --border`
- Contingut: dues zones (esquerra: títol; dreta: controls de context)

**Zona esquerra**:
- Títol de la pàgina actual en Syne, `20px`, `font-weight: 700`
- Subtítol opcional en text petit (`13px`, color `--text-3`): per exemple el rang de dates de la setmana

**Zona dreta** (controls de context, varien per pàgina):
- **Navegador de setmana**: botó ‹ + etiqueta del rang de dates + botó ›; embolcallat en un contenidor arrodonit amb fons `--surface-2` i vora `--border`; present al Dashboard i potencialment a Sessions i Àpats
- **Botó "Desa la setmana"**: botó primari petit; present al Dashboard i Sessions
- **Campana de notificacions**: botó d'icona `notifications` amb badge ataronjat de `8px` si hi ha alertes noves
- **Selector de mode** (Simple/Avançat): futur; toggle que canvia el nivell de detall de la informació mostrada

### 3.4 Transicions entre pàgines

Quan l'usuari canvia de ruta, la nova vista entra amb una animació `fadeInUp` de `300ms` (opacitat 0→1 + translateY 12px→0) mentre l'anterior desapareix amb un fade de `150ms`. El canvi de ruta sempre es fa amb `mode="out-in"` per evitar solapaments.

---

## 4. Pàgina: Inici — Dashboard setmanal

Aquesta és la pantalla central de NutriMove i el punt d'entrada principal. Conté la vista setmanal unificada que mostra simultàniament les sessions d'entrenament i la planificació nutricional.

### 4.1 Franja de KPIs (part superior)

Quatre targetes de mètriques disposades en una graella de quatre columnes iguals, amb un gap de `16px`.

Cada targeta conté:
- Icona en un quadrat de `44×44px` (fons i color temàtic per targeta, border-radius `12px`)
- Etiqueta de la mètrica en text micro (`11px`, majúscules, `--text-3`)
- Valor numèric principal en Syne (`28px`, `font-weight: 800`)
- Unitat opcional en text petit (`13px`, `--text-3`)
- Nota descriptiva en text micro (`11px`, `--text-3`)
- Badge de tendència opcional a la dreta superior (fletxa amunt/avall + percentatge o descripció)

Les quatre targetes del dashboard principal:

| # | Mètrica | Icona | Color temàtic |
|---|---------|-------|--------------|
| 1 | Sessions setmanals | `fitness_center` | `--accent` |
| 2 | Kcal cremades | `local_fire_department` | `#EF4444` (vermell) |
| 3 | Dies de càrrega alta | `warning` | `--warning` |
| 4 | Nutrició coberta (X/7 dies) | `check_circle` | `--accent` |

**Animació d'entrada**: Les targetes apareixen amb `fadeInUp` encadenades amb delays de `60ms` entre cada una.

**Comportament en hover**: Cada targeta s'eleva `2px` (`translateY(-2px)`) i l'ombra augmenta de `--shadow-sm` a `--shadow-md` amb una transició de `150ms`. Una línia de gradient de `--accent` de `2px` d'alçada apareix a la part superior de la targeta.

### 4.2 Zona principal: calendari + biblioteca lateral

Disposició en dues columnes:
- Columna esquerra (biblioteca): `260px` d'amplada fixa
- Columna dreta (calendari): ocupa la resta de l'amplada disponible
- Gap entre columnes: `20px`

### 4.3 Biblioteca de sessions (columna esquerra)

**Comportament general**:
- Targeta collapsable amb capçalera clicable (títol "Biblioteca de sessions" + icona `library_books` + botó de toggle `expand_more/less`)
- Quan expandida, mostra una graella de `3×2` d'elements arrossegables
- Una instrucció d'ajuda: "Arrossega al calendari per afegir una sessió" en text micro

**Elements de la biblioteca** (6 tipus de sessió):
Cada element és una targeta petita que conté:
- Icona contenidora de `36×36px` amb el color del tipus de sessió i border-radius `10px`
- Etiqueta del tipus de sessió (`11px`, `font-weight: 600`)
- Atribut `draggable="true"`; en iniciar el drag, el cursor canvia a `grabbing` i l'element s'escala lleugerament cap avall (`scale(0.96)`)
- En hover: l'element s'eleva `2px`, la vora i el fons s'intensifiquen, i apareix una ombra amb el color del tipus de sessió

**Banner d'alerta de càrrega alta** (apareix condicionalment):
- Fons gradient `#FFF7ED` → `#FEF3C7`, vora `#FCD34D`, border-radius `24px`
- Capçalera: icona `warning` (filled, color `--warning`) + text "Revisió nutricional" en Syne `13px` bold
- Cos: text explicatiu que llista els dies afectats
- Botó d'acció primari ample: fons `--warning`, text blanc, icona `auto_awesome` (filled), text "Revisar nutrició amb IA"
- Apareix amb animació `fadeInUp` quan un o més dies de la setmana estan en estat "warning"
- Desapareix amb transició fade quan tots els dies passen a estat "ok"

**Formulari d'afegir sessió ràpida**:
- Targeta amb capçalera "Afegir sessió ràpida" + icona `add_circle`
- Tres selectors: dia de la setmana, tipus de sessió, intensitat
- Botó primari ample "Nova sessió" (icona `add`)
- Quan s'afegeix una sessió amb intensitat Alta, el panell d'edició s'obre automàticament `300ms` després amb una animació d'entrada des de la dreta

### 4.4 Calendari setmanal unificat (columna dreta)

El calendari és el component central de l'aplicació. Conté tres parts verticals: la capçalera de dies, la pista de sessions i la pista d'àpats.

#### Capçalera de dies

- Graella de `1fr (gutter) + 7fr (dies)`
- Cada dia mostra: abreviatura del dia (`11px`, majúscules, `--text-3`) + número del mes (`14px`, `font-weight: 600`)
- El dia actual: fons `--accent-light` i el número del mes en un cercle de `28px` amb fons `--accent` i text `--navy`
- El rang de dates s'actualitza quan l'usuari navega entre setmanes

#### Pista de sessions ("Sessions")

- Alçada mínima per fila: `110px`
- Cada cel·la pot contenir zero, un o múltiples blocs de sessió
- Quan una sessió es troba en la cel·la, es mostra com un **bloc de sessió**
- Quan una cel·la és buida, mostra un indicador d'acció: icona `add_circle` + text "Afegeix sessió" en text micro; el fons té una vora discontinua (`border: 2px dashed --border`); en hover, el fons canvia a `--surface-2` i la vora s'intensifica

**Bloc de sessió**:
Cada sessió al calendari és un bloc interactiu amb:
- Fons: `color-mix(in srgb, TIPUS_COLOR 12%, transparent)`
- Vora: `1.5px solid color-mix(in srgb, TIPUS_COLOR 30%, transparent)`
- Border-radius: `12px`
- Contingut (de dalt a baix):
  - Fila de capçalera: icona del tipus (`14px`, color del tipus) + durada formada (`11px`, `font-weight: 700`, color del tipus) + icona `warning` (filled, `--warning`, `13px`) si la sessió té càrrega alta
  - Etiqueta de la sessió (`11px`, `font-weight: 600`, `--text`)
  - Línia de metadades: calories + intensitat (`10px`, `--text-3`)
- En hover: el fons s'intensifica al `20%`, la vora pren el color sòlid del tipus, l'element s'eleva `1px` i apareix una ombra amb el color del tipus
- En clicar: s'obre el panell d'edició lateral (Tasca 1)
- En estat de càrrega alta (`load: 'high'`): fons i vora usen el color `--warning` en lloc del color del tipus
- Accessible per teclat: `tabindex="0"`, `role="button"`, `aria-label` descriptiu

**Mecànica de drag & drop** (rebre sessions des de la biblioteca):
- Quan una sessió s'arrossega des de la biblioteca cap a una cel·la, la cel·la s'il·lumina: fons `--accent-light`, vora `--accent`, indicació visual clara de zona de drop vàlida
- En fer el drop, la cel·la torna al seu estat normal i el nou bloc apareix amb una animació `blockDrop` (scale `1.05`→`1` + ombra accent que desapareix, 400ms)
- Si el drop resulta en una sessió de càrrega alta, el banner d'alerta apareix a la biblioteca lateral

#### Pista d'àpats ("Àpats")

- Separada de la pista de sessions per una línia divisòria de `2px solid --border`
- Alçada mínima per cel·la: `90px`
- Cada cel·la representa la nutrició planificada d'un dia i conté (de dalt a baix):
  - Valor calòric en Syne (`16px`, `font-weight: 700`) + target calòric (`10px`, `--text-3`)
  - Tres mini-barres de macros (alçada `3px`, colors: índigo per hidrats, verd `--accent` per proteïna, ambre per greixos)
  - Badge d'estat: "Cobert" (fons `--accent-light`, text `--accent-dark`, icona `check_circle` filled) o "Revisar" (fons `--warning-light`, text `--warning`, icona `warning` filled)
  - Si la IA ha fet un ajust: badge petit "IA aplicada" amb icona `auto_awesome` filled
- Quan un dia és en estat "warning" (nutrició insuficient per a la càrrega d'entrenament), el fons de la cel·la pren un subtil tint ataronjat

#### Resum de la setmana (footer del calendari)

Una barra horitzontal sota el calendari que mostra en una línia:
- Total de sessions · Total de kcal cremades · Nutrició coberta X/7 dies
- Separadors de punt (`·`) entre elements
- Icones de color temàtic per a cada element
- Si la nutrició no es cobreix completament, el text d'aquest element es mostra en `--warning`

### 4.5 Navegació de setmana

El navegador de setmana (TopBar, zona dreta) permet moure's entre setmanes passades i futures:
- Botó ‹ → setmana anterior (`weekOffset--`)
- Etiqueta central: rang de dates de la setmana, per exemple "14 abr – 20 abr"
- Botó › → setmana següent (`weekOffset++`)
- Quan canvia la setmana, el calendari s'actualitza amb una transició `fade` suau

---

## 5. Pàgina: Sessions

### 5.1 Visió general

La vista de sessions mostra totes les sessions de la setmana organitzades per dia, amb detall complet de cada sessió i estadístiques de la setmana. Complementa el dashboard amb una vista de llista que facilita la gestió individual.

### 5.2 Columna esquerra — Llista de sessions per dia

**Capçalera de secció**: "Aquesta setmana" + badge numèric amb el total de sessions.

**Estructura de grups per dia**:
Cada dia de la setmana és un grup independent (targeta amb vora i border-radius `24px`). Cada grup conté:

*Capçalera del grup*:
- Fons `--surface-2`, vora inferior `--border`
- Avatar del dia: quadrat de `44×44px` (border-radius `12px`), fons `--surface-3` amb abreviatura i número; el dia actual usa fons `--accent` i text `--navy`
- Nom complet del dia + total de calories cremades del dia (si hi ha sessions)

*Llista de sessions del dia*:
Cada sessió és una fila que conté:
- Barra de color lateral (amplada `3px`, color del tipus de sessió) a l'esquerra absoluta
- Icona del tipus en quadrat de `34×34px` (border-radius `10px`, fons translúcid del color del tipus)
- Cos: nom de la sessió (`14px`, `font-weight: 500`) + metadades (durada · intensitat, `12px`, `--text-3`)
- Calories en text (`13px`, `font-weight: 600`, `--text-2`)
- Badge de càrrega (`LoadBadge`): "Càrrega normal" / "Càrrega alta" / "Complet"
- Botó d'eliminar (icona `delete_outline`): invisible en repòs, apareix en fer hover sobre la fila; en hover sobre el botó, el fons es torna `#FEF2F2` i la icona `--danger`
- En clicar la fila (excepte el botó d'eliminar), s'obre el panell d'edició
- Accessible per teclat: `tabindex="0"`, `@keydown.enter`

*Dia buit*:
- Text "Dia de descans" centrat, en cursiva, color `--text-3`

**Comportament en eliminar una sessió**:
La fila desapareix amb una animació de slide cap a l'esquerra i fade simultanis (300ms); el grup del dia es redimensiona suaument. Apareix un toast "Sessió eliminada." de tipus `info`.

### 5.3 Columna dreta — Panell d'estadístiques

**Targeta de resum setmanal**:
- Graella de `2×2` amb quatre mètriques: Sessions / Kcal cremades / Hores totals / Dies de càrrega alta
- Cada mètrica en una caixa individual (`--surface-2`, border-radius `12px`, text centrat)
- Valor en Syne `24px` `font-weight: 800`; etiqueta en `11px` `--text-3`
- El valor "Dies de càrrega alta" es mostra en `--warning` si supera 2

**Targeta de distribució per tipus**:
- Per cada tipus de sessió present a la setmana: icona en quadrat `28px` + nom del tipus + recompte + barra de progrés proporcional
- Les barres s'animen a l'entrada amb una transició `width` de `800ms var(--ease)`

**Biblioteca de sessions** (component reutilitzat):
La mateixa biblioteca arrossegable del Dashboard, amb les mateixes funcionalitats de drag & drop.

### 5.4 Panell d'edició de sessió (component compartit)

S'obre des de la pàgina de Sessions i des del Dashboard. Veure secció [10. Tasca 1](#10-tasca-1--editar-sessió-i-confirmar-ajust-nutricional) per la descripció completa.

---

## 6. Pàgina: Àpats

### 6.1 Visió general

La vista d'àpats mostra la planificació nutricional de la setmana sencera, un dia per targeta. Ofereix una visió detallada dels àpats de cada dia, l'estat nutricional i els ajustos de la IA.

### 6.2 Graella de targetes de nutrició diària

Disposició en graella adaptativa: `repeat(auto-fill, minmax(300px, 1fr))`, gap `16px`.

**Targeta d'àpat diari** (`MealCard`):

Cada targeta conté (de dalt a baix):

*Capçalera de la targeta*:
- Nom del dia de la setmana en Syne `15px` `font-weight: 700`
- Badge d'estat: "Cobert" (verd) o "Revisar" (ataronjat) amb icona i text
- Valor calòric total en Syne `26px` `font-weight: 800` + target calòric en `12px` `--text-3`

*Barres de macros* (`MacroBar`):
- Tres barres (hidrats, proteïna, greixos) amb:
  - Etiqueta i valor en grams
  - Barra de progrés en color temàtic, alçada `6px`, border-radius pill
  - Percentatge respecte l'objectiu diari
  - En entrada a la vista, les barres s'animen de 0% a la seva amplada real en `800ms`

*Llista de slots d'àpat*:
Quatre slots (Esmorzar, Dinar, Berenar, Sopar), cadascun amb:
- Icona del moment del dia (`wb_sunny`, `lunch_dining`, `cookie`, `dinner_dining`) en color `--accent`
- Nom de l'àpat (`12px`, `font-weight: 600`)
- Llistat d'aliments principals separats per comes (`11px`, `--text-3`; truncat amb `text-overflow: ellipsis`)
- Calories de l'àpat (`12px`, `font-weight: 600`)
- Botó d'editar (futur): icona `edit` que obre un formulari inline d'edició d'aliments

*Badge d'ajust de la IA* (condicional):
- Apareix quan la IA ha ajustat els àpats del dia
- Fons `--accent-light`, text `--accent-dark`, icona `auto_awesome` filled
- Text: "Ajustat per l'Assistent NutriMove"

**Estats de la targeta**:
- `ok`: targeta normal, badge verd
- `warning`: fons lleugerament groc `#FFFDF5`, vora `#FCD34D`

**Animació d'entrada**:
Les targetes apareixen amb `fadeInUp` encadenades; delay de `80ms × índex`.

### 6.3 Funcionalitat d'edició d'àpats (futura)

Quan l'usuari fa clic en un slot d'àpat, s'obre un formulari inline a la targeta (expansió progressiva):
- Camp de cerca d'aliment amb autocompletar
- Selector de quantitat amb unitat
- Botons "Desa l'àpat" / "Ara no"
- En desar, les macros i calories de la targeta s'actualitzen amb una animació de recompte numèric

### 6.4 Vista de log diari (futura)

Una subpàgina accessible des de la navegació secundària "Log d'àpats" que mostra una vista cronològica d'un dia concret, amb tots els àpats en forma de línia de temps vertical.

---

## 7. Pàgina: Consells

### 7.1 Visió general

La pàgina de Consells mostra les recomanacions actives generades per l'Assistent NutriMove, organitzades per prioritat. Inclou un historial de consells anteriors al panell lateral.

### 7.2 Llista de consells actius

Disposada en columna a l'esquerra, cada consell és una targeta (`TipCard`) amb:

*Vora lateral de color*: `4px solid` amb el color temàtic del tipus de consell:
- Nutrició → `--accent` (verd)
- Recuperació → `#6366F1` (índigo)
- Rendiment → `--warning` (ataronjat)

*Capçalera de la targeta*:
- Icona en quadrat de `40×40px` (fons translúcid del color temàtic)
- Metadades: tag del tipus (majúscules, `11px`, `--text-3`) + timestamp relatiu ("Ara", "Fa 2h", "Ahir")
- Badge "IA" a la dreta: fons gradient `--navy → --navy-2`, text i icona `--accent`, border-radius pill

*Cos del consell*:
- Títol en Syne `16px` `font-weight: 700`
- Descripció en `DM Sans` `13px` `line-height: 1.65` — text complet, sense truncar; inclou la justificació de la recomanació (context d'entrenament + motiu nutricional)

*Accions*:
- Botó primari: "Aplica el bloc IA" (aplica la recomanació directament)
- Botó ghost: "Ara no" (descarta el consell; passa a l'historial com a "ignorat")

**Animació d'entrada**: `fadeInUp` amb delay encadenat (`80ms × índex`).

**Missatge buit** (quan no hi ha consells actius):
- Il·lustració SVG centered
- Títol: "Tot en ordre!"
- Subtítol: "L'Assistent NutriMove revisarà els teus entrenaments i et notificarà quan tingui recomanacions."

### 7.3 Panell lateral — Historial de consells

Targeta fixa a la dreta (`280px`), `position: sticky; top: 80px`:
- Títol "Historial de consells" en Syne `15px` `font-weight: 700`
- Llista vertical d'entrades; cada entrada conté:
  - Punt de color: verd (`--accent`) si "Aplicat", gris (`--text-3`) si "Ignorat"
  - Etiqueta breu del consell (`12px`, `font-weight: 500`)
  - Data relativa (`11px`, `--text-3`)
  - Estat en text: "Aplicat" / "Ignorat"
- Les entrades estan separades per una línia divisòria subtil

### 7.4 Sistema de notificacions predictives (futura)

El sistema de notificació predictiva ha de funcionar de la manera següent:
- Quan l'usuari modifica una sessió i el sistema detecta un desajust nutricional, es genera automàticament un consell nou
- El consell apareix a la llista de "Consells" i simultàniament es mostra un toast informatiu: "Nou consell de l'Assistent NutriMove disponible"
- El badge de notificació a la barra lateral s'incrementa

---

## 8. Pàgina: Progrés

### 8.1 Visió general

La pàgina de Progrés mostra l'evolució temporal del rendiment esportiu i de l'adherència nutricional. Usa gràfics de barres simples (implementats en CSS pur, sense llibreries de tercers) per a màxima lleugeresa.

### 8.2 Fila de gràfics comparatius

Dues targetes de gràfic de barres disposades en dues columnes iguals:

**Gràfic 1 — Kcal cremades per setmana**:
- Eixos: ponent (6 setmanes) + vert (0–4000 kcal)
- Barres en color `--surface-3` per a setmanes passades; `--accent` per a la setmana actual
- En hover sobre una barra: `tooltip` que mostra el valor exacte

**Gràfic 2 — Sessions per setmana**:
- Mateixa estructura; barres en `rgba(99,102,241,0.25)` per a passades; `#6366F1` per a l'actual

**Animació d'entrada**: les barres creixen des de `height: 0` fins al seu valor real en `1s var(--ease)` quan la pàgina es renderitza (o quan la secció entra al viewport).

### 8.3 Secció de fites (Milestones)

Targeta ampla que mostra un registre de les millors marques i fites recents:

- Graella adaptativa de targetes de fita (`repeat(auto-fill, minmax(220px, 1fr))`)
- Cada targeta de fita: icona en quadrat `40×40px` (gradient `--accent-light → rgba(99,102,241,0.1)`) + nom de la fita + data + valor destacat en Syne `16px` `font-weight: 800`
- En hover: l'element s'eleva `1px` i l'ombra augmenta

### 8.4 Gràfic d'adherència nutricional

Una secció vertical que mostra el percentatge d'adherència a la planificació nutricional per cada una de les darreres cinc setmanes:

- Cada fila: etiqueta de la setmana + barra de progrés horitzontal + percentatge
- Color de la barra: `--accent` si ≥80%, `#F59E0B` (ambre) si ≥60%, `--danger` si <60%
- Les barres s'animen de 0% a l'amplada real en `1s var(--ease)` en entrar a la vista

### 8.5 Seccions futures

- **Gràfic de composició corporal**: evolució del pes, massa muscular i percentatge de greix
- **Registre de records personals (PRs)**: interfície per afegir i consultar marques personals per exercici
- **Exportació de dades**: botó per descarregar el historial en format CSV

---

## 9. Pàgina: Jo

### 9.1 Visió general

La pàgina del perfil recull totes les dades personals, biomètriques i les preferències de configuració de l'Assistent NutriMove. Segueix un to de primera persona ("Jo", "Les meves dades", "Els meus objectius").

### 9.2 Hero del perfil

Targeta de capçalera amb gradient fosc `--navy → --navy-2`, padding `28px`:
- Avatar circular de `64px` amb gradient `--accent → #00A0D4`, lletra inicial del nom
- Nom complet de l'usuari en Syne `22px` `font-weight: 800`, color blanc
- Metadades d'una línia: edat · mode actiu · activitats principals, en blanc al 50%
- Botó "Editar perfil" a la dreta: estil outline sobre fons fosc (fons `rgba(255,255,255,0.1)`, vora `rgba(255,255,255,0.2)`)

### 9.3 Graella de seccions del perfil

Disposada en `repeat(auto-fill, minmax(300px, 1fr))`, gap `16px`.

**Secció: Dades personals**:
- Llista de parelles clau-valor (etiqueta + valor)
- Parelles: Edat / Pes / Alçada / TMB estimada / Objectiu calòric diari / Nivell d'activitat
- Cada parella: etiqueta en `13px` `--text-2` + valor en `13px` `font-weight: 600` `--text`
- Separades per línies divisòries subtils

**Secció: Els meus objectius**:
- Llista amb punts de verificació (`radio_button_checked`, color `--accent`)
- Objectius de l'usuari en format de llista vertical (`13px`, `--text`)
- Botó "Editar objectius" al peu (futur)

**Secció: Preferències de l'Assistent NutriMove**:
Llista de toggles per activar/desactivar comportaments de la IA:

| Toggle | Descripció |
|--------|-----------|
| Notificacions proactives | L'assistent alerta quan detecta riscos nutricionals |
| Justificació visible | Mostra sempre el motiu de cada recomanació |
| Ajust automàtic d'àpats | Actualitza la nutrició automàticament en canviar una sessió |
| Resum setmanal | Envia un resum de rendiment cada dilluns |

**Cada toggle**:
- Etiqueta (`13px`, `font-weight: 500`) + descripció (`11px`, `--text-3`)
- Switch visual de `42×24px`:
  - Repòs: fons `--surface-3`, vora `--border`, dot blanc a l'esquerra
  - Actiu: fons `--accent`, vora `--accent`, dot blanc a la dreta amb animació `translateX(18px)` en `300ms var(--ease-back)` (lleuger rebote)
  - Accessible: `role="switch"`, `aria-pressed`, `aria-label`

**Secció: Mode d'interfície** (futura):
Toggle entre "Mode Senzill" i "Mode Avançat":
- Mode Senzill: oculta mètriques avançades (macros detallats, càrrega acumulada, RPE), simplifica els textos de la IA, usa el to empàtic i motivador
- Mode Avançat: mostra tota la informació disponible, usa el to basat en dades

---

## 10. Tasca 1 — Editar sessió i confirmar ajust nutricional

**Escenari**: És divendres al vespre. En Pau rep un missatge que la ruta de bici de demà s'allarga a 4 hores. Obre NutriMove i en menys de 2 minuts confirma que la seva nutrició d'avui és suficient.

**Dispositiu**: Portàtil, navegador web.  
**Temps objectiu**: < 2 minuts.  
**Taxa d'èxit objectiu**: ≥ 90%.

### 10.1 Flux complet pas a pas

**Pas 1 — Localitzar la sessió**:
L'usuari obre el Dashboard. El calendari setmanal és visible sense scroll. L'usuari localitza visualment el bloc de la sessió de dissabte i hi fa clic (o la selecciona per teclat amb Tab + Enter).

**Pas 2 — Obrir el panell d'edició** (`SessionEditPanel`):
El panell lateral llisca des de la dreta (`slideInRight`, `350ms var(--ease)`). Un overlay semitransparent (`rgba(0,0,0,0.3)` + `backdrop-filter: blur(2px)`) cobreix la resta de la pantalla. El focus del teclat salta al primer element del panell.

El panell conté (de dalt a baix):
- Capçalera: icona del tipus de sessió + nom + dia de la setmana + botó de tancar
- Secció "Durada": picker de sis opcions (30min, 1h, 1h 30min, 2h, 3h, 4h); cada opció és un botó amb vora; l'opció activa té fons `--accent-light`, vora `--accent`, text `--accent`
- Nota sota el picker: "Durada actual: X"
- Secció "Intensitat": tres botons en fila (Baixa, Moderada, Alta); cada un amb icona de bateria i etiqueta; Baixa → verd; Moderada → `--accent`; Alta → `--warning`
- Secció "Notes": textarea opcional (`3 rows`, placeholder "Descriu la sessió...")
- Caixa "Impacte estimat" (apareix amb `fadeInUp` quan hi ha canvis respecte els valors originals):
  - Calories cremades estimades
  - Si la intensitat és Alta: "Requeriment nutricional: +15% kcal" en color `--warning`

**Pas 3 — Modificar els valors**:
L'usuari selecciona "4h" del picker de durada i "Alta" del picker d'intensitat. La caixa d'impacte apareix. El botó "Aplica el canvi" s'activa (passa de `opacity: 0.4` a `opacity: 1`).

**Pas 4 — Aplicar el canvi**:
L'usuari fa clic a "Aplica el canvi". El panell es tanca. La sessió al calendari s'actualitza: el bloc mostra la nova durada i, si la intensitat és Alta, apareix la icona `warning` filled al bloc i el color canvia al de càrrega alta.

**Pas 5 — Rebre el suggeriment de la IA** (`AIPopover`):
`400ms` després del tancament del panell, apareix el popover contextual de la IA. Entra amb animació `popoverIn` (`scale 0.94→1 + translateY -8px→0`, `400ms var(--ease-back)`).

El popover conté (de dalt a baix):
- Capçalera fosc (`--navy → --navy-2`): "Assistent NutriMove" en `--accent` + icona `auto_awesome` filled + botó de tancar
- Bloc d'anàlisi (fons `--surface-2`): icona `bolt` (warning color) + títol "Anàlisi de la càrrega" + text descriptiu amb durada i intensitat en negreta
- Bloc de recomanació: etiqueta "Suggeriment nutricional" + text complert de la recomanació + pills de delta calòric i de hidrats (`--accent-light`, `--accent-dark`)
- Peu d'accions: "Ara no" (ghost) | "Aplica el bloc IA" (primari, icona `check_circle` filled)

**Pas 6a — L'usuari accepta** ("Aplica el bloc IA"):
- El popover es tanca amb `opacity + scale` en `200ms`
- Les cel·les d'àpats dels dies afectats s'actualitzen: les calories pugen, les mini-barres de macros s'animen fins als nous valors, el badge canvia a "Cobert"
- Apareix un toast d'èxit: "Fet! Àpats ajustats per a la sessió d'alta intensitat."
- El toast entra des de baix (`toastIn`, `350ms var(--ease-back)`), es manté `3.5s` i surt cap a baix (`toastOut`, `250ms`)

**Pas 6b — L'usuari no accepta** ("Ara no"):
- El popover es tanca
- Apareix un toast informatiu: "Sessió actualitzada. Podeu revisar els àpats quan vulgueu."
- L'estat del dia continua en "warning"

### 10.2 Accions secundàries del panell d'edició

- **Tancar sense guardar** (botó X o clic al overlay): el panell es tanca, cap canvi es desa, no apareix popover de la IA
- **Botó "Ara no"** del peu del panell: equivalent a tancar sense guardar
- Si l'usuari ha modificat valors però fa clic a "Ara no" o al overlay, caldria mostrar un diàleg de confirmació (futur): "Tens canvis sense desar. Vols continuar?"

---

## 11. Tasca 2 — Planificar la setmana i obtenir el pla nutricional

**Escenari**: És diumenge a la tarda. En Pau planifica la setmana sencera des del portàtil. En menys de 5 minuts ha organitzat totes les sessions i la nutrició s'ha ajustat automàticament.

**Dispositiu**: Portàtil, navegador web.  
**Temps objectiu**: < 5 minuts.  
**Taxa d'èxit objectiu**: ≥ 90%.

### 11.1 Flux complet pas a pas

**Pas 1 — Accedir al Dashboard**:
L'usuari obre NutriMove i es troba a la vista setmanal buida (o amb poques sessions). La biblioteca de sessions és visible a l'esquerra.

**Pas 2 — Afegir sessions (drag & drop)**:
L'usuari arrossega elements de la biblioteca cap a les cel·les del calendari de sessions:
- En iniciar el drag, el cursor canvia a `grabbing` i l'element de la biblioteca s'escala a `scale(0.96)` per indicar que s'ha agafat
- Les cel·les del calendari activen l'estil de "zona de drop" quan el cursor hi passa per sobre: fons `--accent-light`, vora `--accent`, transició `150ms`
- En fer el drop, la cel·la torna al normal, el bloc de sessió apareix amb `blockDrop` (`scale 1.05→1`, ombra `--accent` que desapareix, `400ms`)
- El sistema recalcula automàticament la nutrició dels dies afectats

**Pas 3 — Detectar la sessió doble de dimecres**:
L'usuari deixa caure una "Sessió doble" (o dues sessions d'alta intensitat) al dimecres. El sistema detecta la càrrega alta:
- El bloc del dimecres canvia a l'estil de càrrega alta (fons i vora ataronjats)
- La cel·la d'àpats del dimarts (dia anterior) i del dimecres canvien a estat "warning"
- El banner d'alerta de la biblioteca lateral apareix amb `fadeInUp`, esmentant els dies afectats

**Pas 4 — Obrir el panell de la IA** (`AIDrawer`):
L'usuari fa clic al botó "Revisar nutrició amb IA" del banner. El drawer puja des de la part inferior de la pantalla:
- Animació `drawerIn`: `translateY(100%→0)`, `450ms var(--ease)`
- L'overlay cobreix la pantalla: `rgba(13,27,42,0.5)` + `backdrop-filter: blur(4px)`
- L'overlay és clicable per tancar el drawer

El drawer conté (de dalt a baix):
- Handle de drag visible: barra de `40×4px`, `--border-2`, centrada; clicable per tancar
- Capçalera: icona de la IA `48×48px` (fons gradient `--navy`, icona `auto_awesome` en `--accent`) + títol "Recomanació NutriMove" + subtítol amb els dies afectats + botó X
- Tres columnes horitzontals separades per línies divisòries d'`1px`:

  *Columna 1 — Anàlisi*:
  - Títol "Anàlisi" (icona `bar_chart` + text, `font-weight: 700`, majúscules)
  - Caixa de resum: tres parelles estadística/valor (Càrrega total, Kcal estimades, Risc fatiga)
  - Text descriptiu de l'anàlisi en `13px`, `line-height: 1.6`

  *Columna 2 — Ajustos suggerits*:
  - Títol "Ajustos suggerits"
  - Llista d'entrades per dia; cada entrada: badge del dia (fons `--accent-light`, text `--accent-dark`) + descripció + delta calòric
  
  *Columna 3 — Acció*:
  - Títol "Acció"
  - Descripció breu
  - Llista de preview amb checkmarks verds: "Nutrició ajustada X dies", "Risc de fatiga eliminat", "Calendari en verd"

- Peu d'accions (tres botons):
  - "Ara no" (ghost, esquerra)
  - "Aplica parcialment" (secondary/accent-light, centre)
  - "Aplica el bloc IA" (primari, dreta, icona `auto_awesome` filled)

**Pas 5a — L'usuari aplica tots els ajustos** ("Aplica el bloc IA"):
- El drawer es tanca (`translateY(100%)`, `300ms`)
- Les cel·les d'àpats dels dies afectats s'actualitzen: les barres de macros s'animen, els badges canvien a "Cobert" (transició del color de la vora de `--warning` a `--accent-light`)
- Els blocs de sessió dels dies de càrrega alta conserven el seu indicador però la cel·la d'àpats adjacent mostra el badge "IA aplicada"
- Apareix un toast d'èxit extens (durada `4.5s`): "Fet! Setmana planificada. Nutrició coberta per a totes les sessions."
- El banner d'alerta de la biblioteca lateral desapareix

**Pas 5b — L'usuari aplica parcialment**:
- S'apliquen els ajustos dels dies més crítics (dia de la sessió doble i el dia anterior)
- Toast informatiu: "Ajust parcial aplicat. Reviseu el calendari."
- Alguns dies continuen en estat "warning"

**Pas 5c — L'usuari tanca el drawer sense aplicar**:
- El drawer es tanca, cap canvi a la nutrició
- L'estat del calendari es manté igual

**Pas 6 — Revisar el calendari complet**:
L'usuari revisa visualment el calendari. Tots els dies (o la majoria) mostren el badge "Cobert" verd. La barra de resum al peu del calendari mostra "Nutrició coberta 7/7" (o el nombre corresponent). L'usuari fa clic a "Desa la setmana" i apareix un toast de confirmació.

---

## 12. Components de l'Assistent NutriMove (IA simulada)

### 12.1 Identitat de la IA

- **Nom**: sempre "Assistent NutriMove" (mai "IA", "Bot", "Robot" o similar)
- **Icona**: `auto_awesome` (Material Symbols, filled), color `--accent`
- **Fons de capçalera**: gradient `linear-gradient(135deg, --navy 0%, --navy-2 100%)`
- **Badge identificador**: fons gradient fosc, text `--accent`, icona `auto_awesome`; mostra "IA" en text micro

### 12.2 Patrons de missatge

Tots els missatges de la IA segueixen tres patrons fixes:

| Patró | Estructura | Exemple |
|-------|-----------|---------|
| Notificació predictiva | `[Acció] genera [conseqüència]. Et suggerim [acció] per [benefici].` | "La ruta de demà requereix energia extra. Afegeix hidrats al teu sopar d'avui." |
| Ajust automàtic | `He ajustat [element] perquè [motiu]. Revisa els canvis.` | "He ajustat el dinar del dimarts perquè la sessió doble del dimecres requereix reserves de glucogen." |
| Confirmació | `Fet! [Resum breu del canvi].` | "Fet! Àpats ajustats per a la sessió d'alta intensitat." |

**Regla clau**: el motiu sempre apareix **abans** de la recomanació. Mai s'ha de dir "Fes X" sense primer explicar "perquè Y".

### 12.3 AIPopover — Diàleg contextual (Tasca 1)

- **Quan apareix**: quan l'usuari desa una sessió amb intensitat Alta o durada ≥ 4h
- **Posició**: centrat a la pantalla, sobre un overlay semitransparent
- **Dimensions**: màx. `420px` d'amplada, alçada adaptativa
- **Animació d'entrada**: `popoverIn` (`scale 0.94→1 + translateY -8px→0`, `400ms var(--ease-back)`)
- **Animació de sortida**: `opacity + scale 0.95` en `200ms`
- **Accessible**: `role="dialog"`, `aria-modal="true"`, `aria-label="Suggeriment de l'Assistent NutriMove"`
- **Focus trap**: el focus ha de quedar atrapat dins el popover mentre és obert; en tancar, el focus torna al bloc de sessió que l'ha originat

### 12.4 AIDrawer — Panell inferior (Tasca 2)

- **Quan apareix**: quan l'usuari fa clic a "Revisar nutrició amb IA" del banner d'alerta, o quan obre manualment el drawer des del botó de la biblioteca
- **Posició**: ocupa el 70% inferior de la pantalla, `position: fixed; bottom: 0`
- **Border-radius**: `24px 24px 0 0` (arrodonit a la part superior)
- **Alçada màxima**: `70vh`; scroll intern si el contingut és més llarg
- **Animació d'entrada**: `drawerIn` (`translateY(100%)→translateY(0)`, `450ms var(--ease)`)
- **Animació de sortida**: `translateY(100%)` en `300ms`
- **Handle**: barra de `40×4px` centrada, clicable per tancar
- **Accessible**: `role="dialog"`, `aria-modal="true"`, `aria-label="Recomanació NutriMove – Planificació setmanal"`

### 12.5 Inline contextual (futur — Prototip B)

Un missatge inline discret que apareix directament sota la fila de la sessió que ha generat el risc:
- Fila de text: icona de la IA + text de l'alerta + botó "Aplica el bloc IA" + botó "Ara no"
- Si l'usuari fa clic al text, el panell lateral dret s'expandeix amb la recomanació completa
- Este patró és menys invasiu que el popover global i és preferit per usuaris experts

---

## 13. Sistema de notificacions i retroalimentació

### 13.1 Toasts

El sistema de notificació toast proporciona retroalimentació immediata per a totes les accions de l'usuari.

**Posició**: centrat horitzontalment, `28px` des de la part inferior de la finestra, `position: fixed; z-index: 9999`

**Durada**: `3.5s` per defecte; `4.5s` per a missatges de la IA; persistent (fins a clic manual) per a errors crítics

**Variants**:
| Tipus | Icona | Ús |
|-------|-------|-----|
| `success` | `check_circle` (filled) | Acció completada correctament |
| `warning` | `warning` (filled) | Avís; l'acció s'ha completat però cal revisió |
| `error` | `error` (filled) | L'acció ha fallat; cal intervenció |
| `info` | `info` (filled) | Informació neutral |

**Anatomia d'un toast**:
- Icona del tipus (esquerra)
- Text del missatge (centre, `line-height: 1.4`, màx. `420px` d'amplada)
- Botó X de tancament manual (dreta, `opacity: 0.5` en repòs, `1.0` en hover)

**Apilament**: si múltiples toasts coexisteixen, s'apilen verticalment amb `gap: 8px`. Les transicions d'entrada i sortida es coordinen per evitar salts bruscos.

**Animació d'entrada**: `toastIn` — `translateY(100%) + scale(0.9)` → `translateY(0) + scale(1)`, `350ms var(--ease-back)`

**Animació de sortida**: `toastOut` — `translateY(0) + scale(1)` → `translateY(100%) + scale(0.9)`, `250ms var(--ease)`

### 13.2 Badge de notificació al sidebar

Un punt ataronjat de `8px` sobre la campana de la TopBar indica notificacions no llegides. El badge desapareix quan l'usuari obre la pàgina de Consells o marca les notificacions com llegides.

### 13.3 Indicadors d'estat al calendari

Els canvis d'estat als blocs del calendari (sessió afegida, càrrega alta detectada, nutrició ajustada) han de ser visibles sense necessitat d'interacció. Els canvis de color i de badge han de fer-se amb transicions de `300ms` per evitar canvis sobtats.

---

## 14. Animacions i microinteraccions

### 14.1 Principis generals

- **Propòsit**: tota animació ha de tenir un propòsit funcional (orientar, confirmar, atreure l'atenció). Cap animació ornamental sense justificació.
- **Velocitat**: les animacions d'entrada (que porten l'usuari a un nou context) duren entre `300–450ms`; les de sortida i les microinteraccions de hover entre `150–300ms`.
- **Easing**: `cubic-bezier(0.22, 1, 0.36, 1)` per a moviments estàndard (sortida suau); `cubic-bezier(0.34, 1.56, 0.64, 1)` per a entrades importants (lleuger rebote).

### 14.2 Animacions de pàgina

| Event | Animació | Durada |
|-------|---------|--------|
| Entrada a una nova vista | `fadeInUp` (opacitat + Y) | `300ms` |
| Sortida d'una vista | Fade simple | `150ms` |
| Mode: `out-in` (Vue Router) | — | — |

### 14.3 Animacions d'entrada de components

| Component | Animació | Durada | Delay |
|-----------|---------|--------|-------|
| Targetes KPI (Dashboard) | `fadeInUp` encadenades | `400ms` | `60ms` per targeta |
| Targetes de consells | `fadeInUp` encadenades | `400ms` | `80ms` per targeta |
| Targetes de fita (Progrés) | `fadeInUp` encadenades | `400ms` | variable |
| Bloc de sessió (drop al calendari) | `blockDrop` | `400ms` | — |
| Banner d'alerta | `fadeInUp` | `400ms` | — |
| Caixa d'impacte (panell edició) | `fadeInUp` | `300ms` | — |

### 14.4 Microinteraccions de hover

| Element | Efecte hover | Durada |
|---------|-------------|--------|
| Targeta KPI | `translateY(-2px)` + ombra + línia superior gradient | `150ms` |
| Bloc de sessió | `translateY(-1px)` + fons més intens + ombra de color | `150ms` |
| Element biblioteca | `translateY(-2px)` + fons + ombra de color | `150ms` |
| Botó primari | `translateY(-1px)` + ombra | `150ms` |
| Fila de sessió (SessionsView) | Fons `--surface-2` + aparició botó eliminar | `150ms` |
| Targeta milestone | `translateY(-1px)` + ombra | `150ms` |
| Ítem de navegar (sidebar) | Fons translúcid + text més clar | `150ms` |

### 14.5 Animacions de dades (barres i comptadors)

| Element | Animació | Durada |
|---------|---------|--------|
| Barres de macros (`MacroBar`) | `width: 0 → valor final` | `800ms var(--ease)` |
| Barres de distribució de tipus | `width: 0 → valor final` | `800ms var(--ease)` |
| Barres del gràfic de progrés | `height: 0 → valor final` | `1000ms var(--ease)` |
| Barres d'adherència | `width: 0 → valor final` | `1000ms var(--ease)` |
| Actualització de valor calòric | Comptador numèric animat (futur) | `600ms` |

### 14.6 Microinteraccions del toggle del perfil

El toggle switch del perfil té una animació elaborada:
1. En activar (clic): el dot es desplaça de l'esquerra a la dreta amb `translateX(18px)` en `300ms var(--ease-back)` (rebote suau)
2. El fons canvia de `--surface-3` a `--accent` en `300ms`
3. En desactivar: el dot torna a l'esquerra; el fons torna a `--surface-3`

---

## 15. Model de dades i estat de l'aplicació

### 15.1 Entitat: Sessió

```javascript
{
  id:        Number,         // Identificador únic
  day:       Number,         // 0 = Dilluns ... 6 = Diumenge
  type:      String,         // 'cycling' | 'swimming' | 'strength' | 'running' | 'yoga' | 'double'
  duration:  Number,         // Minuts (30, 60, 90, 120, 180, 240)
  intensity: String,         // 'Baixa' | 'Moderada' | 'Alta'
  label:     String,         // Nom visible de la sessió
  kcal:      Number,         // Calories cremades estimades
  load:      String,         // 'normal' | 'high'
  notes:     String          // Notes opcionals de l'usuari
}
```

**Càlcul de kcal**: `Math.round((duration / 60) × rate)` on `rate` és `280` (Baixa), `400` (Moderada), `560` (Alta).

**Càlcul de load**: `'high'` si `intensity === 'Alta'` o `duration >= 240`.

### 15.2 Entitat: Pla nutricional diari

```javascript
{
  breakfast: {
    label:   String,   // "Esmorzar"
    kcal:    Number,
    carbs:   Number,   // grams
    protein: Number,   // grams
    fat:     Number,   // grams
    items:   String[]  // Llista d'aliments
  },
  lunch:    { /* mateixa estructura */ },
  snack:    { /* mateixa estructura */ },
  dinner:   { /* mateixa estructura */ },
  total:       Number,   // Suma de kcal de tots els àpats
  targetKcal:  Number,   // Objectiu calòric del dia (2000 base; augmenta si hi ha càrrega alta)
  status:      String,   // 'ok' | 'warning'
  aiAdjusted:  Boolean   // true si la IA ha modificat el pla
}
```

### 15.3 Estat de la interfície (UI Store)

L'estat de la interfície gestiona:
- `toasts`: llista de notificacions actives
- `editPanelOpen`: booleà — si el panell d'edició de sessió és obert
- `editingSessionId`: id de la sessió en edició
- `aiPopoverOpen`: booleà — si l'AIPopover és visible
- `aiPopoverContext`: dades de context per a l'AIPopover
- `aiDrawerOpen`: booleà — si l'AIDrawer és visible
- `aiDrawerContext`: dades de context per a l'AIDrawer

### 15.4 Càlcul de l'impacte nutricional

Quan es modifica una sessió o s'afegeix una de nova, el sistema:
1. Recalcula les calories de la sessió (per fórmula)
2. Determina si el dia té càrrega alta
3. Si sí: `targetKcal = total × 1.15`; `status = 'warning'`
4. Si no: `targetKcal = 2000`; `status = 'ok'`
5. Actualitza la cel·la d'àpats al calendari amb una transició

---

## 16. Accessibilitat

### 16.1 Requisits WCAG 2.1 Nivell AA

Tots els components han de complir WCAG 2.1 AA. Els requisits principals:

**Contrast**:
- Text normal: ratio mínim `4.5:1`
- Text gran (≥18px o ≥14px bold): ratio mínim `3:1`
- Components interactius i informació gràfica: ratio mínim `3:1`

**Navegació per teclat**:
- Tots els elements interactius han de ser accessibles per teclat (Tab, Shift+Tab, Enter, Space, Escape)
- L'ordre del focus ha de ser lògic i seguir el flux visual
- El focus visible ha de ser clarament identificable: `outline: 2px solid --accent; outline-offset: 2px`
- Mai usar `outline: none` sense proporcionar un `focus-visible` alternatiu

**Elements ARIA necessaris**:
- Modals i panells laterals: `role="dialog"`, `aria-modal="true"`, `aria-label` descriptiu
- Missatges de la IA i toasts: `role="alert"` (per a urgents) o `aria-live="polite"` (per a informatius)
- Barres de progrés: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Switchs/toggles: `role="switch"`, `aria-pressed` o `aria-checked`
- Pickers de botó: `aria-pressed` per a cada opció
- Navegació: `role="navigation"`, `aria-label`

**Drag & drop (limitació)**:
L'acció d'arrossegar sessions des de la biblioteca és accessible únicament amb ratolí. Cal proporcionar una alternativa equivalent per a usuaris de teclat: el formulari d'afegir sessió ràpida ("Nova sessió" al panell esquerre del Dashboard) compleix aquesta funció. Aquesta limitació s'ha de documentar al test d'usabilitat.

**Gestió del focus en modals**:
En obrir un modal (panell edició, popover IA, drawer), el focus ha de:
1. Saltar automàticament al primer element interactiu dins el modal
2. Quedar atrapat dins el modal (focus trap: Tab i Shift+Tab no surten del modal)
3. En tancar el modal, tornar a l'element que l'ha obert

### 16.2 Text alternatiu i contingut no visual

- Totes les icones decoratives: `aria-hidden="true"`
- Icones amb significat funcional: `aria-label` al seu element pare
- Els badges d'estat (Cobert/Revisar) no depenen únicament del color: inclouen sempre icona + text
- Les barres de macros inclouen `aria-label` amb el valor textual per a lectors de pantalla

---

## 17. Disseny responsiu

### 17.1 Breakpoints

| Nom | Rang | Descripció |
|-----|------|-----------|
| Mobile | < 768px | Mòbil; el sidebar es transforma en bottom navigation |
| Tablet | 768px – 1199px | Tauleta; sidebar col·lapsat per defecte; calendari en scroll horitzontal |
| Desktop | ≥ 1200px | Portàtil/escriptori; layout complet dues columnes |

### 17.2 Adaptació del layout

**Mobile (< 768px)**:
- El sidebar de navegació es substitueix per una barra de navegació inferior (`position: fixed; bottom: 0`)
- La barra inferior mostra únicament icones; l'etiqueta de la secció activa apareix sota la icona activa
- El dashboard mostra el calendari en scroll horitzontal (un dia visible per defecte, dos amb scroll)
- Les targetes KPI es col·lapsen en dues columnes `1fr 1fr`
- El panell d'edició ocupa el 100% de la pantalla (no panel lateral sinó modal a pantalla completa)
- L'AIDrawer manté el seu comportament de bottom drawer

**Tablet (768px – 1199px)**:
- El sidebar es manté però col·lapsat (`72px`) per defecte
- El calendari mostra tots els dies però en amplada comprimida
- La biblioteca de sessions es col·lapsa per defecte
- Les targetes KPI en dues columnes

**Desktop (≥ 1200px)**:
- Layout complet tal com s'ha descrit en les seccions anteriors

---

## 18. Flux d'onboarding

### 18.1 Primera visita (futur)

En la primera vegada que un usuari accedeix a NutriMove, es presenta un flux d'onboarding de tres passos:

**Pas 1 — Benvinguda**:
- Pantalla de benvinguda a pantalla completa: logo + nom + tagline "Entrena. Menja. Progressa."
- Botó "Comencem" amb animació d'entrada

**Pas 2 — Qüestionari de perfil**:
Formulari de tres preguntes en una sola pantalla (progressió visual a la part superior):
- Nom i edat
- Nivell d'activitat (selector visual: Principiant / Actiu / Avançat)
- Objectiu principal (selector visual: Millorar el rendiment / Perdre pes / Mantenir la salut)

**Pas 3 — Tutorial interactiu** (opcional, saltable):
Un overlay de "spotlight" que guia l'usuari pels elements clau del Dashboard:
1. Apunta al calendari: "Aquí planifiques les teves sessions setmanals"
2. Apunta a la biblioteca: "Arrossega les sessions al calendari"
3. Apunta als àpats del calendari: "La nutrició s'adapta automàticament"
4. Apunta a l'avatar de la IA: "L'Assistent NutriMove et farà recomanacions personalitzades"

El tutorial es pot saltar en qualsevol moment; es pot revisar des de "Jo > Ajuda".

### 18.2 Camp "Vull…" del perfil

En la configuració del perfil, un camp de text obert amb placeholder "Vull…" permet a l'usuari expressar el seu objectiu en primera persona. Això reforça el to personalitzat de la IA i de les recomanacions.

---

## 19. Consideracions de rendiment

### 19.1 Càrrega inicial

- **Fonts**: carregades via Google Fonts amb `display=swap` per evitar el bloqueig del renderitzat
- **Icones**: Material Symbols Rounded carregat via CDN; no usar la versió completa sinó la subset necessària
- **JavaScript**: l'aplicació és una SPA lleugera (Vite + Vue 3); el build de producció ha de ser inferior a `200KB` (gzipped)
- **CSS**: no usar cap framework CSS extern; totes les variables i estils en fitxers propis

### 19.2 Animacions

- Usar `transform` i `opacity` per a totes les animacions (acceleració per GPU)
- Evitar animar `width`, `height`, `top`, `left` directament (provoquen reflow)
- Usar `will-change: transform` amb cautela i únicament en elements animats freqüentment
- Respectar `prefers-reduced-motion`: totes les animacions han de tenir una versió alternativa sense moviment per a usuaris que ho prefereixin

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 19.3 Estat de l'aplicació

- Pinia per a la gestió d'estat: tot l'estat és reactiu i el calendari s'actualitza automàticament quan les dades canvien
- No fer peticions HTTP innecessàries: tota la lògica de la IA és simulada al front-end
- Evitar càlculs pesants en el fil principal: els recàlculs de kcal i d'estat nutricional s'han de fer en `computed` de Vue (cacheados automàticament)

---

*Fi del document d'especificació tècnica de NutriMove*  
*Grup AF1 · FHiC 25-26 · Versió 1.0 · Abril 2026*