import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const root = process.cwd();

function transpile(relativePath, requireMap = {}) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  new Function("require", "exports", "module", code)((specifier) => requireMap[specifier] || require(specifier), module.exports, module);
  return module.exports;
}

const curriculum = transpile("lib/grammar/curriculum.ts");
const engine = transpile("lib/grammar/engine.ts");
const validation = transpile("lib/grammar/validation.ts", { "@/lib/grammar/curriculum": curriculum });
const archive = transpile("lib/grammar/archive-before-midnight.ts");
const archiveEngine = transpile("lib/grammar/archive-engine.ts", { "@/lib/grammar/archive-before-midnight": archive });

test("Grammar Play publica una oferta abundante y equilibrada", () => {
  assert.deepEqual(engine.grammarInventory(curriculum.GRAMMAR_SKILLS, curriculum.GRAMMAR_CAPSULES), [
    { level: "A1", skills: 7, capsules: 35, interactions: 105 },
    { level: "A2", skills: 9, capsules: 45, interactions: 135 },
    { level: "B1", skills: 11, capsules: 51, interactions: 156 },
    { level: "B2", skills: 10, capsules: 50, interactions: 150 },
    { level: "C1", skills: 8, capsules: 40, interactions: 120 }
  ]);
  assert.equal(curriculum.GRAMMAR_CAPSULES.length, 221);
  assert.deepEqual(validation.validateGrammarContent(), []);
});

test("The Archive Before Midnight está publicado en B1 y conserva sus seis evidencias", () => {
  const capsule = curriculum.capsuleBySlug("the-archive-before-midnight");
  assert.equal(capsule.id, "b1-grammar-archive-before-midnight");
  assert.equal(capsule.level, "B1");
  assert.equal(capsule.blockId, "a-change-of-plan");
  assert.equal(capsule.interactions.length, 6);
  assert.equal(archive.ARCHIVE_MISSIONS.length, 6);
  assert.equal(archive.ARCHIVE_MISSIONS[1].answer, "had left");
  assert.equal(archive.ARCHIVE_MISSIONS[5].answer, "By the time the team opened Locker 7, the courier had switched the labels.");
});

test("la partida del Archivo guarda pistas, sustituye una evidencia asistida y distingue dominio", () => {
  const capsule = curriculum.capsuleBySlug("the-archive-before-midnight");
  let progress = engine.startGrammarCapsule(engine.emptyGrammarProgress(), capsule.id);
  progress = archiveEngine.startArchiveGame(progress);
  progress = archiveEngine.recordArchiveHint(progress, "alarm", 1);
  progress = archiveEngine.recordArchiveAttempt(progress, "alarm", "mara-first", false, false);
  progress = archiveEngine.recordArchiveAttempt(progress, "alarm", "mara-first", false, false);
  progress = archiveEngine.recordArchiveAttempt(progress, "alarm", "mara-first", false, true);
  assert.equal(progress.archiveGames[capsule.id].missions.alarm.hintsUsed, 1);
  assert.equal(progress.archiveGames[capsule.id].missions.alarm.assisted, true);
  progress = archiveEngine.recordArchiveAttempt(progress, "alarm", "lights-first", true, true);
  assert.equal(progress.archiveGames[capsule.id].missions.alarm.completed, true);
  progress = archiveEngine.completeArchiveGame(progress, false);
  assert.equal(progress.archiveGames[capsule.id].status, "completed-assisted");
  assert.equal(progress.archiveGames[capsule.id].transferIndependent, false);
});

test("la finalización del Archivo es idempotente y reiniciar conserva el mejor resultado", () => {
  const capsule = curriculum.capsuleBySlug("the-archive-before-midnight");
  let progress = archiveEngine.startArchiveGame(engine.emptyGrammarProgress());
  progress = archiveEngine.recordArchiveAttempt(progress, "seal", archive.ARCHIVE_MISSIONS[5].answer, true, false);
  progress = archiveEngine.completeArchiveGame(progress, true);
  const completedAt = progress.archiveGames[capsule.id].completedAt;
  progress = archiveEngine.completeArchiveGame(progress, true);
  assert.equal(progress.archiveGames[capsule.id].completedAt, completedAt);
  progress = archiveEngine.restartArchiveGame(progress);
  assert.equal(progress.archiveGames[capsule.id].repeats, 1);
  assert.equal(progress.archiveGames[capsule.id].bestScore >= 0, true);
});

test("normaliza respuestas sin aceptar formas gramaticales erróneas", () => {
  assert.equal(engine.normalizeGrammarAnswer("  STUDIED  "), "studied");
  assert.equal(engine.normalizeGrammarAnswer("She has arrived."), "she has arrived");
  assert.equal(engine.isGrammarAnswerCorrect("PLAYED", "played"), true);
  assert.equal(engine.isGrammarAnswerCorrect("plaied", "played"), false);
});

test("un error no avanza; una respuesta asistida no eleva el dominio independiente", () => {
  const capsule = curriculum.capsuleBySlug("a2-ed-spelling-choice");
  let progress = engine.emptyGrammarProgress();
  progress = engine.startGrammarCapsule(progress, capsule.id);
  progress = engine.recordGrammarAttempt(progress, capsule, false, false, false);
  assert.equal(progress.capsules[capsule.id].currentInteractionIndex, 0);
  progress = engine.recordGrammarAttempt(progress, capsule, true, true, false);
  assert.equal(progress.capsules[capsule.id].independentCorrect, 0);
  assert.equal(progress.capsules[capsule.id].assistedCorrect, 1);
});

test("la recomendación prioriza continuar y después alterna contraste o corrección", () => {
  const capsule = curriculum.capsuleBySlug("a2-ed-spelling-choice");
  let progress = engine.startGrammarCapsule(engine.emptyGrammarProgress(), capsule.id);
  const suggested = engine.recommendedCapsules(curriculum.GRAMMAR_CAPSULES, progress);
  assert.equal(suggested[0].id, capsule.id);
  assert.equal(suggested.some((item) => item.learningFunction === "contrast" || item.learningFunction === "correct"), true);
});

test("el progreso es serializable para respaldo local o perfil autenticado", () => {
  const progress = engine.startGrammarCapsule(engine.emptyGrammarProgress(), "a1-be-signal");
  assert.equal(engine.isGrammarProgress(JSON.parse(JSON.stringify(progress))), true);
});
