# NutriMove — Prototip P3 (FHiC 25-26, Grup AF1)

## Com executar-lo

1. Obre la carpeta `nutrimove/` amb **Visual Studio Code**
2. Instal·la l'extensió **Live Server** (si no la tens: Extensions → cerca "Live Server" de Ritwick Dey)
3. Clic dret sobre `index.html` → **"Open with Live Server"**
4. El prototip s'obrirà al navegador a `http://127.0.0.1:5500`

> **Alternativa:** Obre `index.html` directament al navegador (doble clic) — funciona sense servidor.

---

## Estructura del projecte

```
nutrimove/
├── index.html        → Estructura HTML de tota l'app
├── css/
│   └── style.css     → Tots els estils (variables, components, animacions)
├── js/
│   └── app.js        → Lògica de la interfície i estat de l'app
└── README.md         → Aquest fitxer
```

---

## Tasques implementades

### Tasca 1 — Actualitzar una sessió i confirmar l'ajust nutricional

**Escenari:** En Pau actualitza la sessió de dissabte (ciclisme 2h → 4h Alta).

**Passos per provar-ho:**

1. Al Dashboard, fes clic al bloc **"🚴 Ciclisme"** del dia **Ds (Dissabte)**
2. Al panell dret, augmenta la durada fins a **4h** (botó `+`)
3. Assegura't que la intensitat és **Alta**
4. Fes clic a **"Desa al timeline"**
5. Apareixerà un **popover de l'Assistent NutriMove** explicant l'ajust nutricional
6. Fes clic a **"Aplica l'ajust"** → la nutrició s'actualitza i apareix el toast de confirmació

---

### Tasca 2 — Planificar la setmana i obtenir el pla nutricional

**Escenari:** En Pau planifica la setmana i afegeix una Sessió doble al dimecres.

**Passos per provar-ho:**

1. Al Dashboard, fes clic al botó **"+ Afegir"** del dia **Dc (Dimecres)**
2. Selecciona el tipus **"⚡ Sessió doble"**
3. Ajusta la durada i intensitat (ex: 3h, Alta)
4. Fes clic a **"Afegeix sessió"**
5. Apareixerà el **banner de l'Assistent** a dalt del dashboard
6. Fes clic a **"Revisar nutrició amb IA"**
7. S'obre el **panell inferior (drawer)** amb l'Anàlisi, Ajustos suggerits i Acció
8. Fes clic a **"Aplica tots els ajustos"** → tots els dies passen a estat correcte

---

## Navegació de l'app

| Secció          | Descripció                                       |
| --------------- | ------------------------------------------------ |
| Inici de sessió | Login simple amb correu i contrasenya proposades |
| Dashboard       | Dashboard setmanal unificat (Sessions + Àpats)   |
| Sessions        | Placeholder — funcionalitat al dashboard         |
| Àpats           | Placeholder — integrat al dashboard              |
| Consells        | Placeholder — l'Assistent NutriMove              |
| Progrés         | Placeholder — gràfics de rendiment               |
| Jo (Pau)        | Perfil d'usuari                                  |

---

## Tecnologies

- **HTML5** semàntic
- **CSS3** amb variables i animations
- **JavaScript** vanilla (ES6+) — sense dependències externes
- **Google Fonts:** Outfit + DM Sans
- **Material Icons Round** (Google CDN)

---

## Grup AF1 — FHiC 25-26

Adrià Suárez · Albert Marín · Artur Sardà  
Advisor: Inmaculada Rodríguez
