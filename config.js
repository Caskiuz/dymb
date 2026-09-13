/* ═══════════════════════════════════════════════════════════════════
   💜  CONFIGURACIÓN DE TU PROPUESTA — Riki & Gorda
   ═══════════════════════════════════════════════════════════════════
   Todo lo personalizado del sitio está en este archivo.
   Los datos ya están llenados con SU historia (20 mayo 2023).
   Ajusta lo que quieras — solo falta tu número de WhatsApp.
   ═══════════════════════════════════════════════════════════════════ */

window.CONFIG = {

  /* ────────────────────────────────────────────────
     1) NOMBRES
     ──────────────────────────────────────────────── */
  herName:  "Dailubis Moreno",
  herNick:  "Gorda",             // así le dices tú
  hisNick:  "Riki",              // así te dice ella
  yourName: "Ricardo Agelvis",

  /* ────────────────────────────────────────────────
     2) EL DÍA EXACTO EN QUE ELLA TE RESPONDIÓ
     El 20 de mayo de 2023 aceptaste la salida a desayunar.
     Alimenta el contador en vivo.
     ──────────────────────────────────────────────── */
  startDate: "2023-05-20",

  /* ────────────────────────────────────────────────
     3) TU WHATSAPP (con código de país, SOLO números)
     Cuando ella presione "Sí", aparecerá un botón que le
     envía por WhatsApp el mensaje "¡Dije que SÍ! 💖".
     ──────────────────────────────────────────────── */
  whatsapp: "573229142532",

  /* ────────────────────────────────────────────────
     4) BASE DE IMÁGENES (opcional — déjalo así)
     ──────────────────────────────────────────────── */
  imagesBaseUrl: "",

  /* ────────────────────────────────────────────────
     5) EL SOBRE SELLADO (primera pantalla)
     ──────────────────────────────────────────────── */
  envelope: {
    to: "Para ti, Gorda 💜",
    letter: [
      "Hola, Gorda…",
      "Llevaba días escribiéndote por Facebook sin rendirme, hasta que el 20 de mayo de 2023 me respondiste.",
      "Ese día desayunamos pasteles con jugos naturales, caminamos, compramos ropa de gym y terminamos en el gimnasio.",
      "Desde ahí supe que eras tú.",
      "Recorre nuestro universo… al final te tengo una pregunta 💫"
    ],
    button: "Comenzar nuestro viaje ✨"
  },

  /* ────────────────────────────────────────────────
     6) INTRO (universo estrellado)
     ──────────────────────────────────────────────── */
  intro: {
    kicker:   "Una historia que empezó en Facebook",
    title:    "Ricardo y Dailubis",
    subtitle: "Del primer mensaje insistente a este universo entero… desliza 💫"
  },

  /* ────────────────────────────────────────────────
     7) LÍNEA DEL TIEMPO — SU historia real
     El primer hito no lleva foto: es la conversación
     de Facebook del 20 de mayo de 2023 (burbujas de chat).
     ──────────────────────────────────────────────── */
  milestones: [
    {
      date:  "20 · mayo · 2023",
      title: "El día que por fin me respondiste",
      text:  "Después de días insistiendo por Facebook, dijiste que sí. Desayunamos pasteles con jugos naturales, caminamos, compramos ropa de gym y terminamos entrenando. El mejor sí de mi vida. 💜",
      chat: [
        { from: "yo",   text: "Hola… soy Ricardo, el que no deja de escribirte 😅🤞" },
        { from: "ella", text: "Jajaja ok… vayamos a desayunar entonces" },
        { from: "ella", text: "¿Le vi cara de muerta de hambre? 🤨" },
        { from: "yo",   text: "No… pero es una excusa perfecta para verte 😉" }
      ]
    },
    {
      date:  "21 · mayo · 2023",
      title: "Nuestra primera foto juntos",
      text:  "A un solo día de aquel sí, ya éramos inseparables. Esta es la primera foto que nos tomamos juntos… y sigue siendo mi tesoro más valioso. 📸💜",
      photo: "juntos-20260913-03"
    },
    {
      date:  "20 · oct · 2024",
      title: "La piscina y tu sonrisa",
      text:  "Ese día descubrí algo: yo miraba la piscina, pero mis ojos solo te encontraban a ti. ✨",
      photo: "juntos-20241020-01"
    },
    {
      date:  "31 · mar · 2025",
      title: "Mi lugar favorito del mundo",
      text:  "Comer contigo no es una comida más: es mi lugar favorito, mi conversación favorita, mi todo. 🍽️💜",
      photo: "juntos-20250331-01"
    },
    {
      date:  "03 · abr · 2025",
      title: "Los días simples, los mejores",
      text:  "Contigo hasta un día cualquiera se vuelve recuerdo que quiero repetir. 📸",
      photo: "juntos-20250403-01"
    },
    {
      date:  "25 · abr · 2025",
      title: "Esa sonrisa",
      text:  "Esta foto lo dice todo: la mujer más bella, y lo sabes. Y yo, el más afortunado. 😍",
      photo: "juntos-20250425-01"
    },
    {
      date:  "06 · sep · 2026",
      title: "Bienvenida a San Cristóbal",
      text:  "Te fuiste buscando tu camino y volviste a mi lado. Ese día las letras dijeron \u201cBienvenidos\u201d… pero quien dio la bienvenida fui yo. 🤗",
      photo: "juntos-20260913-01"
    },
    {
      date:  "hoy",
      title: "Y hoy…",
      text:  "Después de todo este camino — hasta desde aquel mensaje de Facebook — solo queda una pregunta en el aire. Sigue deslizando. 💘",
      photo: "juntos-20260913-02"
    }
  ],

  /* ────────────────────────────────────────────────
     8) CONTADOR EN VIVO
     ──────────────────────────────────────────────── */
  counter: {
    title:  "Y si te lo preguntas…",
    line1:  "el universo nos tiene juntos",
    suffix: "y contando… 💫"
  },

  /* ────────────────────────────────────────────────
     9) MINI-JUEGO — 3 preguntas reales de SU historia
     ──────────────────────────────────────────────── */
  quiz: {
    title:    "El cofre de los recuerdos",
    subtitle: "Junta los 3 corazones contestando bien… o no 💝",
    again:    "Casi… pero te doy otra oportunidad 😌",
    gift:     "Bueno… te lo regalo porque te quiero 😌",
    unlocked: "¡Cofre abierto! Sigue deslizando…",
    questions: [
      {
        q: "¿Qué día me respondiste por fin por Facebook?",
        options: ["20 de mayo de 2023", "14 de febrero", "24 de diciembre"],
        correct: 0,
        reaction: "¡El día más importante de mi vida! 🥹"
      },
      {
        q: "¿Qué desayunamos ese primer día?",
        options: ["Sushi", "Pasteles con jugos naturales", "Arepas"],
        correct: 1,
        reaction: "¡Exacto! Y después terminamos en el gimnasio 💪😄"
      },
      {
        q: "¿Cómo me dices tú de cariño?",
        options: ["Jefe", "Ricardito", "Riki"],
        correct: 2,
        reaction: "Riki y Gorda… nuestro código secreto 💜"
      }
    ]
  },

  /* ────────────────────────────────────────────────
     10) RAZONES — lo que ella sí hizo por ti
     ──────────────────────────────────────────────── */
  reasons: {
    title: "Lo que tú hiciste por mí",
    hint:  "Toca cada corazón para descubrirlo",
    items: [
      "Me acompañaste cuando estuve preso. Ahí supe que eras diferente 🖤",
      "Me diste techo, comida… y una familia cuando no tenía nada 🏠",
      "Celebraste mi cumpleaños y ese día me sentí el más especial 🎂",
      "Me ayudas a crecer como persona, como ser humano 🌱",
      "Siempre has estado a mi lado, sin pedir nada a cambio 🤍",
      "Tu risa arregla cualquier día malo 😄",
      "Simplemente eres tú, Dailubis. Y eso lo cambia todo 💘"
    ]
  },

  /* ────────────────────────────────────────────────
     11) PROMESAS 3D — lo que te voy a dar
     (toca cada promesa: estalla en el universo 3D)
     ──────────────────────────────────────────────── */
  promises: {
    title:    "Lo que te voy a dar 💜",
    subtitle: "Toca cada promesa y el universo la estrella en el cielo",
    sealAll:  "Todas las promesas quedaron selladas ante el universo ✨",
    items: [
      { emoji: "💐",  label: "Flores",     msg: "Flores no solo un día al año: cuando sea, sin motivo, solo porque te vi y pensé en ti." },
      { emoji: "🎁",  label: "Regalos",    msg: "Ese detalle que viste y te hiciste la que no… ya está en mi lista. Vas a tener de todo." },
      { emoji: "💅",  label: "Uñas",       msg: "Manicure siempre impecable. Tú eliges el diseño… yo pongo la plata y la paciencia. 😌" },
      { emoji: "💇‍♀️", label: "Cabello",    msg: "Tu cabello es tu corona: peluquería cada vez que lo pidas, brillo de reina." },
      { emoji: "👁️",  label: "Pestañas",   msg: "Pestañas que enamoran… aunque con las tuyas ya me tienes mal. 😍" },
      { emoji: "💄",  label: "Maquillaje", msg: "La colección de maquillaje que mereces, mi reina. Y de regalo, el espejo que te diga lo bella que eres." },
      { emoji: "✈️",  label: "Viajes",     msg: "El mar, la montaña, la ciudad que sea: donde tú digas, vamos. El mundo será nuestro patio de juegos. 🌍" },
      { emoji: "🍽️",  label: "Restaurantes", msg: "Citas de esas bonitas: tú vestida de gala, la mesa perfecta, y yo sin saber qué pedir de tanto mirarte. 🥂" },
      { emoji: "👑",  label: "Buena vida", msg: "La vida buena que guardas en fotos va a dejar de ser inspiración para volverse tu rutina de todos los días. 💸" },
      { emoji: "🕊️",  label: "Paz",        msg: "Un hogar estable y tranquilo, donde nada te falte. Primero la paz; todo lo demás se construye sobre ella. 🕊️" },
      { emoji: "❤️",  label: "Mucho amor", msg: "Y lo más importante: amor de sobra. De los que no se compran — de los que se demuestran cada día, hasta los 100 años. ❤️" },
      { emoji: "💸",  label: "+ y más",    msg: "Esto y mucho más, Gorda. Vamos a facturar puro Benjamin Franklin… \u201cEL DINERO VIENE A MÍ\u201d 💸💅. Como te lo prometo. Att: Riki. 💜" }
    ]
  },

  /* ────────────────────────────────────────────────
     12) LA GRAN PREGUNTA
     ──────────────────────────────────────────────── */
  question: {
    preTitle: "Gorda…",
    big:      "¿Quieres ser mi novia?",
    yes:      "¡Sí! 💖",
    no:       "No",
    noEscape: [
      "¿Segura? 👀",
      "Piénsalo bien 🥺",
      "Ups, el botón se mueve solo 😅",
      "El universo dice que presiones SÍ ✨",
      "Este botón está roto… es señal 😌",
      "Ya no hay escapatoria 💘"
    ]
  },

  /* ────────────────────────────────────────────────
     13) CUANDO DIGA "¡SÍ!" — votos de novios
     ──────────────────────────────────────────────── */
  finale: {
    title:    "¡Me haces la persona más feliz del universo! 🎉",
    text:     "Desde hoy, oficialmente somos nosotros. Y empiezo cumpliendo:",
    vowsTitle: "Mis votos para ti, Gorda 💜",
    vows: [                                                                  // [EDITA AQUÍ] tus votos
      "Prometo hacerte feliz cada día, hasta en los días grises.",
      "Prometo amarte y respetarte como eres, con todo lo que soy.",
      "Prometo luchar cada día por nuestro amor, sin rendirme jamás.",
      "Prometo apoyar tus sueños, tu negocio y cada meta que te propongas.",
      "Prometo darte flores, detalles, viajes y la vida buena que mereces.",
      "Prometo cuidarte a ti y a los tuyos: ser tu familia, tu hogar y tu lugar seguro.",
      "Y prometo que este universo que recorriste hoy es solo el comienzo de nuestra historia. 🚀"
    ],
    vowsSign: "Con todo mi amor — Att: Riki 💖",
    certTitle: "Certificado Oficial de Novios",
    certText:  "Se confirma ante el universo que Dailubis Moreno y Ricardo Agelvis son oficialmente novios desde este mágico día.",
    sealedLabel: "Sellado ante el universo el",
    whatsapp:  "Avisarle que dije SÍ 💬",
    waText:    "¡Dije que SÍ! 💖✨ — Gorda",
    replay:    "Revivir el momento 🔁"
  },

  /* ────────────────────────────────────────────────
     14) EASTER EGG (10 toques sobre el corazón)
     ──────────────────────────────────────────────── */
  easterEgg: "💧 Rikiii, pásame agua… jajaja. P.D.: Tú ya eras mi respuesta desde el 20 de mayo de 2023 💜",

  /* ────────────────────────────────────────────────
     15) MÚSICA
     - assets/music/music.mp3 (tu canción) si existe,
     - si no, piano suave generado por el navegador.
     - Nota de voz opcional: assets/music/voice.mp3
     ──────────────────────────────────────────────── */
  music: {
    volume: 0.35
  }
};
