"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ARCHIVE_MISSIONS, ARCHIVE_CAPSULE_ID, ArchiveMission, archiveFeedback } from "@/lib/grammar/archive-before-midnight";
import { archiveGame, completeArchiveGame, moveArchiveMission, recordArchiveAttempt, recordArchiveHint, restartArchiveGame, startArchiveGame } from "@/lib/grammar/archive-engine";
import { emptyGrammarProgress, isGrammarAnswerCorrect, isGrammarProgress, recordGrammarAttempt, startGrammarCapsule } from "@/lib/grammar/engine";
import { ARCHIVE_BEFORE_MIDNIGHT_CAPSULE } from "@/lib/grammar/curriculum";
import { GrammarProgress } from "@/lib/grammar/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { saveLearnerProgress } from "@/lib/portal/learner-progress-client";

const PROGRESS_KEY = "lancelot_grammar_play_v1";
type SaveState = "saving" | "saved" | "local";
type Props = { learnerName: string; learnerEmail: string; savedProgress: unknown };

function useArchiveProgress(savedProgress: unknown) {
  const [progress, setProgress] = useState<GrammarProgress>(() => isGrammarProgress(savedProgress) ? savedProgress : emptyGrammarProgress());
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const initialized = useRef(false);
  useEffect(() => {
    if (!isGrammarProgress(savedProgress) && !initialized.current) {
      initialized.current = true;
      try { const local = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? "null"); if (isGrammarProgress(local)) setProgress(local); } catch { /* remote profile remains the source of truth */ }
    }
  }, [savedProgress]);
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

function ArchiveHeader({ learnerName, learnerEmail, saveState }: { learnerName: string; learnerEmail: string; saveState: SaveState }) {
  async function signOut() { try { await createSupabaseBrowserClient().auth.signOut(); } finally { window.location.assign("/"); } }
  return <header className="grammar-nav archive-nav"><Link href="/portal" className="grammar-back">← Portal</Link><Link className="grammar-brand" href="/portal/grammar"><span aria-hidden="true">G</span><strong>GRAMMAR PLAY</strong><small>LANCELOT · MICRO STUDIO</small></Link><div className="grammar-account" title={learnerEmail}><span><b>{learnerName}</b><small>{saveState === "saving" ? "Guardando evidencia…" : saveState === "saved" ? "Progreso guardado" : "Respaldo local"}</small></span><button type="button" onClick={signOut}>Salir</button></div></header>;
}

function ArchiveMark({ scene }: { scene: string }) {
  if (scene === "seal") return <svg aria-hidden="true" className="archive-scene-mark" viewBox="0 0 120 120"><circle cx="60" cy="60" r="48" /><circle cx="60" cy="60" r="34" /><path d="M29 60h62M60 29v62M42 60a18 18 0 1 0 36 0" /></svg>;
  if (scene === "transmission") return <svg aria-hidden="true" className="archive-scene-mark" viewBox="0 0 120 120"><path d="M8 62h15l8-30 15 59 17-75 15 60 11-28h23" /><path d="M9 96h102" /></svg>;
  if (scene === "tunnel") return <svg aria-hidden="true" className="archive-scene-mark" viewBox="0 0 120 120"><path d="M16 103V38L60 12l44 26v65M37 103V59h46v44M60 12v91" /><circle cx="60" cy="79" r="7" /></svg>;
  if (scene === "interrogation") return <svg aria-hidden="true" className="archive-scene-mark" viewBox="0 0 120 120"><path d="M22 98V30h76v68H22ZM40 52h40M40 69h28" /><circle cx="86" cy="70" r="13" /></svg>;
  return <svg aria-hidden="true" className="archive-scene-mark" viewBox="0 0 120 120"><circle cx="60" cy="60" r="43" /><path d="M60 31v30l20 13M23 95h74" /><circle cx="60" cy="60" r="4" /></svg>;
}

function TokenBuilder({ tokens, onSubmit, disabled, requiredCount = 7 }: { tokens: string[]; onSubmit: (value: string) => void; disabled: boolean; requiredCount?: number }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const available = tokens.filter((token) => !chosen.includes(token));
  return <div className="archive-builder"><div className="archive-builder-answer" aria-live="polite">{chosen.length ? chosen.join(" ") : "Construye el informe con las fichas."}</div><div className="archive-token-bank">{available.map((token) => <button disabled={disabled} key={token} onClick={() => setChosen((items) => [...items, token])} type="button">{token}</button>)}</div><div className="archive-builder-actions"><button disabled={!chosen.length || disabled} onClick={() => setChosen((items) => items.slice(0, -1))} type="button">Deshacer</button><button className="archive-primary" disabled={chosen.length !== requiredCount || disabled} onClick={() => { onSubmit(chosen.join(" ")); setChosen([]); }} type="button">Sellar informe →</button></div></div>;
}

export function ArchiveBeforeMidnight({ learnerName, learnerEmail, savedProgress }: Props) {
  const { progress, setProgress, saveState } = useArchiveProgress(savedProgress);
  const game = archiveGame(progress);
  const [started, setStarted] = useState(game.status !== "not-started");
  const [variant, setVariant] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const currentIndex = game.currentMission;
  const mission = ARCHIVE_MISSIONS[currentIndex];
  const missionState = game.missions[mission?.id] ?? { attempts: 0, hintsUsed: 0, assisted: false, completed: false, selectedDistractors: [] };
  const errors = missionState.attempts;
  const assisted = variant || missionState.assisted;

  useEffect(() => { if (started) setProgress((current) => startGrammarCapsule(startArchiveGame(current), ARCHIVE_CAPSULE_ID)); }, [started, setProgress]);
  useEffect(() => { setVariant(false); setFeedback(""); }, [currentIndex]);

  function setHint(level: number) {
    setProgress((current) => recordArchiveHint(current, mission.id, level));
    setFeedback(mission.hints[level - 1]);
  }

  function validate(rawAnswer: string) {
    if (busy) return;
    const active = variant ? mission.variant : mission;
    const correct = isGrammarAnswerCorrect(rawAnswer, active.answer);
    const isFinal = currentIndex === ARCHIVE_MISSIONS.length - 1;
    setBusy(true);
    setProgress((current) => {
      const archived = recordArchiveAttempt(current, mission.id, rawAnswer, correct, variant || errors + 1 >= 3 || current.archiveGames?.[ARCHIVE_CAPSULE_ID]?.missions[mission.id]?.assisted === true);
      return recordGrammarAttempt(archived, ARCHIVE_BEFORE_MIDNIGHT_CAPSULE, correct, variant || errors > 0, correct && isFinal);
    });
    if (!correct) {
      const nextError = errors + 1;
      const nextFeedback = nextError === 1 ? mission.hints[0] : nextError === 2 ? mission.hints[1] : `${mission.parallelExample}`;
      setFeedback(nextFeedback || archiveFeedback(mission, rawAnswer));
      window.setTimeout(() => setBusy(false), 240);
      return;
    }
    setFeedback(variant ? `${mission.variant.example} Evidencia paralela validada.` : mission.correctFeedback);
    window.setTimeout(() => {
      if (isFinal) setProgress((current) => completeArchiveGame(current, !variant && errors === 0));
      else setProgress((current) => moveArchiveMission(current, currentIndex + 1));
      setBusy(false);
    }, 420);
  }

  function restart() {
    setProgress((current) => restartArchiveGame(current));
    setStarted(false); setVariant(false); setFeedback("");
  }

  if (!started) return <main className="grammar-play archive-game"><ArchiveHeader learnerName={learnerName} learnerEmail={learnerEmail} saveState={saveState} /><section className="archive-opening"><div className="archive-opening-copy"><p className="archive-case-number">CASE 00:47 · CENTRAL ARCHIVE</p><h1>The Archive<br /><em>Before Midnight</em></h1><p>Son las 00:47. El Archivo Central cerrará en seis minutos y alguien alteró la secuencia de accesos. No basta con saber qué ocurrió: necesitas descubrir qué había sucedido primero. Examina cada evidencia, reconstruye el orden y recupera la línea temporal antes de que la bóveda quede sellada.</p><button className="archive-primary archive-opening-cta" onClick={() => setStarted(true)} type="button">Abrir la primera evidencia <span>→</span></button></div><aside className="archive-opening-case"><ArchiveMark scene="alarm" /><span>06</span><strong>EVIDENCIAS<br />PENDIENTES</strong><small>Past Perfect vs Past Simple</small></aside></section></main>;

  if (game.completedAt) {
    const evidence = Object.values(game.missions).filter((item) => item.completed).length;
    const independent = Object.values(game.missions).filter((item) => item.completed && !item.assisted).length;
    const hints = Object.values(game.missions).reduce((sum, item) => sum + item.hintsUsed, 0);
    const independentTransfer = game.transferIndependent;
    return <main className="grammar-play archive-game"><ArchiveHeader learnerName={learnerName} learnerEmail={learnerEmail} saveState={saveState} /><section className="archive-eureka"><div className="archive-vault" aria-hidden="true"><span /><span /><b>⌁</b></div><p className="archive-case-number">ARCHIVE SEALED · 01:00</p><h1>Timeline restored</h1><p>No solo identificaste hechos pasados: demostraste cuál ya había ocurrido cuando apareció el siguiente. Esa es la función central del Past Perfect: convertir una lista de eventos en una secuencia precisa.</p><div className="archive-summary"><article><b>{evidence}/6</b><span>evidencias restauradas</span></article><article><b>{independent}</b><span>decisiones independientes</span></article><article><b>{hints}</b><span>ayudas utilizadas</span></article><article><b>{game.bestScore ?? 0}%</b><span>precisión independiente</span></article></div><p className="archive-recognition">{independentTransfer ? "Temporal Analyst — Independent" : "Temporal Analyst — Guided"}</p><p className="archive-next">Sigue con acciones en progreso e interrupciones para distinguir el fondo de la historia del evento que la cambia.</p><nav><button className="archive-primary" onClick={restart} type="button">Repetir con nuevas huellas</button><Link className="archive-secondary" href="/portal/grammar?level=B1">Seguir investigando</Link><Link className="archive-secondary" href="/portal/grammar">Volver a Grammar Play</Link></nav></section></main>;
  }

  const variantData = variant ? mission.variant : undefined;
  const dossiers = { A: "By the time the blackout had begun, Nora entered the tunnel.", B: "By the time the blackout began, Nora had entered the tunnel.", C: "By the time the blackout began, Nora has entered the tunnel." };
  return <main className={`grammar-play archive-game archive-scene-${mission.id}`}><ArchiveHeader learnerName={learnerName} learnerEmail={learnerEmail} saveState={saveState} /><section className="archive-player" aria-busy={busy}><Link className="grammar-player-return" href="/portal/grammar">← Volver a Grammar</Link><div className="archive-progress" aria-label={`Evidencia ${currentIndex + 1} de 6`}><span style={{ width: `${((currentIndex + 1) / 6) * 100}%` }} /><small>EVIDENCIA {String(currentIndex + 1).padStart(2, "0")} / 06</small></div><header className="archive-mission-head"><div><p className="archive-case-number">ARCHIVO CENTRAL · {mission.kind.toUpperCase()}</p><h1>{mission.title}</h1><p>{mission.scene}</p></div><ArchiveMark scene={mission.id} /></header><article className="archive-evidence"><header><span>ACCION DE INVESTIGACION</span><b>{currentIndex === 5 ? "TRANSFERENCIA" : "SECUENCIA"}</b></header><h2>{variantData?.prompt ?? mission.instruction}</h2>{mission.kind === "timeline" ? <TimelineDecision variant={variant} onAnswer={validate} disabled={busy} /> : mission.kind === "builder" ? <TokenBuilder tokens={variant ? mission.variant.tokens ?? [] : [...(mission.tokens ?? []), ...(mission.distractors ?? [])]} onSubmit={validate} disabled={busy} requiredCount={variant ? (mission.variant.tokens?.length ?? 0) : (mission.tokens?.length ?? 0)} /> : <div className={`archive-options ${mission.kind === "dossier" ? "archive-dossiers" : ""}`}>{(variantData?.options ?? mission.options ?? []).map((option) => <button disabled={busy} key={option} onClick={() => validate(option)} type="button">{mission.kind === "dossier" && !variant ? <><b>EXPEDIENTE {option}</b><span>{dossiers[option as keyof typeof dossiers]}</span></> : option}</button>)}</div>}</article>{errors > 0 && !variant ? <aside className={`archive-help level-${Math.min(errors, 3)}`} aria-live="polite"><strong>{errors === 1 ? "Pista de observación" : errors === 2 ? "Contraste de evidencia" : "Ejemplo paralelo"}</strong><p>{feedback}</p>{errors < 3 ? <button onClick={() => setHint(errors)} type="button">Ver pista {errors} →</button> : <button className="archive-primary" onClick={() => { setVariant(true); setFeedback(""); }} type="button">Probar variante equivalente →</button>}</aside> : null}{variant ? <aside className="archive-help level-3" aria-live="polite"><strong>Escena paralela</strong><p>{mission.parallelExample}</p><p>Ahora resuelve una evidencia nueva para recuperar esta sección.</p></aside> : null}{feedback && (errors === 0 || variant) ? <p className="archive-feedback" aria-live="polite">{feedback}</p> : null}{currentIndex === 0 && missionState.completed ? <aside className="archive-discovery"><p>Hallazgo temporal</p><strong><button type="button">had started</button> marca el hecho anterior; <button type="button">reached</button> fija el punto posterior de referencia.</strong><span>The alarm had started before Mara reached the archive.</span></aside> : null}</section></main>;
}

function TimelineDecision({ variant, onAnswer, disabled }: { variant: boolean; onAnswer: (value: string) => void; disabled: boolean }) {
  const [first, setFirst] = useState<"first" | "later" | "">("");
  const alarm = variant ? "The lights went out at 00:09." : "The alarm started at 00:15.";
  const mara = variant ? "The guard entered at 00:12." : "Mara reached the archive at 00:17.";
  return <div className="archive-timeline"><div className="archive-time-slots"><button aria-pressed={first === "first"} className={first === "first" ? "is-selected" : ""} disabled={disabled} onClick={() => setFirst("first")} type="button">HAPPENED FIRST</button><button aria-pressed={first === "later"} className={first === "later" ? "is-selected" : ""} disabled={disabled} onClick={() => setFirst("later")} type="button">HAPPENED LATER</button></div><div className="archive-event-cards"><button disabled={disabled || !first} onClick={() => onAnswer(first === "first" ? (variant ? "lights-first" : "alarm-first") : "mara-first")} type="button"><span>01</span>{alarm}</button><button disabled={disabled || !first} onClick={() => onAnswer(first === "first" ? "mara-first" : (variant ? "lights-first" : "alarm-first"))} type="button"><span>02</span>{mara}</button></div><p>Primero selecciona una zona; luego deposita la evidencia con teclado o toque.</p></div>;
}
