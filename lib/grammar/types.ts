export type GrammarLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type CapsuleFormat =
  | "quick-choice"
  | "word-builder"
  | "sentence-builder"
  | "sort-and-match"
  | "spot-the-error"
  | "repair-the-sentence"
  | "choose-the-rule"
  | "contrast-battle"
  | "grammar-detective"
  | "timeline-choice"
  | "context-mission"
  | "mini-dialogue"
  | "transformation-sprint"
  | "missing-word"
  | "ordering-challenge"
  | "true-or-trap"
  | "odd-one-out"
  | "guided-production"
  | "mixed-challenge";

export type LearningFunction = "discover" | "practice" | "contrast" | "correct" | "build" | "apply" | "master";
export type InteractionType = "single-choice" | "text-input" | "sentence-completion" | "sentence-ordering" | "error-correction" | "classification";

export type SourceReference = { fileName: string; page?: number; section?: string; heading?: string };

export type GrammarExample = {
  prompt: string;
  answer: string;
  choices: string[];
  wrong: string;
  sentence: string;
  feedback: string;
};

export type GrammarSkill = {
  id: string;
  level: GrammarLevel;
  blockId: string;
  blockTitle: string;
  title: string;
  learningObjective: string;
  prerequisiteIds: string[];
  rule: string;
  eureka: string;
  commonError: string;
  examples: GrammarExample[];
  sourceReferences: SourceReference[];
  placementConfidence: "explicit" | "strong-inference" | "ambiguous";
};

export type GrammarInteraction = {
  id: string;
  capsuleId: string;
  skillId: string;
  type: InteractionType;
  prompt: string;
  instruction: string;
  answer: string;
  acceptedAnswers?: string[];
  options?: string[];
  hintSequence: string[];
  correctFeedback: string;
  guidance: string;
  workedExample?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
};

export type GrammarCapsule = {
  id: string;
  slug: string;
  level: GrammarLevel;
  blockId: string;
  blockTitle: string;
  skillId: string;
  title: string;
  subtitle: string;
  mission: string;
  learningFunction: LearningFunction;
  format: CapsuleFormat;
  estimatedMinutes: 2 | 3 | 4 | 5 | 6;
  difficulty: 1 | 2 | 3 | 4 | 5;
  thumbnailVariant: string;
  interactionCount: number;
  prerequisiteIds: string[];
  tags: string[];
  sourceReferences: SourceReference[];
  status: "published" | "draft";
  featured: boolean;
  isNew: boolean;
  interactions: GrammarInteraction[];
};

export type CapsuleProgress = {
  capsuleId: string;
  status: "not-started" | "in-progress" | "completed";
  currentInteractionIndex: number;
  attempts: number;
  independentCorrect: number;
  assistedCorrect: number;
  bestScore?: number;
  completedAt?: string;
  lastPlayedAt?: string;
};

export type SkillProgress = {
  skillId: string;
  attempts: number;
  independentCorrect: number;
  assistedCorrect: number;
  misconceptionCounts: Record<string, number>;
  mastery: number;
  lastPracticedAt?: string;
};

export type GrammarProgress = {
  version: 1;
  capsules: Record<string, CapsuleProgress>;
  skills: Record<string, SkillProgress>;
  archiveGames?: Record<string, ArchiveGameProgress>;
  lastCapsuleId?: string;
  updatedAt?: string;
};

export type ArchiveMissionProgress = {
  attempts: number;
  hintsUsed: number;
  assisted: boolean;
  completed: boolean;
  selectedDistractors: string[];
  completedAt?: string;
};

export type ArchiveGameProgress = {
  capsuleId: string;
  status: "not-started" | "in-progress" | "completed" | "mastered" | "completed-assisted";
  startedAt?: string;
  completedAt?: string;
  currentMission: number;
  missions: Record<string, ArchiveMissionProgress>;
  transferIndependent: boolean;
  repeats: number;
  bestScore?: number;
  lastPlayedAt?: string;
};
