# Stryker Analytics — Frontend (Mundial 2026)

Dashboard React + Vite que consume la API de predicciones. Diseño "Void and
Neon" (glassmorphism, tipografía Geist) según `DESIGN.md`.

## Configurar la URL del backend

En `src/App.jsx`, línea ~6:

```js
const API_BASE = 'https://mundial-95mx.onrender.com';
```

Cámbiala si tu backend está en otra URL.

## Correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Build de producción

```bash
npm run build      # genera /dist
npm run preview    # previsualiza el build
```

## Desplegar en Vercel

1. Sube esta carpeta a un repo de GitHub.
2. En vercel.com → New Project → importa el repo.
3. Vercel detecta Vite automáticamente:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy. Te da una URL tipo `https://tu-app.vercel.app`.

> Tras desplegar el front, conviene restringir el CORS del backend: en el
> `main.py` cambia `allow_origins=["*"]` por `["https://tu-app.vercel.app"]`.

## Nombres de equipos

`src/teams.js` mapea español (UI) → inglés (API). Si la API devuelve un error
422 "no existe", suele ser porque el nombre en inglés no coincide exactamente
con el del dataset martj42. El error muestra la sugerencia de la API; ajusta el
campo `en` de ese equipo en `teams.js`.

Equipos a verificar especialmente (varían entre fuentes):
- Türkiye → `Turkey`
- Costa de Marfil → `Ivory Coast` (a veces `Côte d'Ivoire`)
- Curazao → `Curaçao`
- Corea del Sur → `South Korea`
- Emiratos Árabes Unidos → `United Arab Emirates`

## Estructura

```
src/
├── App.jsx          # dashboard principal + lógica de fetch
├── teams.js         # equipos del Mundial 2026 (es→en, abreviaturas)
├── index.css        # tokens del DESIGN.md (paleta, tipografía, glass)
├── dashboard.css    # layout y componentes
└── main.jsx         # entrada
```
