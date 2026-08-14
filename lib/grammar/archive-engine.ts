import { ARCHIVE_CAPSULE_ID } from "@/lib/grammar/archive-before-midnight";
import { ArchiveGameProgress, ArchiveMissionProgress, GrammarProgress } from "@/lib/grammar/types";

function now() { return new Date().toISOString(); }

function blankMission(): ArchiveMissionProgress {
  return { attempts: 0, hintsUsed: 0, assisted: false, completed: false, selectedDistractors: [] };
}

export function emptyArchiveGame(repeats = 0): ArchiveGameProgress {
  return {
    capsuleId: ARCHIVE_CAPSULE_ID,
    status: "not-started",
    currentMission: 0,
    missions: {},
    transferIndependent: false,
    repeats
  };
}

export function archiveGame(progress: GrammarProgress): ArchiveGameProgress {
  return progress.archiveGames?.[ARCHIVE_CAPSULE_ID] ?? emptyArchiveGame();
}

export function startArchiveGame(progress: GrammarProgress): GrammarProgress {
  const current = archiveGame(progress);
  const startedAt = current.startedAt ?? now();
  const game: ArchiveGameProgress = { ...current, status: current.status === "not-started" ? "in-progress" : current.status, startedAt, lastPlayedAt: now() };
  return { ...progress, archiveGames: { ...progress.archiveGames, [ARCHIVE_CAPSULE_ID]: game } };
}

export function recordArchiveAttempt(progress: GrammarProgress, missionId: string, answer: string, correct: boolean, assisted: boolean): GrammarProgress {
  const game = archiveGame(progress);
  const current = game.missions[missionId] ?? blankMission();
  const nextMission: ArchiveMissionProgress = {
    ...current,
    attempts: current.attempts + 1,
    assisted: current.assisted || assisted,
    completed: current.completed || correct,
    completedAt: correct ? now() : current.completedAt,
    selectedDistractors: correct ? current.selectedDistractors : [...current.selectedDistractors, answer]
  };
  const nextGame: ArchiveGameProgress = {
    ...game,
    status: "in-progress",
    missions: { ...game.missions, [missionId]: nextMission },
    lastPlayedAt: now()
  };
  return { ...progress, archiveGames: { ...progress.archiveGames, [ARCHIVE_CAPSULE_ID]: nextGame } };
}

export function recordArchiveHint(progress: GrammarProgress, missionId: string, hintLevel: number): GrammarProgress {
  const game = archiveGame(progress);
  const current = game.missions[missionId] ?? blankMission();
  const nextGame: ArchiveGameProgress = { ...game, status: "in-progress", missions: { ...game.missions, [missionId]: { ...current, hintsUsed: Math.max(current.hintsUsed, hintLevel) } }, lastPlayedAt: now() };
  return {
    ...progress,
    archiveGames: {
      ...progress.archiveGames,
      [ARCHIVE_CAPSULE_ID]: nextGame
    }
  };
}

export function moveArchiveMission(progress: GrammarProgress, nextMission: number): GrammarProgress {
  const game = archiveGame(progress);
  const nextGame: ArchiveGameProgress = { ...game, status: "in-progress", currentMission: Math.max(0, Math.min(5, nextMission)), lastPlayedAt: now() };
  return { ...progress, archiveGames: { ...progress.archiveGames, [ARCHIVE_CAPSULE_ID]: nextGame } };
}

export function completeArchiveGame(progress: GrammarProgress, independentTransfer: boolean): GrammarProgress {
  const game = archiveGame(progress);
  if (game.completedAt) return progress;
  const missions = Object.values(game.missions);
  const independent = missions.filter((mission) => mission.completed && !mission.assisted).length;
  const attempts = missions.reduce((total, mission) => total + mission.attempts, 0);
  const score = Math.round((independent * 100) / Math.max(attempts, 1));
  const status = independentTransfer ? "mastered" : "completed-assisted";
  const nextGame: ArchiveGameProgress = { ...game, status, currentMission: 5, transferIndependent: independentTransfer, completedAt: now(), lastPlayedAt: now(), bestScore: Math.max(game.bestScore ?? 0, score) };
  return {
    ...progress,
    archiveGames: {
      ...progress.archiveGames,
      [ARCHIVE_CAPSULE_ID]: nextGame
    }
  };
}

export function restartArchiveGame(progress: GrammarProgress): GrammarProgress {
  const previous = archiveGame(progress);
  const restarted = { ...emptyArchiveGame((previous.repeats ?? 0) + 1), bestScore: previous.bestScore };
  return { ...progress, archiveGames: { ...progress.archiveGames, [ARCHIVE_CAPSULE_ID]: restarted } };
}
