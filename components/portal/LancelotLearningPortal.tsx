"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  blocksForLevel,
  LEARNING_AREAS,
  LearningAreaId,
  PORTAL_LEVELS,
  PortalBlock,
  PortalLevel
} from "@/lib/portal-library";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type PortalProps = { learnerName: string; learnerEmail: string };

export function LancelotLearningPortal({ learnerName, learnerEmail }: PortalProps) {
  const [level, setLevel] = useState<PortalLevel>("A1");
  const [activeBlock, setActiveBlock] = useState<PortalBlock>(() => blocksForLevel("A1")[0]);
  const [area, setArea] = useState<LearningAreaId>("vocabulary");
  const [activity, setActivity] = useState(0);
  const [savedActivities, setSavedActivities] = useState<string[]>([]);
  const activeArea = LEARNING_AREAS.find((item) => item.id === area) ?? LEARNING_AREAS[0];
  const blocks = useMemo(() => blocksForLevel(level), [level]);

  function chooseLevel(nextLevel: PortalLevel) {
    setLevel(nextLevel);
    setActiveBlock(blocksForLevel(nextLevel)[0]);
    setArea("vocabulary");
    setActivity(0);
  }

  function chooseBlock(block: PortalBlock) {
    setActiveBlock(block);
    setArea("vocabulary");
    setActivity(0);
    document.getElementById("experiencia")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function signOut() {
    await createSupabaseBrowserClient().auth.signOut();
    window.location.assign("/");
  }

  const activityKey = `${activeBlock.id}-${area}-${activity}`;
  const reinforcementUrl = `/citas?encounterType=Clase&service=Refuerzo%20academico&context=${encodeURIComponent(activeBlock.title)}#reserva`;

  return (
    <main className="learning-portal">
      <header className="portal-nav">
        <Link className="portal-brand" href="/" aria-label="Volver a Lancelot">
          <img src="/brand/lancelot-logo-official.png" alt="Lancelot" />
        </Link>
        <nav aria-label="Navegación del portal">
          <a href="#catalogo">Explorar</a>
          <a href="#experiencia">Mi bloque</a>
          <Link href="/portal/grammar">Grammar Play</Link>
          <Link href="/citas">Agenda</Link>
        </nav>
        <div className="portal-account">
          <span>{learnerName}</span>
          <button type="button" onClick={signOut}>Salir</button>
        </div>
      </header>

      <section className="portal-hero">
        <div className="portal-hero-grid">
          <div>
            <p className="portal-kicker">Lancelot idiomas · {level}</p>
            <h1>No sigues una ruta.<br /><em>Encuentras una escena.</em></h1>
            <p>Elige el contexto que hoy te despierta curiosidad. Entra por donde tenga sentido para ti y practica con libertad.</p>
            <div className="portal-hero-actions">
              <a className="portal-button portal-button-gold" href="#catalogo">Explorar bloques <span>↓</span></a>
              <Link className="portal-button portal-button-quiet" href="/citas?encounterType=Clase&service=Refuerzo%20academico#reserva">Agendar refuerzo</Link>
            </div>
          </div>
          <aside className="portal-hero-note">
            <span className="portal-seal">L</span>
            <p>Desde el ser para el saber</p>
            <strong>Tu aprendizaje no necesita una fila. Necesita una razón para empezar.</strong>
          </aside>
        </div>
      </section>

      <section className="portal-levels" aria-label="Niveles de inglés">
        <div className="portal-section-heading">
          <p className="portal-kicker">Elige tu territorio</p>
          <h2>Cinco niveles. Ningún orden obligatorio.</h2>
        </div>
        <div className="portal-level-grid">
          {PORTAL_LEVELS.map((item) => (
            <button className={`portal-level-card ${level === item.id ? "is-active" : ""}`} key={item.id} onClick={() => chooseLevel(item.id)} type="button">
              <span>{item.id}</span>
              <strong>{item.title}</strong>
              <small>{item.description}</small>
              <b>Explorar →</b>
            </button>
          ))}
        </div>
      </section>

      <section className="portal-catalog" id="catalogo">
        <div className="portal-section-heading portal-catalog-heading">
          <div>
            <p className="portal-kicker">Catálogo por contexto · nivel {level}</p>
            <h2>¿Qué escena quieres habitar hoy?</h2>
          </div>
          <p>{PORTAL_LEVELS.find((item) => item.id === level)?.description}</p>
        </div>
        <div className="portal-block-grid">
          {blocks.map((block, index) => (
            <article className={`portal-block-card cover-${block.cover}`} key={block.id}>
              <div className="portal-block-shade" />
              <div className="portal-block-top"><span>{block.collection}</span><small>{String(index + 1).padStart(2, "0")}</small></div>
              <div className="portal-block-copy">
                <p>{block.atmosphere}</p>
                <h3>{block.title}</h3>
                <span>{block.subtitle}</span>
                <button type="button" onClick={() => chooseBlock(block)}>Entrar al bloque <b>→</b></button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="portal-experience" id="experiencia">
        <div className={`portal-feature-block cover-${activeBlock.cover}`}>
          <div className="portal-feature-shade" />
          <div className="portal-feature-content">
            <p className="portal-kicker">{activeBlock.level} · {activeBlock.collection}</p>
            <h2>{activeBlock.title}</h2>
            <h3>{activeBlock.subtitle}</h3>
            <p>{activeBlock.synopsis}</p>
            <div className="portal-focuses">{activeBlock.focus.map((focus) => <span key={focus}>{focus}</span>)}</div>
          </div>
        </div>

        <div className="portal-area-shell">
          <header>
            <p className="portal-kicker">Dentro del bloque</p>
            <h2>Elige cómo quieres entrar.</h2>
            <p>Cada puerta está disponible. Tu necesidad de hoy define la práctica.</p>
          </header>
          <div className="portal-area-tabs" role="tablist" aria-label="Áreas de aprendizaje">
            {LEARNING_AREAS.map((item) => (
              <button aria-selected={area === item.id} className={area === item.id ? "is-active" : ""} key={item.id} onClick={() => { setArea(item.id); setActivity(0); }} role="tab" type="button">
                <span>{item.symbol}</span>{item.name}
              </button>
            ))}
          </div>
          <div className="portal-practice-grid">
            {activeArea.practices.map((practice, index) => (
              <button className={`portal-practice ${activity === index ? "is-active" : ""}`} key={practice} onClick={() => setActivity(index)} type="button">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{practice}</strong>
                <small>{activeArea.name} · {activeBlock.title}</small>
                <b>{activity === index ? "Abierta" : "Abrir"} →</b>
              </button>
            ))}
          </div>
            {activeBlock.id === "a2-trip" && area === "spelling" ? (
            <Link className="portal-featured-edition" href="/portal/the-small-trip/spelling-lab">
              <div><span>Edición interactiva · 01</span><strong>Spelling Lab:<br />Regular Past <em>-ed</em></strong><p>Una experiencia adaptativa para narrar lo que pasó durante el viaje.</p></div>
              <b>Entrar a la edición <i>→</i></b>
            </Link>
            ) : null}
            {area === "grammar" ? (
              <Link className="portal-featured-edition" href={`/portal/grammar?level=${activeBlock.level}&block=${activeBlock.id}`}>
                <div><span>Grammar Play · catálogo situado</span><strong>Elige una misión<br />de <em>pocos minutos</em></strong><p>Píldoras para descubrir, contrastar y usar Grammar desde el contexto de {activeBlock.title}.</p></div>
                <b>Explorar Grammar <i>→</i></b>
              </Link>
            ) : null}
          <article className="portal-practice-stage">
            <div className="portal-stage-index">{activeArea.symbol}</div>
            <div>
              <p className="portal-kicker">{activeArea.name} · actividad {activity + 1}</p>
              <h3>{activeArea.practices[activity]}</h3>
              <p>{practicePrompt(activeBlock, activeArea.name, activity)}</p>
              <div className="portal-stage-actions">
                <button className="portal-button portal-button-dark" type="button" onClick={() => setSavedActivities((items) => items.includes(activityKey) ? items.filter((item) => item !== activityKey) : [...items, activityKey])}>
                  {savedActivities.includes(activityKey) ? "Práctica explorada ✓" : "Marcar como explorada"}
                </button>
                <Link className="portal-text-link" href={reinforcementUrl}>¿Quieres profundizar con un mentor? Agenda refuerzo →</Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="portal-reinforcement">
        <div>
          <p className="portal-kicker">Refuerzo situado</p>
          <h2>Cuando una escena pide conversación, hay una clase para ella.</h2>
          <p>La reserva conservará el nombre de <strong>{activeBlock.title}</strong> para que el mentor llegue preparado al contexto que estás explorando.</p>
        </div>
        <Link className="portal-button portal-button-gold" href={reinforcementUrl}>Agendar refuerzo de este bloque <span>→</span></Link>
      </section>

      <footer className="portal-footer">
        <span>L</span><p>LANCELOT · Centro de Entrenamiento del Aprendizaje</p><small>{learnerEmail}</small>
      </footer>
    </main>
  );
}

function practicePrompt(block: PortalBlock, area: string, activity: number) {
  const prompts = [
    `Observa la escena de “${block.title}”. Selecciona las palabras, formas o señales que te permitirían participar en ella con una intención clara.`,
    `Lleva “${block.title}” a tu experiencia: formula una respuesta propia y compárala con las opciones que el contexto abre.`,
    `Haz una transferencia breve: usa lo que descubriste en ${area} para resolver una situación parecida fuera del portal.`
  ];
  return prompts[activity];
}
