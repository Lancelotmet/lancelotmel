"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { FINAL_IDS, RULE_ORDER, RULES, RuleId, verbById, VerbItem, verbsForRule } from "@/lib/spelling-lab/content";
import { AttemptRecord, diagnosticRoute, emptySkill, finalWeakRules, globalMastery, initialSkills, isCorrectPast, normalizeAnswer, scoreAttempt, SkillState } from "@/lib/spelling-lab/engine";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { saveLearnerProgress } from "@/lib/portal/learner-progress-client";

const STORAGE_KEY = "lancelot-ed-spelling-v1";
type Screen = "intro" | "diagnostic" | "unit" | "final" | "complete";
type Stage = "attempt" | "observe" | "compare" | "discover" | "rule" | "apply" | "transfer" | "model";
type Session = { name: string; screen: Screen; diagnosticIndex: number; route: RuleId[]; unitIndex: number; stage: Stage; applyIndex: number; currentVerbId: string; errors: number; skills: Record<RuleId, SkillState>; history: AttemptRecord[]; finalIndex: number; finalCorrect: number; finalExplanations: number; usedHints: number; startedAt: number };
type ProgressSaveState = "saving" | "saved" | "local";

const diagnostic = ["work", "live", "study", "play", "stop", "fix", "plan", "wash"];
const labels: Record<RuleId, string> = { general_ed: "ADD -ED", final_e: "ADD -D", consonant_y: "CHANGE Y TO I + ED", vowel_y: "KEEP Y + ED", cvc_double: "DOUBLE FINAL CONSONANT + ED", do_not_double: "ADD -ED (NO DOUBLE)" };

function newSession(): Session {
  return { name: "", screen: "intro", diagnosticIndex: 0, route: [], unitIndex: 0, stage: "attempt", applyIndex: 0, currentVerbId: "work", errors: 0, skills: initialSkills(), history: [], finalIndex: 0, finalCorrect: 0, finalExplanations: 0, usedHints: 0, startedAt: Date.now() };
}

function firstVerb(rule: RuleId, offset = 0) { return verbsForRule(rule)[offset % verbsForRule(rule).length]; }

function commonWrong(verb: VerbItem) {
  if (verb.ruleId === "final_e") return `${verb.base}ed`;
  if (verb.ruleId === "consonant_y") return `${verb.base}ed`;
  if (verb.ruleId === "vowel_y") return `${verb.base.slice(0, -1)}ied`;
  if (verb.ruleId === "cvc_double") return `${verb.base}ed`;
  if (verb.base === "fix") return "fixxed";
  if (verb.base === "rain") return "rainned";
  return `${verb.base}d`;
}

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Session>;
  return typeof candidate.screen === "string" && typeof candidate.currentVerbId === "string" && Array.isArray(candidate.route) && Boolean(candidate.skills) && Array.isArray(candidate.history);
}

export function SpellingLab({ learnerName, learnerEmail, savedProgress }: { learnerName: string; learnerEmail: string; savedProgress: unknown }) {
  const [session, setSession] = useState<Session>(newSession);
  const [loaded, setLoaded] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [saveState, setSaveState] = useState<ProgressSaveState>("saving");
  const cloudProgress = useRef(savedProgress);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const remote = cloudProgress.current;
    if (isSession(remote)) setSession(remote);
    else if (stored) {
      try { const local = JSON.parse(stored); if (isSession(local)) setSession(local); else window.localStorage.removeItem(STORAGE_KEY); } catch { window.localStorage.removeItem(STORAGE_KEY); }
    } else setSession((current) => ({ ...current, name: learnerName }));
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setSaveState("saving");
    const timer = window.setTimeout(async () => {
      try {
        await saveLearnerProgress("spelling_lab", session);
        setSaveState("saved");
      } catch {
        setSaveState("local");
      }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [loaded, session]);
  useEffect(() => { setAnswer(""); setFeedback(""); }, [session.currentVerbId, session.stage, session.finalIndex]);

  const activeRule = session.route[session.unitIndex] || "general_ed";
  const activeVerb = verbById(session.currentVerbId);
  const progress = session.screen === "diagnostic" ? (session.diagnosticIndex / diagnostic.length) * 18 : session.screen === "unit" ? 18 + ((session.unitIndex + stageWeight(session.stage)) / Math.max(session.route.length, 1)) * 62 : session.screen === "final" ? 80 + (session.finalIndex / finalTasks().length) * 20 : 100;

  function updateSkill(ruleId: RuleId, correct: boolean, independent: boolean, phase: string, flags?: { transfer?: boolean; classification?: boolean }) {
    setSession((current) => {
      const skill = scoreAttempt(current.skills[ruleId], correct, independent, flags?.transfer, flags?.classification);
      return { ...current, skills: { ...current.skills, [ruleId]: skill }, history: [...current.history, { verbId: current.currentVerbId, ruleId, answer, correct, independent, phase, at: Date.now() }] };
    });
  }

  function beginDiagnostic() { setSession((current) => ({ ...current, screen: "diagnostic", currentVerbId: diagnostic[0], stage: "attempt" })); }

  async function signOut() {
    try { await createSupabaseBrowserClient().auth.signOut(); } finally { window.location.assign("/"); }
  }

  function submitDiagnostic(event: FormEvent) {
    event.preventDefault();
    const verb = verbById(diagnostic[session.diagnosticIndex]);
    const correct = isCorrectPast(verb.id, answer);
    updateSkill(verb.ruleId, correct, true, "diagnostic");
    const nextIndex = session.diagnosticIndex + 1;
    if (nextIndex >= diagnostic.length) {
      const nextSkills = { ...session.skills, [verb.ruleId]: scoreAttempt(session.skills[verb.ruleId], correct, true) };
      const route = diagnosticRoute(nextSkills);
      setSession((current) => ({ ...current, skills: nextSkills, screen: "unit", route, unitIndex: 0, stage: "attempt", applyIndex: 0, currentVerbId: firstVerb(route[0]).id, errors: 0 }));
      setFeedback("Ya sé qué reglas dominas y cuáles vamos a descubrir juntos.");
      return;
    }
    setSession((current) => ({ ...current, diagnosticIndex: nextIndex, currentVerbId: diagnostic[nextIndex], errors: 0 }));
    setFeedback(correct ? `Registré cómo resolviste ${verb.base.toUpperCase()}. Seguimos observando.` : "Registré tu decisión. Aún no vamos a explicar la regla.");
  }

  function finishUnit() {
    const nextUnit = session.unitIndex + 1;
    if (nextUnit >= session.route.length) {
      setSession((current) => ({ ...current, screen: "final", finalIndex: 0, finalCorrect: 0, finalExplanations: 0 }));
      return;
    }
    const rule = session.route[nextUnit];
    setSession((current) => ({ ...current, unitIndex: nextUnit, stage: "attempt", applyIndex: 0, currentVerbId: firstVerb(rule).id, errors: 0 }));
  }

  function submitSpelling(event: FormEvent) {
    event.preventDefault();
    const correct = isCorrectPast(activeVerb.id, answer);
    const independent = session.errors === 0 && session.stage !== "model";
    if (correct) {
      const isTransfer = session.stage === "transfer";
      updateSkill(activeRule, true, independent, session.stage, { transfer: isTransfer });
      if (session.stage === "attempt") { setSession((current) => ({ ...current, stage: "observe", errors: 0 })); setFeedback(`Tu forma funciona. Antes de nombrar la regla, observa qué ocurrió con las letras.`); return; }
      if (session.stage === "apply") {
        const next = session.applyIndex + 1;
        if (next >= 3) { setSession((current) => ({ ...current, stage: "transfer", applyIndex: next, currentVerbId: firstVerb(activeRule, 4).id, errors: 0 })); setFeedback(activeVerb.explanation); return; }
        setSession((current) => ({ ...current, applyIndex: next, currentVerbId: firstVerb(activeRule, next + 1).id, errors: 0 })); setFeedback(activeVerb.explanation); return;
      }
      if (session.stage === "transfer") { setFeedback(activeVerb.explanation); finishUnit(); return; }
    }
    updateSkill(activeRule, false, false, session.stage);
    const errors = session.errors + 1;
    if (errors === 1) { setSession((current) => ({ ...current, errors })); setFeedback(activeVerb.hints[0]); return; }
    if (errors === 2) { setSession((current) => ({ ...current, errors })); setFeedback(`${activeVerb.hints[1]} Ahora compara dos posibilidades.`); return; }
    setSession((current) => ({ ...current, errors, stage: "model", usedHints: current.usedHints + 1 }));
    setFeedback("Vamos a mirar un ejemplo paralelo resuelto. Esta ayuda no cuenta como dominio; después aplicarás la idea en un verbo nuevo.");
  }

  function chooseHypothesis(index: number) {
    const correct = correctHypothesis(activeRule, index);
    updateSkill(activeRule, correct, true, "discover", { classification: true });
    if (correct) { setFeedback("Tu hipótesis explica el patrón que acabas de observar."); setSession((current) => ({ ...current, stage: "rule", errors: 0 })); }
    else { setFeedback("Vuelve a comparar las letras destacadas. La respuesta está en lo que cambia —o no cambia—."); }
  }

  function continueModel() {
    const parallel = firstVerb(activeRule, Math.min(session.applyIndex + 3, verbsForRule(activeRule).length - 1));
    setSession((current) => ({ ...current, currentVerbId: parallel.id, stage: session.applyIndex ? "apply" : "attempt", errors: 0 }));
  }

  function submitFinal(value: string) {
    const task = finalTasks()[session.finalIndex];
    const correct = finalAnswer(task, value);
    const verb = task.verbId ? verbById(task.verbId) : undefined;
    if (verb) updateSkill(verb.ruleId, correct, true, "final", { transfer: task.kind === "sentence", classification: task.kind === "classify" });
    const next = session.finalIndex + 1;
    setSession((current) => ({ ...current, finalIndex: next, finalCorrect: current.finalCorrect + (correct ? 1 : 0), finalExplanations: current.finalExplanations + (correct && task.kind === "explain" ? 1 : 0) }));
    setFeedback(correct ? "La decisión encaja con las letras del verbo." : task.feedback);
    if (next >= finalTasks().length) setSession((current) => ({ ...current, screen: "complete", finalIndex: next, finalCorrect: current.finalCorrect + (correct ? 1 : 0), finalExplanations: current.finalExplanations + (correct && task.kind === "explain" ? 1 : 0) }));
  }

  if (!loaded) return <main className="spelling-lab"><p className="lab-loading">Abriendo la edición…</p></main>;
  return <main className="spelling-lab">
    <header className="lab-nav"><Link href="/portal" className="lab-return">← Catálogo</Link><div className="lab-brand"><BrandCrown /><strong>LANCELOT</strong><small>THE SMALL TRIP · SPELLING</small></div><div className="lab-account"><span title={learnerEmail}><b>{learnerName}</b><small>{saveState === "saving" ? "Guardando progreso…" : saveState === "saved" ? "Progreso guardado" : "Guardado en este dispositivo"}</small></span><button className="lab-signout" onClick={signOut} type="button">Salir</button><button className="lab-reset" onClick={() => setResetOpen(true)} type="button">Reiniciar edición</button></div></header>
    <div className="lab-progress" aria-label={`Progreso ${Math.round(progress)}%`}><span style={{ width: `${Math.max(4, progress)}%` }} /></div>
    {session.screen !== "intro" && <div className="lab-edition-strip" aria-hidden="true"><span>THE SMALL TRIP</span><b>ISSUE 01</b><span>SPELLING STUDIO</span></div>}
    {session.screen === "intro" && <Intro name={session.name} onName={(name) => setSession((current) => ({ ...current, name }))} onBegin={beginDiagnostic} />}
    {session.screen === "diagnostic" && <Diagnostic verb={verbById(diagnostic[session.diagnosticIndex])} index={session.diagnosticIndex} answer={answer} onAnswer={setAnswer} onSubmit={submitDiagnostic} />}
    {session.screen === "unit" && <Unit rule={activeRule} verb={activeVerb} stage={session.stage} errors={session.errors} answer={answer} feedback={feedback} onAnswer={setAnswer} onSubmit={submitSpelling} onHypothesis={chooseHypothesis} onNext={(stage) => setSession((current) => ({ ...current, stage }))} onModel={continueModel} />}
    {session.screen === "final" && <FinalChallenge task={finalTasks()[session.finalIndex]} index={session.finalIndex} total={finalTasks().length} onAnswer={submitFinal} feedback={feedback} />}
    {session.screen === "complete" && <Completion session={session} onWeak={() => { const weak = finalWeakRules(session.skills); const rule = weak[0] || "cvc_double"; setSession((current) => ({ ...current, screen: "unit", route: weak.length ? weak : [rule], unitIndex: 0, stage: "attempt", currentVerbId: firstVerb(rule).id, applyIndex: 0, errors: 0 })); }} onFinal={() => setSession((current) => ({ ...current, screen: "final", finalIndex: 0, finalCorrect: 0, finalExplanations: 0 }))} onNew={() => setSession((current) => ({ ...newSession(), name: learnerName }))} />}
    {feedback && <p className="lab-feedback" aria-live="polite">{feedback}</p>}
    {resetOpen && <div className="lab-modal" role="dialog" aria-modal="true" aria-label="Reiniciar edición"><div><p className="lab-kicker">Confirmación</p><h2>¿Reiniciar esta edición?</h2><p>Se eliminará únicamente el progreso de Spelling Lab guardado en este navegador.</p><div><button onClick={() => setResetOpen(false)} type="button">Conservar mi progreso</button><button className="lab-solid" onClick={() => { window.localStorage.removeItem(STORAGE_KEY); setSession(newSession()); setResetOpen(false); }} type="button">Sí, reiniciar</button></div></div></div>}
  </main>;
}

function BrandCrown() { return <svg className="lab-crown" viewBox="0 0 72 40" aria-hidden="true"><path d="M7 30 3 10l16 10L27 4l9 16L45 4l8 16 16-10-4 20H7Z" /><path d="M11 35h50" /></svg>; }

function Intro({ name, onName, onBegin }: { name: string; onName: (value: string) => void; onBegin: () => void }) { return <section className="lab-cover"><div className="lab-cover-grid"><div className="lab-cover-copy"><p className="lab-kicker">Edición interactiva · A2</p><h1>Spelling Lab:<br /><em>Regular Past -ed</em></h1><p>Descubre qué cambia cuando agregamos <b>-ed</b>. No memorices una lista: toma decisiones, compara letras y deja que la siguiente escena responda a lo que necesitas practicar.</p><label>Tu nombre <span>(opcional)</span><input value={name} onChange={(event) => onName(event.target.value)} placeholder="¿Cómo quieres que te llamemos?" autoCapitalize="words" /></label><button className="lab-solid lab-start" onClick={onBegin} type="button">Comenzar <span>→</span></button><small>Una edición del bloque <strong>The Small Trip</strong> · Spelling</small></div><aside className="lab-cover-poster" aria-label="Portada de la edición Spelling Lab"><div className="lab-poster-top"><span>THE SMALL TRIP</span><b>ISSUE 01</b></div><BrandCrown /><p>REGULAR PAST</p><strong>-ed</strong><div className="lab-poster-word"><span>plan</span><i>→</i><b>planned</b></div><div className="lab-poster-tags"><span>OBSERVA</span><span>ELIGE</span><span>APLICA</span></div></aside></div></section>; }

function Diagnostic({ verb, index, answer, onAnswer, onSubmit }: { verb: VerbItem; index: number; answer: string; onAnswer: (value: string) => void; onSubmit: (event: FormEvent) => void }) { return <section className="lab-stage lab-diagnostic"><div className="lab-diagnostic-deck" aria-label={`Decisión ${index + 1} de ${diagnostic.length}`}><span>DIAGNÓSTICO</span><strong>{String(index + 1).padStart(2, "0")}</strong><div>{diagnostic.map((item, itemIndex) => <i className={itemIndex <= index ? "is-seen" : ""} key={item} />)}</div></div><p className="lab-kicker">Entrada privada · decisión {index + 1} de {diagnostic.length}</p><h1>Antes de explicarte algo, quiero ver cómo decides.</h1><p className="lab-prompt">{verb.sentence || `${verb.base} → ?`}</p><AnswerForm answer={answer} onAnswer={onAnswer} onSubmit={onSubmit} action="Registrar mi forma" /><p className="lab-note">No hay nota numérica. Solo estamos leyendo tu punto de partida.</p></section>; }

function Unit({ rule, verb, stage, errors, answer, feedback, onAnswer, onSubmit, onHypothesis, onNext, onModel }: { rule: RuleId; verb: VerbItem; stage: Stage; errors: number; answer: string; feedback: string; onAnswer: (value: string) => void; onSubmit: (event: FormEvent) => void; onHypothesis: (index: number) => void; onNext: (stage: Stage) => void; onModel: () => void }) {
  const meta = RULES[rule];
  const journey = <LessonRoute stage={stage} />;
  if (stage === "observe") return <section className="lab-stage">{journey}<p className="lab-kicker">Observa · {meta.title}</p><h1>No mires una respuesta: <em>mira un patrón.</em></h1><WordObservations items={meta.observe} rule={rule} /><button className="lab-solid" onClick={() => onNext("compare")} type="button">Comparar letras →</button></section>;
  if (stage === "compare") return <section className="lab-stage">{journey}<p className="lab-kicker">Compara</p><h1>{meta.discovery}</h1><CompareRule rule={rule} onContinue={() => onNext("discover")} /></section>;
  if (stage === "discover") return <section className="lab-stage">{journey}<p className="lab-kicker">Descubre</p><h1>Elige la hipótesis que explica lo que viste.</h1><div className="lab-hypotheses">{meta.hypothesis.map((item, index) => <button key={item} onClick={() => onHypothesis(index)} type="button"><span>{String.fromCharCode(65 + index)}</span>{item}</button>)}</div></section>;
  if (stage === "rule") return <section className="lab-stage lab-rule-reveal">{journey}<p className="lab-kicker">Norma rápida</p><h1>{meta.shortRule}</h1><p>La regla apareció después de tu intento, observación y comparación. Ahora puedes usarla en verbos nuevos.</p><button className="lab-solid" onClick={() => onNext("apply")} type="button">Aplicar en otra escena →</button></section>;
  if (stage === "model") { const example = firstVerb(rule, 1); return <section className="lab-stage lab-model">{journey}<p className="lab-kicker">Ejemplo paralelo resuelto</p><h1>Observa el cambio, sin prisa.</h1><WordBuild verb={example} /><p>{example.explanation}</p><button className="lab-solid" onClick={onModel} type="button">Probar con un verbo nuevo →</button></section>; }
  const mode = stage === "transfer" ? "Transfiere" : stage === "apply" ? "Aplica" : "Intenta";
  return <section className="lab-stage">{journey}<p className="lab-kicker">{mode} · {meta.title}</p><h1>{stage === "transfer" ? (verb.sentence || `Lleva ${verb.base} a una oración.`) : verb.sentence || `${verb.base} → ?`}</h1>{errors > 0 && <Scaffold verb={verb} level={errors} onPick={onAnswer} />}<AnswerForm answer={answer} onAnswer={onAnswer} onSubmit={onSubmit} action={stage === "transfer" ? "Cerrar esta escena" : "Ver mi decisión"} /><p className="lab-note">{stage === "apply" ? "Cada verbo nuevo te permite confirmar la regla sin repetir la misma escena." : "Una sola decisión a la vez."}</p>{feedback && <p className="lab-inline-feedback" aria-live="polite">{feedback}</p>}</section>;
}

function LessonRoute({ stage }: { stage: Stage }) { const stages: { id: Stage; label: string }[] = [{ id: "attempt", label: "Intenta" }, { id: "observe", label: "Observa" }, { id: "compare", label: "Compara" }, { id: "discover", label: "Descubre" }, { id: "rule", label: "Norma" }, { id: "apply", label: "Aplica" }, { id: "transfer", label: "Transfiere" }]; const current = stage === "model" ? 5 : Math.max(0, stages.findIndex((item) => item.id === stage)); return <ol className="lab-lesson-route" aria-label="Recorrido de descubrimiento">{stages.map((item, index) => <li className={index < current ? "is-done" : index === current ? "is-current" : ""} key={item.id}><i>{index < current ? "✓" : String(index + 1).padStart(2, "0")}</i><span>{item.label}</span></li>)}</ol>; }

function Scaffold({ verb, level, onPick }: { verb: VerbItem; level: number; onPick: (value: string) => void }) { if (level === 1) return <aside className="lab-scaffold level-one"><strong>Una pista para observar</strong><p>{verb.hints[0]}</p></aside>; if (level === 2) return <aside className="lab-scaffold"><strong>Compara dos formas posibles</strong><div>{[verb.past, commonWrong(verb)].sort().map((option) => <button key={option} onClick={() => onPick(option)} type="button">{option}</button>)}</div><p>{verb.hints[1]}</p></aside>; return null; }

function AnswerForm({ answer, onAnswer, onSubmit, action }: { answer: string; onAnswer: (value: string) => void; onSubmit: (event: FormEvent) => void; action: string }) { return <form className="lab-answer" onSubmit={onSubmit}><label htmlFor="past-form">Forma en pasado</label><div><input autoCapitalize="off" autoComplete="off" id="past-form" onChange={(event) => onAnswer(event.target.value)} placeholder="Escribe la forma" spellCheck={false} value={answer} /><button className="lab-solid" type="submit">{action} →</button></div></form>; }

function WordObservations({ items, rule }: { items: string[]; rule: RuleId }) { return <div className="lab-observations">{items.map((item) => { const [base, past] = item.split(" → "); return <article key={item}><span>{base}</span><b>→</b><strong>{highlightPast(base, past, rule)}</strong></article>; })}</div>; }
function highlightPast(base: string, past: string, rule: RuleId) { if (rule === "final_e") return <>{base}<em>d</em></>; if (rule === "consonant_y") return <>{base.slice(0, -1)}<del>y</del><em>i</em><em>ed</em></>; if (rule === "cvc_double") return <>{base}<em>{base.at(-1)}</em><em>ed</em></>; return <>{base}<em>{past.slice(base.length)}</em></>; }
function WordBuild({ verb }: { verb: VerbItem }) { return <div className="lab-word-build"><span>{verb.base}</span><b>→</b><strong>{highlightPast(verb.base, verb.past, verb.ruleId)}</strong></div>; }
function CompareRule({ rule, onContinue }: { rule: RuleId; onContinue: () => void }) { const pairs: Record<RuleId, [string, string]> = { general_ed: ["help → helped", "watch → watched"], final_e: ["live → lived", "dance → danced"], consonant_y: ["study → studied", "play → played"], vowel_y: ["play → played", "study → studied"], cvc_double: ["stop → stopped", "cook → cooked"], do_not_double: ["stop → stopped", "fix → fixed"] }; return <div className="lab-compare"><div><span>Observa estas dos escenas</span><strong>{pairs[rule][0]}</strong><strong>{pairs[rule][1]}</strong></div><button className="lab-solid" onClick={onContinue} type="button">Formar una hipótesis →</button></div>; }
function correctHypothesis(rule: RuleId, index: number) { return ({ general_ed: 1, final_e: 1, consonant_y: 1, vowel_y: 0, cvc_double: 1, do_not_double: 1 } as Record<RuleId, number>)[rule] === index; }
function stageWeight(stage: Stage) { return ({ attempt: .08, observe: .2, compare: .34, discover: .48, rule: .58, apply: .72, transfer: .9, model: .63 } as Record<Stage, number>)[stage]; }

type FinalTask = { kind: "classify" | "spell" | "sentence" | "correct" | "explain"; verbId?: string; prompt: string; answer: string; feedback: string; options?: string[] };
function finalTasks(): FinalTask[] { const classification = FINAL_IDS.map((id) => ({ kind: "classify" as const, verbId: id, prompt: `¿Cómo clasificarías ${verbById(id).base.toUpperCase()} antes de escribir el pasado?`, answer: labels[verbById(id).ruleId], feedback: `Vuelve a mirar el final de ${verbById(id).base.toUpperCase()}.` })); const spell = ["study", "dance", "stop", "enjoy", "fix", "close"].map((id) => ({ kind: "spell" as const, verbId: id, prompt: verbById(id).sentence || `${id} → ?`, answer: verbById(id).past, feedback: verbById(id).explanation })); const corrections = [["live", "liveed"], ["study", "studyed"], ["play", "plaied"], ["stop", "stoped"], ["fix", "fixxed"], ["rain", "rainned"]].map(([id, wrong]) => ({ kind: "correct" as const, verbId: id, prompt: `Corrige esta forma: ${wrong}`, answer: verbById(id).past, feedback: verbById(id).explanation })); const explain = ["study", "stop"].map((id) => ({ kind: "explain" as const, verbId: id, prompt: `¿Qué cambio necesita ${verbById(id).base.toUpperCase()}?`, answer: labels[verbById(id).ruleId], feedback: verbById(id).explanation })); return [...classification, ...spell, ...corrections, ...explain]; }
function finalAnswer(task: FinalTask, value: string) { return task.kind === "spell" || task.kind === "correct" ? normalizeAnswer(task.answer) === normalizeAnswer(value) : task.answer === value; }
function FinalChallenge({ task, index, total, onAnswer, feedback }: { task: FinalTask; index: number; total: number; onAnswer: (value: string) => void; feedback: string }) { const [value, setValue] = useState(""); useEffect(() => setValue(""), [index]); const choices = task.kind === "classify" || task.kind === "explain" ? Object.values(labels) : []; return <section className="lab-stage lab-final"><div className="lab-final-deck"><div><span>THE SMALL TRIP</span><strong>FINAL CUT</strong></div><b>{String(index + 1).padStart(2, "0")}<small>/{String(total).padStart(2, "0")}</small></b></div><p className="lab-kicker">Reto editorial · escena {index + 1} de {total}</p><h1>{task.prompt}</h1>{choices.length ? <div className="lab-hypotheses compact">{choices.map((choice) => <button key={choice} onClick={() => onAnswer(choice)} type="button">{choice}</button>)}</div> : <AnswerForm answer={value} onAnswer={setValue} onSubmit={(event) => { event.preventDefault(); onAnswer(value); }} action="Confirmar decisión" />}<p className="lab-note">{task.kind === "classify" ? "Clasifica antes de escribir: decidir la regla también es aprender." : "El reto mezcla escenas; no sigue el orden de una clase tradicional."}</p>{feedback && <p className="lab-inline-feedback" aria-live="polite">{feedback}</p>}</section>; }
function Completion({ session, onWeak, onFinal, onNew }: { session: Session; onWeak: () => void; onFinal: () => void; onNew: () => void }) { const mastery = globalMastery(session.skills); const weak = finalWeakRules(session.skills); const strongest = [...RULE_ORDER].sort((a, b) => session.skills[b].mastery - session.skills[a].mastery)[0]; const finalScore = Math.round((session.finalCorrect / finalTasks().length) * 100); const independent = session.history.filter((item) => item.independent && item.correct).length; return <section className="lab-cover lab-complete"><div className="lab-completion-seal"><BrandCrown /><span>EDICIÓN COMPLETADA</span></div><p className="lab-kicker">Cierre de la edición</p><h1>{session.name ? `${session.name}, ` : ""}ahora decides con más claridad.</h1><div className="lab-metrics"><article><strong>{mastery}%</strong><span>dominio global</span></article><article><strong>{finalScore}%</strong><span>reto final</span></article><article><strong>{independent}</strong><span>decisiones independientes</span></article></div><div className="lab-summary"><p><b>Regla más fuerte:</b> {RULES[strongest].title}.</p><p><b>Errores que ya sabes corregir:</b> {RULE_ORDER.filter((rule) => session.skills[rule].mastery >= 70).map((rule) => RULES[rule].title).join(" · ") || "estás construyendo el patrón"}.</p><p><b>Recomendación:</b> {weak.length ? `vuelve a ${RULES[weak[0]].title} con una micropráctica situada.` : "elige otro bloque del catálogo y lleva estas decisiones a una nueva historia."}</p></div><div className="lab-actions"><button className="lab-solid" onClick={onWeak} type="button">Practicar mi regla más débil</button><button onClick={onFinal} type="button">Repetir reto final</button><button onClick={onNew} type="button">Comenzar una nueva sesión</button></div></section>; }
