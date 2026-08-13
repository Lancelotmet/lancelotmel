export const LEARNING_AREAS = [
  {
    id: "vocabulary",
    name: "Vocabulary",
    description: "Palabras que permiten habitar el contexto.",
    symbol: "01",
    practices: ["Mapa de palabras", "Precisión en contexto", "Recuerdo activo"]
  },
  {
    id: "spelling",
    name: "Spelling",
    description: "La forma escrita como una decisión consciente.",
    symbol: "02",
    practices: ["Patrones visibles", "Edición guiada", "Dictado con intención"]
  },
  {
    id: "grammar",
    name: "Grammar",
    description: "Estructuras para expresar una idea completa.",
    symbol: "03",
    practices: ["Arquitectura de frases", "Elección de forma", "Transformación"]
  },
  {
    id: "listening",
    name: "Listening",
    description: "Escucha para reconocer intención, ritmo y sentido.",
    symbol: "04",
    practices: ["Escucha selectiva", "Señales del contexto", "Respuesta consciente"]
  },
  {
    id: "speaking",
    name: "Speaking",
    description: "Voz propia para participar con claridad y confianza.",
    symbol: "05",
    practices: ["Ensayo de voz", "Interacción situada", "Transferencia oral"]
  }
] as const;

export type LearningAreaId = (typeof LEARNING_AREAS)[number]["id"];
export type PortalLevel = "A1" | "A2" | "B1" | "B2";

export type PortalBlock = {
  id: string;
  level: PortalLevel;
  collection: string;
  title: string;
  subtitle: string;
  synopsis: string;
  atmosphere: string;
  cover: string;
  focus: string[];
};

export const PORTAL_LEVELS: { id: PortalLevel; title: string; description: string }[] = [
  { id: "A1", title: "Primeras conexiones", description: "Para nombrar, pedir, responder y empezar a habitar el inglés." },
  { id: "A2", title: "Vida en movimiento", description: "Para desenvolverte en situaciones cotidianas con mayor independencia." },
  { id: "B1", title: "Mundo propio", description: "Para sostener conversaciones, historias, opiniones y decisiones." },
  { id: "B2", title: "Voz con criterio", description: "Para argumentar, colaborar y comunicar ideas complejas con precisión." }
];

export const PORTAL_BLOCKS: PortalBlock[] = [
  { id: "a1-first-day", level: "A1", collection: "Llegar", title: "First Day", subtitle: "Tu primera conversación", synopsis: "Saluda, preséntate y encuentra tu lugar cuando todo empieza.", atmosphere: "Inicio · identidad", cover: "dawn", focus: ["greetings", "names", "simple questions"] },
  { id: "a1-coffee", level: "A1", collection: "Moverse", title: "Coffee, Please", subtitle: "Pedir sin miedo", synopsis: "Un café, una elección y las palabras precisas para interactuar con calma.", atmosphere: "Cotidiano · elección", cover: "coffee", focus: ["food", "numbers", "polite requests"] },
  { id: "a1-city", level: "A1", collection: "Moverse", title: "City Signals", subtitle: "Encontrar el camino", synopsis: "Lee señales, pregunta direcciones y entiende cómo llegar.", atmosphere: "Ciudad · orientación", cover: "city", focus: ["places", "directions", "there is / are"] },
  { id: "a1-people", level: "A1", collection: "Reconocer", title: "People Around", subtitle: "Hablar de quienes importan", synopsis: "Describe personas cercanas y comparte vínculos de tu mundo.", atmosphere: "Vínculos · presencia", cover: "portrait", focus: ["family", "descriptions", "have / has"] },
  { id: "a1-weekend", level: "A1", collection: "Habitar", title: "My Weekend", subtitle: "Rituales que te cuentan", synopsis: "Cuenta lo que haces, lo que te gusta y cómo transcurre tu tiempo.", atmosphere: "Rutina · gusto", cover: "weekend", focus: ["routines", "time", "likes"] },
  { id: "a1-weather", level: "A1", collection: "Habitar", title: "A Change in Weather", subtitle: "Lo que ves hoy", synopsis: "Nombra el clima y decide qué hacer en el día que tienes delante.", atmosphere: "Entorno · presente", cover: "weather", focus: ["weather", "clothes", "present continuous"] },

  { id: "a2-trip", level: "A2", collection: "Cruzar", title: "The Small Trip", subtitle: "Salir de lo conocido", synopsis: "Planea un viaje breve, resuelve imprevistos y comparte lo que encuentras.", atmosphere: "Viaje · autonomía", cover: "journey", focus: ["travel", "past events", "plans"] },
  { id: "a2-workday", level: "A2", collection: "Construir", title: "A Better Workday", subtitle: "Coordinar con otros", synopsis: "Organiza tareas, acuerda horarios y explica cómo trabajas.", atmosphere: "Trabajo · colaboración", cover: "work", focus: ["tasks", "schedules", "can / have to"] },
  { id: "a2-home", level: "A2", collection: "Habitar", title: "Home Stories", subtitle: "Espacios con memoria", synopsis: "Describe tu hogar, los cambios que necesitas y las historias que guarda.", atmosphere: "Hogar · relato", cover: "home", focus: ["rooms", "comparisons", "past simple"] },
  { id: "a2-health", level: "A2", collection: "Cuidar", title: "Feeling Better", subtitle: "Cuerpo y cuidado", synopsis: "Explica cómo te sientes, pide ayuda y conversa sobre hábitos que sostienen.", atmosphere: "Bienestar · cuidado", cover: "health", focus: ["body", "advice", "should"] },
  { id: "a2-music", level: "A2", collection: "Expresar", title: "The Sound You Keep", subtitle: "Música que te acompaña", synopsis: "Recomienda una canción, cuenta por qué importa y escucha detalles.", atmosphere: "Cultura · emoción", cover: "sound", focus: ["music", "opinions", "because"] },
  { id: "a2-ing-ed", level: "A2", collection: "Expresar", title: "Things That Move You", subtitle: "Emoción, acción y palabras", synopsis: "Distingue experiencias exciting y excited mientras cuentas lo que te transforma.", atmosphere: "Lenguaje · matiz", cover: "motion", focus: ["-ing / -ed", "feelings", "stories"] },

  { id: "b1-neighborhood", level: "B1", collection: "Pertenecer", title: "The Neighborhood", subtitle: "Cambiar un lugar", synopsis: "Observa una comunidad, identifica una necesidad y propone una mejora posible.", atmosphere: "Comunidad · acción", cover: "neighborhood", focus: ["community", "suggestions", "conditionals"] },
  { id: "b1-decisions", level: "B1", collection: "Elegir", title: "The Decision Room", subtitle: "Poner razones sobre la mesa", synopsis: "Compara opciones, expresa dudas y decide con argumentos propios.", atmosphere: "Criterio · decisión", cover: "decision", focus: ["opinions", "comparisons", "giving reasons"] },
  { id: "b1-change", level: "B1", collection: "Transformar", title: "A Change of Plan", subtitle: "Cuando algo se mueve", synopsis: "Narra un cambio, explica sus consecuencias y conversa sobre lo aprendido.", atmosphere: "Cambio · reflexión", cover: "change", focus: ["narrative", "present perfect", "consequences"] },
  { id: "b1-screen", level: "B1", collection: "Comprender", title: "Behind the Screen", subtitle: "Tecnología con mirada propia", synopsis: "Analiza un hábito digital, escucha perspectivas y propone un uso más consciente.", atmosphere: "Tecnología · criterio", cover: "screen", focus: ["media", "advantages", "reported ideas"] },
  { id: "b1-table", level: "B1", collection: "Pertenecer", title: "At the Table", subtitle: "Historias que se comparten", synopsis: "Conecta cultura, memoria y comida en una conversación sostenida.", atmosphere: "Cultura · memoria", cover: "table", focus: ["food culture", "experiences", "questions"] },
  { id: "b1-project", level: "B1", collection: "Construir", title: "The Project", subtitle: "Hacer algo con otros", synopsis: "Presenta una idea, reparte responsabilidades y defiende una propuesta.", atmosphere: "Proyecto · colaboración", cover: "project", focus: ["planning", "roles", "persuasion"] },

  { id: "b2-ideas", level: "B2", collection: "Pensar", title: "Ideas That Travel", subtitle: "Una conversación que deja huella", synopsis: "Relaciona perspectivas, argumenta con matiz y encuentra conexiones inesperadas.", atmosphere: "Ideas · perspectiva", cover: "ideas", focus: ["argumentation", "nuance", "linking ideas"] },
  { id: "b2-voice", level: "B2", collection: "Expresar", title: "Your Point of View", subtitle: "Hablar con precisión", synopsis: "Defiende una postura sin perder escucha, claridad ni apertura.", atmosphere: "Voz · criterio", cover: "voice", focus: ["debate", "hedging", "clarity"] },
  { id: "b2-future", level: "B2", collection: "Transformar", title: "The Future We Build", subtitle: "Imaginación aplicada", synopsis: "Evalúa escenarios, plantea condiciones y comunica una visión posible.", atmosphere: "Futuro · propósito", cover: "future", focus: ["scenarios", "conditionals", "vision"] },
  { id: "b2-stories", level: "B2", collection: "Comprender", title: "Stories We Inherit", subtitle: "Memoria, identidad y lenguaje", synopsis: "Lee entre líneas, escucha relatos complejos y responde con sensibilidad.", atmosphere: "Memoria · identidad", cover: "stories", focus: ["narrative voice", "inference", "interpretation"] },
  { id: "b2-room", level: "B2", collection: "Construir", title: "The Room Where It Happens", subtitle: "Colaborar en lo complejo", synopsis: "Facilita una reunión, sintetiza tensiones y transforma conversación en acuerdo.", atmosphere: "Liderazgo · colaboración", cover: "room", focus: ["facilitation", "summaries", "negotiation"] },
  { id: "b2-impact", level: "B2", collection: "Transformar", title: "Make It Matter", subtitle: "Comunicar para movilizar", synopsis: "Convierte una idea en un mensaje que inspira comprensión y acción.", atmosphere: "Impacto · transferencia", cover: "impact", focus: ["presentations", "storytelling", "impact"] }
];

export function blocksForLevel(level: PortalLevel) {
  return PORTAL_BLOCKS.filter((block) => block.level === level);
}
