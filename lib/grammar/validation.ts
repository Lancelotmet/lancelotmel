import { GRAMMAR_CAPSULES, GRAMMAR_SKILLS } from "@/lib/grammar/curriculum";

export function validateGrammarContent() {
  const issues: string[] = [];
  const skillIds = new Set<string>();
  const capsuleIds = new Set<string>();
  const titles = new Set<string>();
  for (const skill of GRAMMAR_SKILLS) {
    if (skillIds.has(skill.id)) issues.push(`Habilidad duplicada: ${skill.id}`);
    skillIds.add(skill.id);
    if (skill.examples.length < 3) issues.push(`Habilidad sin tres ejemplos: ${skill.id}`);
    if (!skill.sourceReferences.length) issues.push(`Habilidad sin fuente: ${skill.id}`);
  }
  for (const capsule of GRAMMAR_CAPSULES) {
    if (capsuleIds.has(capsule.id)) issues.push(`Píldora duplicada: ${capsule.id}`);
    capsuleIds.add(capsule.id);
    if (titles.has(capsule.title)) issues.push(`Título duplicado: ${capsule.title}`);
    titles.add(capsule.title);
    if (!skillIds.has(capsule.skillId)) issues.push(`Píldora con habilidad inexistente: ${capsule.id}`);
    if (capsule.status === "published" && (capsule.interactions.length < 3 || capsule.interactions.length > 8)) issues.push(`Cantidad de interacciones inválida: ${capsule.id}`);
    for (const interaction of capsule.interactions) {
      if (!interaction.answer.trim()) issues.push(`Respuesta vacía: ${interaction.id}`);
      if (!interaction.correctFeedback.trim()) issues.push(`Feedback vacío: ${interaction.id}`);
      if ((interaction.type === "single-choice" || interaction.type === "classification") && !interaction.options?.includes(interaction.answer)) issues.push(`Respuesta ausente de opciones: ${interaction.id}`);
    }
  }
  return issues;
}
