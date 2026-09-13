# 💜 ¿Quieres ser mi novia? — Sitio de propuesta

Una experiencia web interactiva: sobre sellado → universo estrellado 3D → línea del tiempo
con sus fotos reales → contador en vivo → mini-quiz → razones → **corazón de vidrio 3D y
la gran pregunta**, con botón "No" que huye, confeti masivo, certificado de novios y
aviso por WhatsApp cuando diga **Sí**.

---

## 1) Personaliza (2 minutos)

Edita **`config.js`** — todo está ahí, marcado con `[EDITA AQUÍ]`:

| Qué | Dónde |
|---|---|
| Su nombre, apodo y el tuyo | `herName`, `herNick`, `yourName` |
| Fecha en que se conocieron | `startDate` (alimenta el contador) |
| Tu WhatsApp (para que te avise) | `whatsapp` (solo números, con lada) |
| La carta del sobre | `envelope.letter` |
| Frases de la línea del tiempo | `milestones` (cada foto + frase) |
| Preguntas del mini-quiz | `quiz.questions` |
| Las 7 razones | `reasons.items` |

Las fotos ya están optimizadas en `assets/img/` (la lista con fechas está en
`js/manifest.js`). Para cambiar qué foto usa cada hito, mira los slugs
`juntos-AAAAMMDD-NN` y pon el que quieras en `milestones[].photo`.
El primer hito (20 de mayo de 2023) no lleva foto: muestra la conversación
de Facebook como burbujas de chat — puedes editarla en `milestones[0].chat`.

### Opcional
- **Su canción**: guárdala como `assets/music/music.mp3` y sonará esa en lugar
  del piano generativo (que es 100% libre de derechos y funciona siempre).
- **Nota de voz**: guárdala como `assets/music/voice.mp3` — aparecerá un botón
  "Mi mensaje para ti" cuando diga que sí.
- **Cambiar fotos**: edita `images/`, y luego ejecuta:
  ```
  python tools/optimize_images.py
  ```

---

## 2) Pruébala en tu computadora

Por seguridad los navegadores bloquean módulos JS al abrir el archivo directo,
así que usa un mini servidor (elige uno):

```
npx serve .
```
o
```
python -m http.server 8000
```

Abre `http://localhost:8000` (o la URL que te imprima `npx serve`).

---

## 3) Publícala en Vercel (gratis)

**Opción A — la más fácil:** entra a [vercel.com/new](https://vercel.com/new),
arrastra la carpeta `girlfriend` completa y listo. Te da una URL tipo
`https://tu-proyecto.vercel.app`.

**Opción B — con terminal:**
```
npm i -g vercel
vercel --prod
```

### 3.1 Preview bonito al enviar el link por WhatsApp
Cuando tengas tu URL, edita en `index.html`:
```html
<meta property="og:image" content="https://TU-SITIO.vercel.app/assets/img/og.jpg">
```
y vuelve a desplegar (Vercel lo hace automático con `vercel --prod`).
Así, cuando le mandes el link, verá una foto de ustedes con el título
*"Tengo algo que preguntarte… 💘"*.

### 3.2 (Opcional) Fotos en Cloudflare
El sitio ya funciona con las fotos incluidas. Si prefieres servirlas desde
Cloudflare R2:
1. Crea un bucket público en Cloudflare R2 y sube todo `assets/img/`.
2. En `config.js` pon: `imagesBaseUrl: "https://TU-BUCKET.r2.dev"` (tu dominio público de R2).
3. Listo — las fotos cargarán desde Cloudflare y el resto del sitio desde Vercel.

---

## 4) El QR para invitarla

Abre **`qr.html`** en tu sitio publicado (`https://tu-sitio.vercel.app/qr.html`).
Genera un código QR con marco romántico, listo para **imprimir** y pegar en un
regalo, carta o flores. Ella escanea → cae directo al sobre.

---

## 5) Consejo para el gran momento

- Mándaselo **de noche** (la estética cósmica luce más) y pídele que use audífonos 🎧.
- El sitio está pensado para el **celular**: el corazón sigue su mano (giroscopio)
  y hay vibración en cada momento clave.
- Si tu teléfono está cerca, cuando presione **"Avisarle que dije SÍ"** te llegará
  su WhatsApp al instante — ten listo el siguiente paso 😉

---

## Estructura técnica

```
config.js          ← ✏️ TODO lo personalizado
index.html         ← la experiencia (una sola página)
qr.html            ← generador de QR imprimible
css/style.css      ← estética noche → amanecer, glassmorphism
js/main.js         ← orquestación y scroll cinematográfico
js/world.js        ← universo 3D (Three.js): estrellas, corazón de vidrio
js/ui.js           ← capítulos: sobre, quiz, razones, botón que huye, confeti
js/audio.js        ← música (Web Audio generativa o tu MP3) + vibración
js/manifest.js     ← índice de fotos (generado)
assets/img/        ← fotos optimizadas WebP + og.jpg (preview)
vendor/            ← Three.js, GSAP, canvas-confetti, qrcode (sin CDN externo)
tools/             ← optimizador de imágenes
vercel.json        ← configuración de despliegue
```

Sin bases de datos, sin build, sin cuentas: carpeta estática que funciona
en cualquier hosting.
