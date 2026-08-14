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

test("Grammar Play publica una oferta abundante y equilibrada", () => {
  assert.deepEqual(engine.grammarInventory(curriculum.GRAMMAR_SKILLS, curriculum.GRAMMAR_CAPSULES), [
    { level: "A1", skills: 7, capsules: 35, interactions: 105 },
    { level: "A2", skills: 9, capsules: 45, interactions: 135 },
    { level: "B1", skills: 10, capsules: 50, interactions: 150 },
    { level: "B2", skills: 10, capsules: 50, interactions: 150 },
    { level: "C1", skills: 8, capsules: 40, interactions: 120 }
  ]);
  assert.equal(curriculum.GRAMMAR_CAPSULES.length, 220);
  assert.deepEqual(validation.validateGrammarContent(), []);
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
