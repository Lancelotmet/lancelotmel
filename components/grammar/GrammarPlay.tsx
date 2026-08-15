"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { GRAMMAR_CAPSULES, GRAMMAR_LEVELS, GRAMMAR_SKILLS, capsuleBySlug, skillById } from "@/lib/grammar/curriculum";
import { emptyGrammarProgress, isGrammarAnswerCorrect, isGrammarProgress, moveGrammarCapsule, recommendedCapsules, recordGrammarAttempt, startGrammarCapsule } from "@/lib/grammar/engine";
import { CapsuleFormat, GrammarCapsule, GrammarInteraction, GrammarLevel, GrammarProgress } from "@/lib/grammar/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { saveLearnerProgress } from "@/lib/portal/learner-progress-client";
import { ArchiveBeforeMidnight } from "@/components/grammar/ArchiveBeforeMidnight";
import { ARCHIVE_SLUG } from "@/lib/grammar/archive-before-midnight";

const PROGRESS_KEY = "lancelot_grammar_play_v1";
type SaveState = "saving" | "saved" | "local";
type LearnerProps = { learnerName: string; learnerEmail: string; savedProgress: unknown };
const PORTAL_BLOCK_TO_GRAMMAR_BLOCK: Record<string, string> = {
  "a1-first-day": "first-day", "a1-coffee": "coffee-please", "a1-city": "city-signals", "a1-people": "people-around", "a1-weekend": "my-weekend",
  "a2-trip": "the-small-trip", "a2-home": "home-stories", "a2-health": "feeling-better",
  "b1-neighborhood": "the-neighborhood", "b1-change": "a-change-of-plan", "b1-screen": "behind-the-screen", "b1-table": "at-the-table", "b1-project": "the-project",
  "b2-ideas": "ideas-that-travel", "b2-voice": "your-point-of-view", "b2-future": "the-future-we-build", "b2-stories": "stories-we-inherit", "b2-room": "the-room-where-it-happens", "b2-impact": "make-it-matter",
  "advanced-accuracy": "advanced-accuracy"
};

function useGrammarProgress(savedProgress: unknown) {
  const remote = useRef(savedProgress);
  const [progress, setProgress] = useState<GrammarProgress>(() => {
    if (isGrammarProgress(savedProgress)) return savedProgress;
    if (typeof window === "undefined") return emptyGrammarProgress();
    try {
      const local = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? "null");
      return isGrammarProgress(local) ? local : emptyGrammarProgress();
    } catch { return emptyGrammarProgress(); }
  });
  const [saveState, setSaveState] = useState<SaveState>("saved");
  useEffect(() => {
    if (isGrammarProgress(remote.current)) setProgress(remote.current);
  }, []);
  useEffect(() => {
    setSaveState("saving");
    const timer = window.setTimeout(async () => {
      try {
        await saveLearnerProgress("grammar_play", progress);
        setSaveState("saved");
      } catch {
        window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
        setSaveState("local");
      }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [progress]);
  return { progress, setProgress, saveState };
}

function GrammarHeader({ learnerName, learnerEmail, saveState }: Pick<LearnerProps, "learnerName" | "learnerEmail"> & { saveState: SaveState }) {
  async function signOut() { try { await createSupabaseBrowserClient().auth.signOut(); } finally { window.location.assign("/"); } }
  return <header className="grammar-nav"><Link href="/portal" className="grammar-back">← Portal</Link><Link className="grammar-brand" href="/portal/grammar"><span aria-hidden="true">G</span><strong>GRAMMAR PLAY</strong><small>LANCELOT · MICRO STUDIO</small></Link><div className="grammar-account" title={learnerEmail}><span><b>{learnerName}</b><small>{saveState === "saving" ? "Guardando…" : saveState === "saved" ? "Progreso guardado" : "Respaldo local"}</small></span><button type="button" onClick={signOut}>Salir</button></div></header>;
}

function levelLabel(level: GrammarLevel) { return GRAMMAR_LEVELS.find((item) => item.id === level)?.title ?? level; }
function formatLabel(format: CapsuleFormat) { return ({ "quick-choice": "Elección rápida", "word-builder": "Construcción", "sentence-builder": "Construye", "sort-and-match": "Clasifica", "spot-the-error": "Detective", "repair-the-sentence": "Repara", "choose-the-rule": "Descubre", "contrast-battle": "Contraste", "grammar-detective": "Detective", "timeline-choice": "Línea de tiempo", "context-mission": "Misión", "mini-dialogue": "Diálogo", "transformation-sprint": "Transforma", "missing-word": "Completa", "ordering-challenge": "Ordena", "true-or-trap": "Trampa", "odd-one-out": "Diferencia", "guided-production": "Produce", "mixed-challenge": "Reto" } as Record<CapsuleFormat, string>)[format]; }

function CapsuleCard({ capsule, progress }: { capsule: GrammarCapsule; progress: GrammarProgress }) {
  const state = progress.capsules[capsule.id];
  const completed = state?.status === "completed";
  const started = state?.status === "in-progress";
  return <article className={`grammar-capsule-card grammar-card-${capsule.thumbnailVariant}`}>
    <div className="grammar-card-glow" aria-hidden="true" />
    <div className="grammar-card-meta"><span>{capsule.level}</span><small>{capsule.estimatedMinutes} min · {formatLabel(capsule.format)}</small></div>
    <div className="grammar-card-copy"><p>{capsule.learningFunction}</p><h3>{capsule.title}</h3><span>{capsule.subtitle}</span></div>
    <div className="grammar-card-footer"><b>{completed ? "Completada ✓" : started ? `Continuar · ${state.currentInteractionIndex + 1}/${capsule.interactionCount}` : `${capsule.interactionCount} decisiones`}</b><Link href={`/portal/grammar/capsule/${capsule.slug}`}>{completed ? "Revisar" : started ? "Continuar" : "Empezar"} <i aria-hidden="true">→</i></Link></div>
  </article>;
}

function Rail({ title, caption, capsules, progress }: { title: string; caption: string; capsules: GrammarCapsule[]; progress: GrammarProgress }) {
  if (!capsules.length) return null;
  return <section className="grammar-rail"><header><div><p className="grammar-kicker">Grammar Play</p><h2>{title}</h2></div><span>{caption}</span></header><div className="grammar-rail-track">{capsules.map((capsule) => <CapsuleCard key={capsule.id} capsule={capsule} progress={progress} />)}</div></section>;
}

export function GrammarCatalog({ learnerName, learnerEmail, savedProgress, initialLevel, block }: LearnerProps & { initialLevel?: GrammarLevel; block?: string }) {
  const { progress, saveState } = useGrammarProgress(savedProgress);
  const [level, setLevel] = useState<GrammarLevel | "ALL">(initialLevel ?? "ALL");
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<CapsuleFormat | "ALL">("ALL");
  const [status, setStatus] = useState<"ALL" | "IN_PROGRESS" | "NOT_STARTED" | "COMPLETED">("ALL");
  const grammarBlock = block ? PORTAL_BLOCK_TO_GRAMMAR_BLOCK[block] ?? block : undefined;
  const filtered = useMemo(() => GRAMMAR_CAPSULES.filter((capsule) => {
    const haystack = `${capsule.title} ${capsule.subtitle} ${capsule.tags.join(" ")} ${skillById(capsule.skillId)?.rule ?? ""}`.toLowerCase();
    const state = progress.capsules[capsule.id]?.status ?? "not-started";
    return (level === "ALL" || capsule.level === level) && (!grammarBlock || capsule.blockId === grammarBlock) && (format === "ALL" || capsule.format === format) && (status === "ALL" || (status === "IN_PROGRESS" && state === "in-progress") || (status === "COMPLETED" && state === "completed") || (status === "NOT_STARTED" && state === "not-started")) && (!query.trim() || haystack.includes(query.trim().toLowerCase()));
  }), [format, grammarBlock, level, progress.capsules, query, status]);
  const inProgress = GRAMMAR_CAPSULES.filter((capsule) => progress.capsules[capsule.id]?.status === "in-progress");
  const recommended = recommendedCapsules(GRAMMAR_CAPSULES.filter((capsule) => !grammarBlock || capsule.blockId === grammarBlock), progress);
  const chosenLevelCapsules = level === "ALL" ? [] : filtered.filter((capsule) => capsule.level === level);
  const completed = Object.values(progress.capsules).filter((item) => item.status === "completed").length;
  return <main className="grammar-play"><GrammarHeader learnerName={learnerName} learnerEmail={learnerEmail} saveState={saveState} /><section className="grammar-hero"><div><p className="grammar-kicker">Lancelot idiomas · Grammar</p><h1>Una regla.<br /><em>Una misión breve.</em></h1><p>Elige una píldora, toma decisiones reales y vuelve al mundo con una idea más clara. No hay cursos largos: hay escenas para practicar cuando las necesitas.</p><div className="grammar-hero-actions"><a href="#catalogo" className="grammar-button grammar-button-gold">Explorar Grammar <span>↓</span></a><span>{GRAMMAR_CAPSULES.length} microactividades · {completed} completadas</span></div></div><aside><span>02—06</span><strong>MINUTOS<br />POR MISIÓN</strong><p>Descubre · practica · corrige · transfiere</p></aside></section>
    <section className="grammar-level-switch" aria-label="Niveles de Grammar"><button className={level === "ALL" ? "is-active" : ""} onClick={() => setLevel("ALL")} type="button">Para ti</button>{GRAMMAR_LEVELS.map((item) => <button className={level === item.id ? "is-active" : ""} key={item.id} onClick={() => setLevel(item.id)} type="button"><b>{item.id}</b><span>{item.title}</span></button>)}</section>
    <section className="grammar-tools" id="catalogo"><label><span>Buscar una misión</span><input onChange={(event) => setQuery(event.target.value)} placeholder="Past, articles, conditionals…" value={query} /></label><label><span>Formato</span><select onChange={(event) => setFormat(event.target.value as CapsuleFormat | "ALL")} value={format}><option value="ALL">Todos los formatos</option>{[...new Set(GRAMMAR_CAPSULES.map((capsule) => capsule.format))].map((item) => <option key={item} value={item}>{formatLabel(item)}</option>)}</select></label><label><span>Estado</span><select onChange={(event) => setStatus(event.target.value as typeof status)} value={status}><option value="ALL">Todo el catálogo</option><option value="NOT_STARTED">Sin iniciar</option><option value="IN_PROGRESS">En progreso</option><option value="COMPLETED">Completadas</option></select></label></section>
    {query || format !== "ALL" || status !== "ALL" || level !== "ALL" || block ? <Rail title={level === "ALL" ? "Resultados para ti" : `${level} · ${levelLabel(level)}`} caption={`${filtered.length} píldoras disponibles`} capsules={filtered} progress={progress} /> : <><Rail title="Continuar practicando" caption="Vuelve justo donde quedó tu decisión." capsules={inProgress} progress={progress} /><Rail title="Recomendado para ti" caption="Alternamos práctica, contraste y corrección." capsules={recommended} progress={progress} /><Rail title="Nuevas en Grammar Play" caption="Misiones breves para abrir nuevas formas." capsules={GRAMMAR_CAPSULES.filter((capsule) => capsule.isNew)} progress={progress} />{GRAMMAR_LEVELS.map((item) => <Rail key={item.id} title={`${item.id} · ${item.title}`} caption={item.description} capsules={GRAMMAR_CAPSULES.filter((capsule) => capsule.level === item.id)} progress={progress} />)}</>}
    {!filtered.length && (query || format !== "ALL" || status !== "ALL") ? <section className="grammar-empty"><p className="grammar-kicker">Sin coincidencias</p><h2>Prueba otro término o abre una colección.</h2><button onClick={() => { setQuery(""); setFormat("ALL"); setStatus("ALL"); }} type="button">Limpiar filtros</button></section> : null}
  </main>;
}

function Ordering({ interaction, onAnswer }: { interaction: GrammarInteraction; onAnswer: (value: string) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const tokens = interaction.options ?? [];
  const available = tokens.filter((token, index) => !selected.some((selectedToken, selectedIndex) => selectedToken === token && selectedIndex === index));
  return <div className="grammar-ordering"><div className="grammar-order-answer" aria-live="polite">{selected.length ? selected.join(" ") : "Toca las fichas para construir la frase."}</div><div className="grammar-token-bank">{tokens.map((token, index) => <button disabled={selected.filter((item) => item === token).length > tokens.slice(0, index).filter((item) => item === token).length} key={`${token}-${index}`} onClick={() => setSelected((items) => [...items, token])} type="button">{token}</button>)}</div><div className="grammar-order-actions"><button onClick={() => setSelected((items) => items.slice(0, -1))} type="button">Deshacer</button><button onClick={() => { onAnswer(selected.join(" ")); setSelected([]); }} type="button">Comprobar orden →</button></div></div>;
}

function GenericGrammarCapsulePlayer({ learnerName, learnerEmail, savedProgress, slug }: LearnerProps & { slug: string }) {
  const capsule = capsuleBySlug(slug);
  const { progress, setProgress, saveState } = useGrammarProgress(savedProgress);
  const saved = capsule ? progress.capsules[capsule.id] : undefined;
  const [index, setIndex] = useState(saved?.currentInteractionIndex ?? 0);
  const [answer, setAnswer] = useState("");
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [complete, setComplete] = useState(saved?.status === "completed");
  useEffect(() => { if (capsule) setProgress((current) => startGrammarCapsule(current, capsule.id)); }, [capsule, setProgress]);
  useEffect(() => { if (saved?.status === "in-progress") setIndex(saved.currentInteractionIndex); }, [saved?.currentInteractionIndex, saved?.status]);
  useEffect(() => { setAnswer(""); setErrors(0); setFeedback(""); }, [index]);
  if (!capsule) return <main className="grammar-play"><GrammarHeader learnerName={learnerName} learnerEmail={learnerEmail} saveState={saveState} /><section className="grammar-empty"><h1>Esta misión no está disponible.</h1><Link href="/portal/grammar">Volver a Grammar</Link></section></main>;
  const activeCapsule = capsule;
  const interaction = activeCapsule.interactions[index];
  const skill = skillById(activeCapsule.skillId);
  function check(value: string) {
    const correct = isGrammarAnswerCorrect(value, interaction.answer, interaction.acceptedAnswers);
    if (!correct) { const nextErrors = errors + 1; setErrors(nextErrors); setFeedback(nextErrors === 1 ? interaction.hintSequence[0] : nextErrors === 2 ? interaction.hintSequence[1] : `${interaction.hintSequence[2]} ${interaction.workedExample ?? ""}`); setProgress((current) => recordGrammarAttempt(current, activeCapsule, false, nextErrors > 0, false)); return; }
    const isFinal = index === activeCapsule.interactions.length - 1;
    setFeedback(interaction.correctFeedback);
    setProgress((current) => recordGrammarAttempt(current, activeCapsule, true, errors > 0, isFinal));
    if (isFinal) window.setTimeout(() => setComplete(true), 500); else window.setTimeout(() => setIndex((current) => current + 1), 520);
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); check(answer); }
  if (complete) { const state = progress.capsules[capsule.id]; const score = Math.round(((state?.independentCorrect ?? 0) / Math.max(state?.attempts ?? 1, 1)) * 100); return <main className="grammar-play"><GrammarHeader learnerName={learnerName} learnerEmail={learnerEmail} saveState={saveState} /><section className="grammar-completion"><p className="grammar-kicker">Misión completada</p><h1>{capsule.title}</h1><p>{skill?.eureka}</p><div><article><strong>{score}%</strong><span>decisiones independientes</span></article><article><strong>{capsule.interactionCount}</strong><span>interacciones practicadas</span></article><article><strong>{capsule.level}</strong><span>nivel de la misión</span></article></div><p className="grammar-completion-note">{skill?.rule}</p><nav><Link className="grammar-button grammar-button-gold" href={`/portal/grammar/capsule/${GRAMMAR_CAPSULES.find((item) => item.skillId === capsule.skillId && item.id !== capsule.id)?.slug ?? capsule.slug}`}>Otra parecida →</Link><Link className="grammar-button" href="/portal/grammar">Volver a Grammar</Link></nav></section></main>; }
  return <main className="grammar-play"><GrammarHeader learnerName={learnerName} learnerEmail={learnerEmail} saveState={saveState} /><section className="grammar-player"><Link className="grammar-player-return" href="/portal/grammar">← Volver a Grammar</Link><div className="grammar-player-progress"><span style={{ width: `${((index + 1) / capsule.interactions.length) * 100}%` }} /><small>Decisión {index + 1} de {capsule.interactions.length}</small></div><p className="grammar-kicker">{capsule.level} · {capsule.blockTitle} · {formatLabel(capsule.format)}</p><h1>{capsule.title}</h1><p className="grammar-mission">{capsule.mission}</p><article className="grammar-interaction"><header><span>{capsule.learningFunction}</span><b>{capsule.estimatedMinutes} min</b></header><h2>{interaction.prompt}</h2><p>{interaction.instruction}</p>{interaction.type === "single-choice" ? <div className="grammar-options">{interaction.options?.map((option) => <button key={option} onClick={() => check(option)} type="button">{option}</button>)}</div> : interaction.type === "sentence-ordering" ? <Ordering interaction={interaction} onAnswer={check} /> : <form onSubmit={submit}><label htmlFor="grammar-answer">Tu decisión</label><div><input autoCapitalize="off" autoComplete="off" id="grammar-answer" onChange={(event) => setAnswer(event.target.value)} placeholder="Escribe la forma" spellCheck={false} value={answer} /><button className="grammar-button grammar-button-gold" type="submit">Comprobar →</button></div></form>}</article>{errors > 0 ? <aside className={`grammar-help help-${Math.min(errors, 3)}`} aria-live="polite"><strong>{errors === 1 ? "Pista para observar" : errors === 2 ? "Reduce la decisión" : "Ejemplo paralelo"}</strong><p>{feedback}</p>{errors >= 3 ? <button onClick={() => { const next = Math.min(capsule.interactions.length - 1, index + 1); setProgress((current) => moveGrammarCapsule(current, activeCapsule, next)); setIndex(next); }} type="button">Probar otra escena →</button> : null}</aside> : null}{feedback && errors === 0 ? <p className="grammar-feedback" aria-live="polite">{feedback}</p> : null}<aside className="grammar-eureka"><span>Eureka</span><p>{skill?.eureka}</p></aside></section></main>;
}

export function GrammarCapsulePlayer(props: LearnerProps & { slug: string }) {
  if (props.slug === ARCHIVE_SLUG) return <ArchiveBeforeMidnight {...props} />;
  return <GenericGrammarCapsulePlayer {...props} />;
}
