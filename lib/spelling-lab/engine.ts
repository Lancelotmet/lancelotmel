import { RuleId, RULE_ORDER, verbById } from "./content";

export type SkillState = { attempts: number; firstTryCorrect: number; consecutiveIndependentCorrect: number; scaffoldLevel: 0 | 1 | 2 | 3; mastery: number; completed: boolean; transferCorrect: boolean; classificationCorrect: boolean };
export type AttemptRecord = { verbId: string; ruleId: RuleId; answer: string; correct: boolean; independent: boolean; phase: string; at: number };

export function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function isCorrectPast(verbId: string, answer: string) {
  return normalizeAnswer(answer) === verbById(verbId).past;
}

export function emptySkill(): SkillState {
  return { attempts: 0, firstTryCorrect: 0, consecutiveIndependentCorrect: 0, scaffoldLevel: 0, mastery: 0, completed: false, transferCorrect: false, classificationCorrect: false };
}

export function initialSkills(): Record<RuleId, SkillState> {
  return Object.fromEntries(RULE_ORDER.map((rule) => [rule, emptySkill()])) as Record<RuleId, SkillState>;
}

export function scoreAttempt(skill: SkillState, correct: boolean, independent: boolean, isTransfer = false, isClassification = false): SkillState {
  const attempts = skill.attempts + 1;
  if (!correct) {
    const nextScaffold = Math.min(3, skill.scaffoldLevel + 1) as SkillState["scaffoldLevel"];
    return { ...skill, attempts, scaffoldLevel: nextScaffold, consecutiveIndependentCorrect: independent ? 0 : skill.consecutiveIndependentCorrect, mastery: Math.max(0, skill.mastery - 4) };
  }
  const consecutiveIndependentCorrect = independent ? skill.consecutiveIndependentCorrect + 1 : skill.consecutiveIndependentCorrect;
  const next = {
    ...skill,
    attempts,
    firstTryCorrect: skill.firstTryCorrect + (independent ? 1 : 0),
    consecutiveIndependentCorrect,
    scaffoldLevel: 0 as const,
    mastery: Math.min(100, skill.mastery + (independent ? 18 : 7)),
    transferCorrect: skill.transferCorrect || (isTransfer && correct),
    classificationCorrect: skill.classificationCorrect || (isClassification && correct)
  };
  return { ...next, completed: next.consecutiveIndependentCorrect >= 3 && next.transferCorrect && next.classificationCorrect };
}

export function diagnosticRoute(skills: Record<RuleId, SkillState>) {
  const weak = RULE_ORDER.filter((rule) => skills[rule].mastery < 55);
  return weak.length ? weak : RULE_ORDER;
}

export function finalWeakRules(skills: Record<RuleId, SkillState>) {
  return RULE_ORDER.filter((rule) => skills[rule].mastery < 70 || !skills[rule].completed);
}

export function globalMastery(skills: Record<RuleId, SkillState>) {
  return Math.round(RULE_ORDER.reduce((total, rule) => total + skills[rule].mastery, 0) / RULE_ORDER.length);
}
