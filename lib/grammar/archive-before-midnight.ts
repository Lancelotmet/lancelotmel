export const ARCHIVE_CAPSULE_ID = "b1-grammar-archive-before-midnight";
export const ARCHIVE_SLUG = "the-archive-before-midnight";

export type ArchiveMissionKind = "timeline" | "record" | "dossier" | "repair" | "question" | "builder";

export type ArchiveVariant = {
  prompt: string;
  options?: string[];
  tokens?: string[];
  answer: string;
  example: string;
  actionLabel: string;
};

export type ArchiveMission = {
  id: string;
  title: string;
  scene: string;
  kind: ArchiveMissionKind;
  instruction: string;
  actionLabel: string;
  options?: string[];
  answer: string;
  correctFeedback: string;
  feedback: Record<string, string>;
  hints: [string, string];
  parallelExample: string;
  variant: ArchiveVariant;
  tokens?: string[];
  distractors?: string[];
};

export const ARCHIVE_MISSIONS: ArchiveMission[] = [
  {
    id: "alarm", title: "La alarma ya estaba activa", kind: "timeline",
    scene: "La cámara muestra a Mara llegando al archivo a las 00:17. El registro técnico demuestra que la alarma comenzó a sonar a las 00:15.",
    instruction: "Restituye las dos huellas: una ocurrió primero y la otra después.", actionLabel: "Restaurar secuencia", answer: "alarm-first",
    correctFeedback: "Restauraste el orden: la alarma comenzó a las 00:15 y Mara llegó a las 00:17. El inicio de la alarma ya formaba parte del pasado cuando ocurrió la llegada.",
    feedback: { "mara-first": "Las marcas horarias se invirtieron. Revisa cuál evidencia dejó la primera huella.", incomplete: "El archivo necesita dos huellas: una anterior y una posterior." },
    hints: ["No mires todavía la forma verbal. Compara únicamente las dos horas.", "00:15 ocurrió antes que 00:17. Coloca la alarma en la primera huella temporal."],
    parallelExample: "Si una puerta se cerró a las 8:00 y Leo llegó a las 8:05, el cierre ocurrió primero: The door had closed before Leo arrived.",
    variant: { prompt: "00:09: The lights went out. 00:12: The guard entered.", answer: "lights-first", example: "The lights went out before the guard entered.", actionLabel: "Validar variante" }
  },
  {
    id: "north-door", title: "El registro de la puerta norte", kind: "record",
    scene: "El guardia salió a las 00:20. El mensajero llegó a las 00:22. El registro perdió la forma verbal que demuestra quién estuvo primero.",
    instruction: "Inserta el fragmento verbal que permite recuperar el registro.", actionLabel: "Validar registro", answer: "had left",
    options: ["had left", "had leave", "has left", "left had"],
    correctFeedback: "Elegiste had left: la salida ocurrió antes de la llegada. Después de had necesitamos el participio left, no la forma base leave.",
    feedback: { "had leave": "La secuencia temporal está bien orientada, pero después de had necesitas el participio. El participio de leave es irregular.", "has left": "Has left pertenece al Present Perfect. Aquí ambos hechos están cerrados dentro de una escena pasada.", "left had": "El auxiliar debe ir antes del participio: primero had, después la forma left." },
    hints: ["Busca la forma que marque la salida como anterior y que empiece con had.", "Contrasta had leave y had left. ¿Cuál contiene el participio irregular de leave?"],
    parallelExample: "go → gone: The train had gone before we arrived. El patrón es had + participle.",
    variant: { prompt: "The technician ___ before the system restarted.", options: ["had gone", "had went"], answer: "had gone", example: "The technician had gone before the system restarted.", actionLabel: "Validar variante" }
  },
  {
    id: "tunnel", title: "El archivo que contradice la cámara", kind: "dossier",
    scene: "La cámara registra que Nora entró al túnel a las 00:28. El apagón comenzó a las 00:31. Tres informes intentan describir la evidencia; solo uno conserva la secuencia.",
    instruction: "Abre el expediente cuya línea temporal coincide con la cámara.", actionLabel: "Interrogar expediente", answer: "B",
    options: ["A", "B", "C"],
    correctFeedback: "El expediente B conserva la evidencia: had entered marca la entrada anterior de Nora, mientras began fija el apagón posterior.",
    feedback: { A: "Ese informe coloca el apagón en Past Perfect y lo presenta como el hecho anterior, pero la cámara muestra que Nora entró tres minutos antes.", C: "Has entered conecta una acción con el presente. Esta investigación compara dos momentos ya terminados en el pasado." },
    hints: ["Localiza el hecho de las 00:28. Ese es el evento que necesita la marca de anterioridad.", "Reduce la elección a A y B. Observa cuál pone had junto a la entrada de Nora."],
    parallelExample: "El tren salió a las 6:00 y llegamos a las 6:10: By the time we arrived, the train had left. La acción más temprana recibe Past Perfect.",
    variant: { prompt: "01:04: el archivo fue borrado. 01:07: el detective abrió el sistema.", options: ["When the detective opened the system, someone had deleted the file.", "When the detective had opened the system, someone deleted the file."], answer: "When the detective opened the system, someone had deleted the file.", example: "Someone had deleted the file before the detective opened the system.", actionLabel: "Validar variante" }
  },
  {
    id: "transmission", title: "La transmisión dañada", kind: "repair",
    scene: "A las 00:40, el equipo revisó la bóveda y comprobó que el paquete todavía estaba allí. Una transmisión corrupta contiene una negación imposible.",
    instruction: "Sustituye el fragmento dañado sin perder la relación temporal.", actionLabel: "Reparar transmisión", answer: "had not taken",
    options: ["had not taken", "had not took", "did not taken", "has not taken"],
    correctFeedback: "Reparaste la transmisión con had not taken. La ausencia de la acción anterior se forma con had not + participle; taken es el participio de take.",
    feedback: { "had not took": "La estructura negativa es adecuada, pero took es Past Simple. Después de had not necesitas taken.", "did not taken": "Did not exige una forma base, pero además no marca con claridad una acción anterior a la revisión.", "has not taken": "Esa forma pertenece al Present Perfect y desplaza la escena hacia el presente." },
    hints: ["Conserva had para mantener la acción antes de la revisión y coloca not después del auxiliar.", "Elige entre had not took y had not taken. ¿Cuál utiliza el participio?"],
    parallelExample: "She had not seen the warning before she entered. La negación se construye con had not + participle.",
    variant: { prompt: "The guard ___ the message before the screen went dark.", options: ["had not read", "did not read"], answer: "had not read", example: "The guard had not read the message before the screen went dark.", actionLabel: "Reparar variante" }
  },
  {
    id: "interrogation", title: "El interrogatorio temporal", kind: "question",
    scene: "Necesitas averiguar si el sospechoso vio un mensaje antes de que fallara la energía. La consola solo permite enviar una pregunta lingüísticamente válida.",
    instruction: "Envía la pregunta que investiga el evento anterior al fallo.", actionLabel: "Enviar interrogatorio", answer: "Had you seen the message before the power failed?",
    options: ["Had you seen the message before the power failed?", "Did you had seen the message before the power failed?", "Have you seen the message before the power failed?", "Had you saw the message before the power failed?"],
    correctFeedback: "Formulaste la pregunta con Had + subject + participle. Had you seen…? investiga una experiencia anterior al fallo, expresado con failed en Past Simple.",
    feedback: { "Did you had seen the message before the power failed?": "No combines did con had seen. Para preguntar en Past Perfect, had se mueve delante del sujeto.", "Have you seen the message before the power failed?": "Have you seen se conecta con el presente, pero el interrogatorio compara dos hechos dentro de una escena pasada.", "Had you saw the message before the power failed?": "Después de had necesitas el participio seen, no el Past Simple saw." },
    hints: ["La pregunta debe comenzar con el auxiliar que marca anterioridad: Had.", "Contrasta saw y seen. Después de had, usa el participio."],
    parallelExample: "Had they finished before the bell rang? En la pregunta, had aparece antes del sujeto.",
    variant: { prompt: "___ she left before the meeting started?", options: ["Had", "Did had"], answer: "Had", example: "Had she left before the meeting started?", actionLabel: "Enviar variante" }
  },
  {
    id: "seal", title: "Sellar el informe final", kind: "builder",
    scene: "La última evidencia revela: 00:42, el mensajero cambió las etiquetas; 00:44, el equipo abrió el casillero 7.",
    instruction: "Construye la conclusión que permitirá sellar el expediente.", actionLabel: "Sellar informe", answer: "By the time the team opened Locker 7, the courier had switched the labels.",
    tokens: ["By the time", "the team", "opened", "Locker 7,", "the courier", "had switched", "the labels."],
    distractors: ["had opened", "switched", "has switched", "had switch"],
    correctFeedback: "Sellaste una secuencia completa: opened fija el momento posterior y had switched demuestra que el cambio de etiquetas ya había ocurrido.",
    feedback: { temporal: "Revisa qué sucedió a las 00:42. Esa acción debe quedar marcada como anterior a la apertura de las 00:44.", participle: "La estructura necesita had + past participle. Para switch, el participio regular es switched.", present: "Has switched conecta con el presente. El informe reconstruye dos momentos terminados durante la misma noche." },
    hints: ["Construye primero el punto posterior: By the time the team opened Locker 7…", "Ahora añade el hecho ya completado: the courier had switched…"],
    parallelExample: "Datos: cierre a las 9:00; llegada a las 9:05. Informe: By the time I arrived, the office had closed.",
    variant: { prompt: "01:10: alguien apagó el servidor; 01:13: Mara entró a la sala.", tokens: ["When", "Mara", "entered", "the room,", "someone", "had turned off", "the server."], answer: "When Mara entered the room, someone had turned off the server.", example: "When Mara entered the room, someone had turned off the server.", actionLabel: "Sellar variante" }
  }
];

export function archiveFeedback(mission: ArchiveMission, answer: string) {
  if (mission.kind === "builder") {
    if (answer.includes("has switched")) return mission.feedback.present;
    if (answer.includes("had switch") || answer.includes(" switched the labels")) return mission.feedback.participle;
    return mission.feedback.temporal;
  }
  return mission.feedback[answer] ?? "La evidencia todavía no respeta el orden de los dos momentos pasados.";
}
