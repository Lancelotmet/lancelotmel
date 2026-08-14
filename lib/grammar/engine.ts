import { CapsuleProgress, GrammarCapsule, GrammarProgress, GrammarSkill, SkillProgress } from "@/lib/grammar/types";

export function emptyGrammarProgress(): GrammarProgress {
  return { version: 1, capsules: {}, skills: {} };
}

export function isGrammarProgress(value: unknown): value is GrammarProgress {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GrammarProgress>;
  return candidate.version === 1 && Boolean(candidate.capsules) && Boolean(candidate.skills);
}

export function normalizeGrammarAnswer(value: string) {
  return value.trim().toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ").replace(/[.?!]+$/g, "");
}

export function isGrammarAnswerCorrect(answer: string, expected: string, accepted: string[] = []) {
  const normalized = normalizeGrammarAnswer(answer);
  return [expected, ...accepted].some((option) => normalizeGrammarAnswer(option) === normalized);
}

function capsuleState(previous: CapsuleProgress | undefined, capsuleId: string): CapsuleProgress {
  return previous ?? { capsuleId, status: "not-started", currentInteractionIndex: 0, attempts: 0, independentCorrect: 0, assistedCorrect: 0 };
}

function skillState(previous: SkillProgress | undefined, skillId: string): SkillProgress {
  return previous ?? { skillId, attempts: 0, independentCorrect: 0, assistedCorrect: 0, misconceptionCounts: {}, mastery: 0 };
}

export function recordGrammarAttempt(progress: GrammarProgress, capsule: GrammarCapsule, correct: boolean, assisted: boolean, completed: boolean): GrammarProgress {
  const now = new Date().toISOString();
  const capsuleProgress = capsuleState(progress.capsules[capsule.id], capsule.id);
  const skillProgress = skillState(progress.skills[capsule.skillId], capsule.skillId);
  const attempts = capsuleProgress.attempts + 1;
  const independentCorrect = capsuleProgress.independentCorrect + (correct && !assisted ? 1 : 0);
  const assistedCorrect = capsuleProgress.assistedCorrect + (correct && assisted ? 1 : 0);
  const nextCapsule: CapsuleProgress = {
    ...capsuleProgress,
    status: completed ? "completed" : "in-progress",
    attempts,
    independentCorrect,
    assistedCorrect,
    currentInteractionIndex: completed ? capsule.interactions.length : Math.min(capsule.interactions.length - 1, capsuleProgress.currentInteractionIndex + (correct ? 1 : 0)),
    bestScore: Math.max(capsuleProgress.bestScore ?? 0, Math.round((independentCorrect / Math.max(attempts, 1)) * 100)),
    completedAt: completed ? now : capsuleProgress.completedAt,
    lastPlayedAt: now
  };
  const skillAttempts = skillProgress.attempts + 1;
  const skillIndependent = skillProgress.independentCorrect + (correct && !assisted ? 1 : 0);
  const skillAssisted = skillProgress.assistedCorrect + (correct && assisted ? 1 : 0);
  const nextSkill: SkillProgress = {
    ...skillProgress,
    attempts: skillAttempts,
    independentCorrect: skillIndependent,
    assistedCorrect: skillAssisted,
    mastery: Math.min(100, Math.round((skillIndependent * 100) / Math.max(skillAttempts, 1))),
    lastPracticedAt: now
  };
  return { ...progress, capsules: { ...progress.capsules, [capsule.id]: nextCapsule }, skills: { ...progress.skills, [capsule.skillId]: nextSkill }, lastCapsuleId: capsule.id, updatedAt: now };
}

export function startGrammarCapsule(progress: GrammarProgress, capsuleId: string): GrammarProgress {
  const current = capsuleState(progress.capsules[capsuleId], capsuleId);
  return { ...progress, capsules: { ...progress.capsules, [capsuleId]: { ...current, status: current.status === "completed" ? "completed" : "in-progress", lastPlayedAt: new Date().toISOString() } }, lastCapsuleId: capsuleId, updatedAt: new Date().toISOString() };
}

export function moveGrammarCapsule(progress: GrammarProgress, capsule: GrammarCapsule, interactionIndex: number): GrammarProgress {
  const current = capsuleState(progress.capsules[capsule.id], capsule.id);
  const now = new Date().toISOString();
  return {
    ...progress,
    capsules: { ...progress.capsules, [capsule.id]: { ...current, status: "in-progress", currentInteractionIndex: Math.min(capsule.interactions.length - 1, Math.max(0, interactionIndex)), lastPlayedAt: now } },
    lastCapsuleId: capsule.id,
    updatedAt: now
  };
}

export function recommendedCapsules(capsules: GrammarCapsule[], progress: GrammarProgress, limit = 8) {
  const ranked = [...capsules].sort((left, right) => score(right) - score(left));
  const selected: GrammarCapsule[] = [];
  const functionsUsed = new Set<string>();
  while (selected.length < limit && ranked.length) {
    const previous = selected.at(-1);
    const diverse = ranked.find((capsule) => !functionsUsed.has(capsule.learningFunction) && capsule.format !== previous?.format);
    const differentFormat = ranked.find((capsule) => capsule.format !== previous?.format);
    const next = diverse ?? differentFormat ?? ranked[0];
    selected.push(next);
    functionsUsed.add(next.learningFunction);
    ranked.splice(ranked.indexOf(next), 1);
  }
  return selected;
  function score(capsule: GrammarCapsule) {
    const state = progress.capsules[capsule.id];
    const skill = progress.skills[capsule.skillId];
    if (state?.status === "in-progress") return 1000;
    if (state?.status === "completed") return -100;
    const weakBoost = skill && skill.attempts >= 2 && skill.mastery < 70 ? 70 : 0;
    const variety = capsule.learningFunction === "contrast" || capsule.learningFunction === "correct" ? 20 : 0;
    return (capsule.featured ? 40 : 0) + weakBoost + variety - capsule.difficulty;
  }
}

export function grammarInventory(skills: GrammarSkill[], capsules: GrammarCapsule[]) {
  return ["A1", "A2", "B1", "B2", "C1"].map((level) => ({ level, skills: skills.filter((skill) => skill.level === level).length, capsules: capsules.filter((capsule) => capsule.level === level).length, interactions: capsules.filter((capsule) => capsule.level === level).reduce((sum, capsule) => sum + capsule.interactions.length, 0) }));
}
