export type RuleId = "general_ed" | "final_e" | "consonant_y" | "vowel_y" | "cvc_double" | "do_not_double";

export type VerbItem = {
  id: string;
  base: string;
  past: string;
  ruleId: RuleId;
  segmentation: string[];
  explanation: string;
  hints: string[];
  contrastWith?: string;
  sentence?: string;
};

export const RULES: Record<RuleId, { title: string; shortRule: string; discovery: string; hypothesis: string[]; observe: string[]; transfer: string }> = {
  general_ed: {
    title: "El verbo permanece",
    shortRule: "Conservamos el verbo y agregamos ED.",
    discovery: "En estos verbos, ¿qué letras del verbo desaparecen?",
    hypothesis: ["Se elimina la última letra.", "Se conserva el verbo y se agrega ED.", "Siempre se duplica la última consonante."],
    observe: ["work → worked", "clean → cleaned", "wash → washed"],
    transfer: "Yesterday, we ______ the room. (clean)"
  },
  final_e: {
    title: "La E ya está ahí",
    shortRule: "Si el verbo termina en E, agregamos solamente D.",
    discovery: "¿Se agregó otra E después de la E final?",
    hypothesis: ["Agregamos ED completo.", "La E final se conserva y agregamos D.", "Quitamos la E final."],
    observe: ["live → lived", "love → loved", "dance → danced"],
    transfer: "She ______ near the museum. (live)"
  },
  consonant_y: {
    title: "Y después de consonante",
    shortRule: "Consonante + Y: cambiamos Y por I y agregamos ED.",
    discovery: "Mira la letra antes de Y. ¿Es vocal o consonante?",
    hypothesis: ["La Y siempre se conserva.", "Después de consonante, Y cambia por I antes de ED.", "Se duplica la Y."],
    observe: ["study → studied", "carry → carried", "try → tried"],
    transfer: "Yesterday, I ______ English. (study)"
  },
  vowel_y: {
    title: "Y después de vocal",
    shortRule: "Vocal + Y: conservamos Y y agregamos ED.",
    discovery: "Mira la letra antes de Y. ¿Necesitamos cambiar la Y?",
    hypothesis: ["Después de vocal, Y se conserva y agregamos ED.", "Siempre cambiamos Y por I.", "Quitamos la Y."],
    observe: ["play → played", "enjoy → enjoyed", "stay → stayed"],
    transfer: "We ______ the movie. (enjoy)"
  },
  cvc_double: {
    title: "Una consonante se duplica",
    shortRule: "En verbos de una sílaba con CVC, duplicamos la consonante final y agregamos ED.",
    discovery: "Las últimas letras forman consonante–vocal–consonante. ¿Qué sucede con la última consonante?",
    hypothesis: ["Se mantiene una sola vez.", "Se duplica antes de ED.", "Se elimina antes de ED."],
    observe: ["stop → stopped", "plan → planned", "rob → robbed"],
    transfer: "The bus ______ near my house. (stop)"
  },
  do_not_double: {
    title: "No todo final se duplica",
    shortRule: "No duplicamos W, X o Y; tampoco duplicamos si no hay un CVC de una sílaba.",
    discovery: "Compara FIX y RAIN con STOP. ¿Qué detalle evita la duplicación?",
    hypothesis: ["Todas las consonantes finales se duplican.", "X no se duplica y RAIN no termina en CVC.", "La última letra siempre desaparece."],
    observe: ["fix → fixed", "rain → rained", "open → opened"],
    transfer: "He ______ his computer. (fix)"
  }
};

export const VERBS: VerbItem[] = [
  { id: "work", base: "work", past: "worked", ruleId: "general_ed", segmentation: ["work", "ed"], explanation: "WORK permanece completo y recibe ED.", hints: ["Mira el final: no hay una E ni una Y.", "¿Qué dos letras aparecen al final de WORKED?"], sentence: "My brother ______ yesterday. (work)" },
  { id: "clean", base: "clean", past: "cleaned", ruleId: "general_ed", segmentation: ["clean", "ed"], explanation: "CLEAN permanece completo y recibe ED.", hints: ["Conserva todas las letras de CLEAN.", "Solo falta la terminación del pasado."] },
  { id: "wash", base: "wash", past: "washed", ruleId: "general_ed", segmentation: ["wash", "ed"], explanation: "WASH permanece completo y recibe ED.", hints: ["No cambies ninguna letra de WASH.", "Añade la terminación del pasado."] },
  { id: "help", base: "help", past: "helped", ruleId: "general_ed", segmentation: ["help", "ed"], explanation: "HELP permanece completo y recibe ED.", hints: ["El verbo no necesita transformación interna.", "¿Qué agregas al final?"], sentence: "They ______ the guide. (help)" },
  { id: "watch", base: "watch", past: "watched", ruleId: "general_ed", segmentation: ["watch", "ed"], explanation: "WATCH permanece completo y recibe ED.", hints: ["Conserva WATCH completo.", "Agrega la terminación del pasado."] },
  { id: "jump", base: "jump", past: "jumped", ruleId: "general_ed", segmentation: ["jump", "ed"], explanation: "JUMP permanece completo y recibe ED.", hints: ["No quites letras.", "El final del pasado tiene dos letras."] },
  { id: "live", base: "live", past: "lived", ruleId: "final_e", segmentation: ["live", "d"], explanation: "LIVE ya termina en E; agregamos solamente D.", hints: ["Mira la E final de LIVE.", "No necesitamos escribir otra E."], sentence: "She ______ near the museum. (live)" },
  { id: "love", base: "love", past: "loved", ruleId: "final_e", segmentation: ["love", "d"], explanation: "LOVE ya termina en E; agregamos solamente D.", hints: ["La E ya está dentro del verbo.", "¿Qué letra basta después de E?"], sentence: "They ______ the view. (love)" },
  { id: "dance", base: "dance", past: "danced", ruleId: "final_e", segmentation: ["dance", "d"], explanation: "DANCE ya termina en E; agregamos solamente D.", hints: ["Conserva la E final.", "No agregues ED completo."], sentence: "She ______ at the party. (dance)" },
  { id: "use", base: "use", past: "used", ruleId: "final_e", segmentation: ["use", "d"], explanation: "USE ya termina en E; agregamos solamente D.", hints: ["La E final ya aporta la vocal.", "Solo hace falta D."] },
  { id: "arrive", base: "arrive", past: "arrived", ruleId: "final_e", segmentation: ["arrive", "d"], explanation: "ARRIVE ya termina en E; agregamos solamente D.", hints: ["No repitas la E.", "Agrega una sola letra."] },
  { id: "close", base: "close", past: "closed", ruleId: "final_e", segmentation: ["close", "d"], explanation: "CLOSE ya termina en E; agregamos solamente D.", hints: ["La E se conserva.", "La nueva letra es D."], sentence: "They ______ the door. (close)" },
  { id: "study", base: "study", past: "studied", ruleId: "consonant_y", segmentation: ["stud", "y", "i", "ed"], explanation: "Antes de Y está D, una consonante: Y cambia por I y agregamos ED.", hints: ["Observa la letra antes de Y: D.", "D es consonante; mira qué pasa con Y."], sentence: "Yesterday, I ______ English. (study)" },
  { id: "carry", base: "carry", past: "carried", ruleId: "consonant_y", segmentation: ["carr", "y", "i", "ed"], explanation: "Antes de Y está R, una consonante: Y cambia por I y agregamos ED.", hints: ["¿Qué letra aparece antes de Y?", "R es consonante; transforma Y antes de ED."] },
  { id: "try", base: "try", past: "tried", ruleId: "consonant_y", segmentation: ["tr", "y", "i", "ed"], explanation: "Antes de Y está R, una consonante: Y cambia por I y agregamos ED.", hints: ["R está antes de Y.", "No conserves la Y cuando hay consonante antes."] },
  { id: "copy", base: "copy", past: "copied", ruleId: "consonant_y", segmentation: ["cop", "y", "i", "ed"], explanation: "Antes de Y está P, una consonante: Y cambia por I y agregamos ED.", hints: ["P es consonante.", "Y cambia antes de agregar ED."] },
  { id: "worry", base: "worry", past: "worried", ruleId: "consonant_y", segmentation: ["worr", "y", "i", "ed"], explanation: "Antes de Y está R, una consonante: Y cambia por I y agregamos ED.", hints: ["Mira la letra anterior a Y.", "Consonante + Y necesita I antes de ED."] },
  { id: "cry", base: "cry", past: "cried", ruleId: "consonant_y", segmentation: ["cr", "y", "i", "ed"], explanation: "Antes de Y está R, una consonante: Y cambia por I y agregamos ED.", hints: ["R es consonante.", "Cambia Y por I y agrega ED."] },
  { id: "play", base: "play", past: "played", ruleId: "vowel_y", segmentation: ["play", "ed"], explanation: "Antes de Y está A, una vocal: Y se conserva y agregamos ED.", hints: ["Observa A antes de Y.", "A es vocal; no cambies Y."], sentence: "We ______ outside. (play)" },
  { id: "enjoy", base: "enjoy", past: "enjoyed", ruleId: "vowel_y", segmentation: ["enjoy", "ed"], explanation: "Antes de Y está O, una vocal: Y se conserva y agregamos ED.", hints: ["Observa O antes de Y.", "O es vocal; conserva Y."], sentence: "We ______ the movie. (enjoy)" },
  { id: "stay", base: "stay", past: "stayed", ruleId: "vowel_y", segmentation: ["stay", "ed"], explanation: "Antes de Y está A, una vocal: Y se conserva y agregamos ED.", hints: ["A es vocal.", "Y no se transforma."] },
  { id: "obey", base: "obey", past: "obeyed", ruleId: "vowel_y", segmentation: ["obey", "ed"], explanation: "Antes de Y está E, una vocal: Y se conserva y agregamos ED.", hints: ["E es vocal.", "Conserva Y y agrega ED."] },
  { id: "destroy", base: "destroy", past: "destroyed", ruleId: "vowel_y", segmentation: ["destroy", "ed"], explanation: "Antes de Y está O, una vocal: Y se conserva y agregamos ED.", hints: ["O es vocal.", "No cambies Y."] },
  { id: "stop", base: "stop", past: "stopped", ruleId: "cvc_double", segmentation: ["s", "o", "p", "p", "ed"], explanation: "STOP termina en S–O–P: consonante, vocal, consonante. Duplicamos P y agregamos ED.", hints: ["Mira las tres últimas letras: S–O–P.", "¿Forman consonante–vocal–consonante?"], sentence: "The bus ______ near my house. (stop)" },
  { id: "plan", base: "plan", past: "planned", ruleId: "cvc_double", segmentation: ["p", "l", "a", "n", "n", "ed"], explanation: "PLAN termina en P–L–A–N y sus tres últimas letras son CVC. Duplicamos N.", hints: ["Mira L–A–N.", "A es vocal entre consonantes."], sentence: "We ______ a small trip. (plan)" },
  { id: "rob", base: "rob", past: "robbed", ruleId: "cvc_double", segmentation: ["r", "o", "b", "b", "ed"], explanation: "ROB termina en R–O–B: consonante, vocal, consonante. Duplicamos B.", hints: ["Separa R–O–B.", "La última consonante se copia una vez."] },
  { id: "drop", base: "drop", past: "dropped", ruleId: "cvc_double", segmentation: ["d", "r", "o", "p", "p", "ed"], explanation: "DROP termina en R–O–P: consonante, vocal, consonante. Duplicamos P.", hints: ["Mira R–O–P.", "Duplica la consonante final antes de ED."] },
  { id: "shop", base: "shop", past: "shopped", ruleId: "cvc_double", segmentation: ["s", "h", "o", "p", "p", "ed"], explanation: "SHOP termina en H–O–P: consonante, vocal, consonante. Duplicamos P.", hints: ["Observa H–O–P.", "La P final aparece dos veces."] },
  { id: "chat", base: "chat", past: "chatted", ruleId: "cvc_double", segmentation: ["c", "h", "a", "t", "t", "ed"], explanation: "CHAT termina en H–A–T: consonante, vocal, consonante. Duplicamos T.", hints: ["Mira H–A–T.", "Duplica T antes de ED."] },
  { id: "fix", base: "fix", past: "fixed", ruleId: "do_not_double", segmentation: ["fix", "ed"], explanation: "La X no se duplica. FIX conserva su forma y recibe ED.", hints: ["La última letra es X.", "X aparece una sola vez antes de ED."], sentence: "He ______ his computer. (fix)" },
  { id: "rain", base: "rain", past: "rained", ruleId: "do_not_double", segmentation: ["rain", "ed"], explanation: "RAIN no termina en CVC: antes de N hay dos vocales juntas. Conservamos el verbo y agregamos ED.", hints: ["Mira AI antes de N.", "No hay una sola vocal entre consonantes."], sentence: "It ______ all afternoon. (rain)" },
  { id: "open", base: "open", past: "opened", ruleId: "do_not_double", segmentation: ["open", "ed"], explanation: "OPEN no es un verbo CVC de una sílaba; conservamos el verbo y agregamos ED.", hints: ["No apliques duplicación a todos los verbos.", "Conserva OPEN y agrega ED."] },
  { id: "cook", base: "cook", past: "cooked", ruleId: "do_not_double", segmentation: ["cook", "ed"], explanation: "COOK no termina en CVC: antes de K aparecen dos vocales. Conservamos el verbo y agregamos ED.", hints: ["Mira OO antes de K.", "No dupliques K."] }
];

export const DIAGNOSTIC_IDS = ["work", "live", "study", "play", "stop", "fix", "plan", "wash"];
export const RULE_ORDER: RuleId[] = ["general_ed", "final_e", "consonant_y", "vowel_y", "cvc_double", "do_not_double"];
export const FINAL_IDS = ["work", "dance", "study", "play", "stop", "fix", "love", "carry", "rain", "plan", "enjoy", "wash"];

export function verbById(id: string) {
  const verb = VERBS.find((item) => item.id === id);
  if (!verb) throw new Error(`Unknown spelling verb: ${id}`);
  return verb;
}

export function verbsForRule(ruleId: RuleId) {
  return VERBS.filter((verb) => verb.ruleId === ruleId);
}
