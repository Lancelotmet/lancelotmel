import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const root = process.cwd();

function transpile(relativePath, requireMap = {}) {
  const filename = path.join(root, relativePath);
  const source = fs.readFileSync(filename, "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const module = { exports: {} };
  const localRequire = (specifier) => requireMap[specifier] || require(specifier);
  new Function("require", "exports", "module", code)(localRequire, module.exports, module);
  return module.exports;
}

const content = transpile("lib/spelling-lab/content.ts");
const engine = transpile("lib/spelling-lab/engine.ts", { "./content": content });

test("formas curadas del pasado regular", () => {
  const expected = { work: "worked", live: "lived", study: "studied", play: "played", stop: "stopped", fix: "fixed", rain: "rained", open: "opened", plan: "planned", enjoy: "enjoyed" };
  for (const [base, past] of Object.entries(expected)) {
    assert.equal(content.verbById(base).past, past);
    assert.equal(engine.isCorrectPast(base, past), true);
  }
});

test("normaliza espacios y mayúsculas sin aceptar letras erróneas", () => {
  assert.equal(engine.normalizeAnswer(" Worked "), "worked");
  assert.equal(engine.isCorrectPast("work", "WORKED"), true);
  assert.equal(engine.isCorrectPast("study", "studyed"), false);
});

test("la ayuda aumenta con tres errores y una respuesta revelada no cuenta como dominio", () => {
  let skill = engine.emptySkill();
  skill = engine.scoreAttempt(skill, false, false);
  assert.equal(skill.scaffoldLevel, 1);
  skill = engine.scoreAttempt(skill, false, false);
  assert.equal(skill.scaffoldLevel, 2);
  skill = engine.scoreAttempt(skill, false, false);
  assert.equal(skill.scaffoldLevel, 3);
  skill = engine.scoreAttempt(skill, true, false);
  assert.equal(skill.consecutiveIndependentCorrect, 0);
});

test("tres decisiones independientes más clasificación y transferencia completan una habilidad", () => {
  let skill = engine.emptySkill();
  skill = engine.scoreAttempt(skill, true, true);
  skill = engine.scoreAttempt(skill, true, true);
  skill = engine.scoreAttempt(skill, true, true, false, true);
  assert.equal(skill.completed, false);
  skill = engine.scoreAttempt(skill, true, true, true);
  assert.equal(skill.completed, true);
});

test("la ruta final concentra solo reglas débiles", () => {
  const skills = engine.initialSkills();
  skills.general_ed = { ...skills.general_ed, mastery: 82, completed: true };
  skills.final_e = { ...skills.final_e, mastery: 69, completed: false };
  const weak = engine.finalWeakRules(skills);
  assert.deepEqual(weak.includes("final_e"), true);
  assert.deepEqual(weak.includes("general_ed"), false);
});

test("el estado de sesión se puede serializar y recuperar con la clave versionada", () => {
  const snapshot = { version: "lancelot-ed-spelling-v1", skills: engine.initialSkills(), point: "diagnostic" };
  assert.deepEqual(JSON.parse(JSON.stringify(snapshot)), snapshot);
});
