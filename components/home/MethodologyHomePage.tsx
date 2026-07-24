"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { BrandLockup, ButtonPrimary, ButtonSecondary, CrownMark, SectionTitle } from "./HomePage";

type MethodIconName =
  | "mind"
  | "origin"
  | "practice"
  | "transfer"
  | "language"
  | "academy"
  | "business"
  | "human";

function MethodIcon({ name }: { name: MethodIconName }) {
  const paths: Record<MethodIconName, ReactNode> = {
    mind: <><path d="M8 19c-3.4-1.5-5-4.1-5-7.2C3 7.5 6.5 4 11 4c4.7 0 8 3.3 8 7.8 0 2.2-.9 4-2.5 5.5V21H9v-4" /><path d="M8 9c1-1.7 3.7-2.2 5.3-.8 1.2 1 1.5 2.8.7 4.1-.7 1.1-2 1.7-3.3 1.4" /></>,
    origin: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.7 5.5 3.7 9S14.5 18.5 12 21M12 3C9.5 5.5 8.3 8.5 8.3 12S9.5 18.5 12 21" /></>,
    practice: <><path d="M5 4h14v16H5zM8 8h8M8 12h5" /><path d="m12 17 2 2 4-5" /></>,
    transfer: <><path d="M4 17 17 4M10 4h7v7" /><path d="M4 8v12h12" /></>,
    language: <><path d="M4 5h16v11H9l-5 4V5Z" /><path d="M8 9h8M8 12h5" /></>,
    academy: <><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M6 12v5c3.5 2.7 8.5 2.7 12 0v-5M21 9v7" /></>,
    business: <><path d="M4 20V10h5v10M10 20V5h5v15M16 20v-7h4v7M3 20h18" /><path d="m4 7 5-3 4 2 7-4" /></>,
    human: <><circle cx="12" cy="7" r="3" /><path d="M5 21c.6-5.3 2.9-8 7-8s6.4 2.7 7 8" /><path d="M4 8 2 10M20 8l2 2" /></>
  };
  return <span className="method-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg></span>;
}

const principles = [
  { number: "01", title: "Doble Desbloqueo", copy: "Cada experiencia debe abrir una capacidad externa y una facultad interna: hacer algo nuevo y sostenerlo con criterio." },
  { number: "02", title: "Metacognición activa", copy: "El aprendiz observa cómo aprende, ajusta su estrategia y deja de depender de la suerte o de la repetición ciega." },
  { number: "03", title: "IA con centro humano", copy: "La tecnología amplía acceso, práctica y personalización; el criterio humano decide, interpreta y transforma." },
  { number: "04", title: "Transferencia real", copy: "Comprender no termina en recordar. Termina cuando el conocimiento cambia una decisión, una acción o una forma de mirar." }
];

const transformationPath = [
  { label: "Propósito", question: "¿Qué aprendizaje queremos producir?" },
  { label: "Persona", question: "¿Qué necesita comprender, practicar o desbloquear?" },
  { label: "Sistema", question: "¿Qué condiciones facilitan ese aprendizaje?" },
  { label: "Evidencia", question: "¿Cómo sabremos que ocurrió transformación?" }
];

const audiences = [
  { icon: "academy" as const, title: "Instituciones", copy: "Pasar de administrar cursos a formar aprendices autónomos, medibles y capaces de transferir conocimiento.", href: "/marketplace", cta: "Explorar recursos" },
  { icon: "business" as const, title: "Empresas", copy: "Convertir capacitación en criterio, liderazgo que enseña y cultura de aprendizaje permanente.", href: "/marketplace", cta: "Ver soluciones" },
  { icon: "language" as const, title: "Idiomas", copy: "Desbloquear voz, confianza y pertenencia comunicativa con práctica deliberada y feedback claro.", href: "/sound-sprint", cta: "Conocer Sound Sprint" },
  { icon: "human" as const, title: "Aprendices", copy: "Recuperar una relación digna con aprender: menos bloqueo, más claridad, autonomía y progreso visible.", href: "/citas", cta: "Hablar con LANCELOT" }
];

const rituals = [
  "Bienvenida al ecosistema",
  "Círculos de aprendizaje",
  "Laboratorios de innovación",
  "Reflexión metacognitiva",
  "Mentorías cruzadas",
  "Espacios de investigación"
];

const methodSlides = [
  { src: "/brand/method-slider/sliderhome6.png", alt: "LANCELOT transforma la manera de aprender" },
  { src: "/brand/method-slider/sliderhome3.png", alt: "Un estudiante descubre claridad frente al bloqueo" },
  { src: "/brand/method-slider/sliderhome2.png", alt: "El aprendizaje se vuelve una experiencia de revelación" },
  { src: "/brand/method-slider/sliderhome4.png", alt: "La autonomía cambia la experiencia universitaria" },
  { src: "/brand/method-slider/sliderhome1.png", alt: "El criterio se convierte en acción dentro de una empresa" },
  { src: "/brand/method-slider/sliderhome5.png", alt: "La voz abre oportunidades globales" }
];

function MethodSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % methodSlides.length), 6200);
    return () => window.clearInterval(timer);
  }, []);

  return <div className="lti-visual reveal" aria-label="Ecosistema visual LANCELOT">
    <div className="lti-visual-main">
      <img src={methodSlides[active].src} alt={methodSlides[active].alt} loading={active === 0 ? "eager" : "lazy"} />
    </div>
    <div className="lti-visual-panel">
      <span>Learning Transformation Infrastructure</span>
      <strong>Conciencia · Autonomía · Criterio</strong>
      <p>Una experiencia diseñada para que aprender no sea consumo de contenido, sino transformación verificable.</p>
    </div>
    <div className="lti-visual-dots" aria-label="Seleccionar imagen">
      {methodSlides.map((slide, index) => <button
        aria-current={index === active ? "true" : undefined}
        aria-label={`Ver imagen ${index + 1}: ${slide.alt}`}
        className={index === active ? "active" : ""}
        key={slide.src}
        onClick={() => setActive(index)}
        type="button"
      />)}
    </div>
  </div>;
}

function LearningSystemDiagram() {
  return <div className="learning-system reveal" aria-label="Sistema de transformación del aprendizaje">
    <div className="system-core">
      <CrownMark compact />
      <strong>LANCELOT</strong>
      <span>Desde el ser para el saber</span>
    </div>
    {["Filosofía", "Ciencias del aprendizaje", "IA educativa", "Experiencias adaptativas", "Analítica", "Cultura"].map((item, index) => <span className={`system-node node-${index + 1}`} key={item}>{item}</span>)}
  </div>;
}

export function MethodologyHomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")), { threshold: .12 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const close = () => setMenuOpen(false);

  return <main className="lancelot-home methodology-home lti-home">
    <nav className="home-nav lti-nav" aria-label="Navegación principal">
      <div className="home-shell nav-inner">
        <Link className="home-brand" href="#inicio" onClick={close}><BrandLockup compact /></Link>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Abrir menú"><i /><i /><i /></button>
        <div className={`home-links${menuOpen ? " open" : ""}`}>
          <Link href="#categoria" onClick={close}>Categoría</Link>
          <Link href="#sistema" onClick={close}>Sistema</Link>
          <Link href="#cultura" onClick={close}>Cultura</Link>
          <Link href="/marketplace" onClick={close}>Experiencias</Link>
          <ButtonPrimary href="#contacto">Empezar</ButtonPrimary>
        </div>
      </div>
    </nav>

    <section className="lti-hero" id="inicio">
      <div className="home-shell lti-hero-grid">
        <div className="lti-hero-copy reveal">
          <div className="official-logo"><img src="/brand/lancelot-logo-official.png" alt="LANCELOT - Desde el ser para el saber" /></div>
          <p className="home-kicker">Infraestructura de Transformación del Aprendizaje</p>
          <h1>LANCELOT transforma la manera de aprender en la era de la IA.</h1>
          <p className="hero-lead">Aprender no es llenarse de información. Es descubrir capacidades, construir autonomía y transformar la relación con el conocimiento.</p>
          <div className="home-actions">
            <ButtonPrimary href="#categoria">Conocer la categoría</ButtonPrimary>
            <ButtonSecondary href="/marketplace">Explorar experiencias</ButtonSecondary>
          </div>
          <dl className="lti-proof-row" aria-label="Principios centrales">
            <div><dt>01</dt><dd>Metacognición activa</dd></div>
            <div><dt>02</dt><dd>IA educativa humanista</dd></div>
            <div><dt>03</dt><dd>Doble Desbloqueo</dd></div>
          </dl>
        </div>
        <MethodSlider />
      </div>
    </section>

    <section className="lti-thesis" id="categoria">
      <div className="home-shell lti-thesis-grid">
        <div className="reveal">
          <p className="home-kicker">La nueva categoría</p>
          <h2>No es otra plataforma de cursos. Es una infraestructura para transformar la relación humana con aprender.</h2>
        </div>
        <div className="lti-thesis-copy reveal">
          <p>Durante años la educación intentó resolver el aprendizaje entregando más contenido, más cursos y más tecnología. En la era de la IA, el contenido ya es abundante. Lo escaso es criterio, autonomía, profundidad y transferencia.</p>
          <p>LANCELOT integra filosofía educativa, ciencias del aprendizaje, metacognición activa, inteligencia aumentada y experiencias personalizadas para convertir conocimiento en capacidad, conciencia y desarrollo humano.</p>
        </div>
      </div>
    </section>

    <section className="methodology-section lti-principles">
      <div className="home-shell">
        <SectionTitle eyebrow="La promesa pedagógica" title="Todo aprendizaje valioso debe producir Doble Desbloqueo" copy="Una capacidad externa: poder hacer algo nuevo. Una facultad interna: poder sostenerlo con claridad, carácter y criterio." />
        <div className="lti-principle-grid">
          {principles.map((principle) => <article className="reveal" key={principle.title}>
            <span>{principle.number}</span>
            <h3>{principle.title}</h3>
            <p>{principle.copy}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="lti-system-section" id="sistema">
      <div className="home-shell lti-system-grid">
        <LearningSystemDiagram />
        <div className="reveal">
          <SectionTitle light eyebrow="Sistema operativo del aprendizaje" title="Filosofía, tecnología y experiencia trabajando como una sola arquitectura" copy="La marca no se define por el formato de entrega. Se define por la transformación que produce." />
          <div className="lti-system-list">
            <p><strong>Revela.</strong> El aprendiz no llega vacío: llega con potencia que necesita forma, lenguaje y dirección.</p>
            <p><strong>Organiza.</strong> Cada ruta vuelve visible el proceso mental para que la persona entienda cómo aprende.</p>
            <p><strong>Ejercita.</strong> La disciplina se convierte en práctica deliberada, evidencia y progreso visible.</p>
            <p><strong>Transfiere.</strong> El conocimiento se prueba cuando cambia decisiones, voz, criterio o acción.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="lti-language-section">
      <div className="home-shell lti-language-grid">
        <div className="reveal">
          <p className="home-kicker">Arquitectura del lenguaje</p>
          <h2>Las palabras también educan.</h2>
          <p>LANCELOT habla con claridad, profundidad y respeto. No infantiliza, no grita, no promete magia. Su voz existe para que quien escucha comprenda mejor el mundo y se comprenda mejor a sí mismo.</p>
        </div>
        <div className="lti-word-board reveal">
          {["Comprender", "Revelar", "Observar", "Ajustar", "Practicar", "Conectar", "Transformar", "Autonomía", "Criterio", "Evidencia", "Propósito", "Transferencia"].map((word) => <span key={word}>{word}</span>)}
        </div>
      </div>
    </section>

    <section className="method-process-section lti-process">
      <div className="home-shell">
        <SectionTitle eyebrow="Learning Thinking" title="Toda decisión comienza con una pregunta de aprendizaje" copy="La cultura LANCELOT convierte experiencia en aprendizaje, aprendizaje en criterio y criterio en valor para otros." />
        <div className="lti-path">
          {transformationPath.map((step, index) => <article className="reveal" key={step.label}>
            <b>{String(index + 1).padStart(2, "0")}</b>
            <h3>{step.label}</h3>
            <p>{step.question}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="applications-section lti-audiences">
      <div className="home-shell">
        <SectionTitle light eyebrow="Una infraestructura, múltiples caminos" title="LANCELOT acompaña personas e instituciones que necesitan aprender mejor" copy="Cambia el contexto. La promesa permanece: claridad, autonomía, criterio y transformación." />
        <div className="application-grid">
          {audiences.map((audience) => <article className="application-card reveal" key={audience.title}>
            <MethodIcon name={audience.icon} />
            <span>Aplicación</span>
            <h3>{audience.title}</h3>
            <p>{audience.copy}</p>
            <Link href={audience.href}>{audience.cta} <b>→</b></Link>
          </article>)}
        </div>
      </div>
    </section>

    <section className="lti-culture-section" id="cultura">
      <div className="home-shell lti-culture-grid">
        <div className="lti-culture-copy reveal">
          <p className="home-kicker">Cultura del aprendizaje</p>
          <h2>Una organización enseña incluso cuando simplemente está decidiendo.</h2>
          <p>LANCELOT protege una cultura humanista, rigurosa y permanente: liderazgo que enseña, investigación, práctica, retroalimentación, rituales y decisiones guiadas por evidencia.</p>
          <blockquote>Mientras LANCELOT crezca, nunca dejará de preguntarse si aquello que construye ayuda a las personas a aprender mejor, pensar mejor, actuar mejor y convertirse en una versión más consciente de sí mismas.</blockquote>
        </div>
        <div className="lti-rituals reveal">
          {rituals.map((ritual, index) => <span key={ritual}><b>{String(index + 1).padStart(2, "0")}</b>{ritual}</span>)}
        </div>
      </div>
    </section>

    <section className="transformation-section lti-manifesto">
      <div className="home-shell transformation-frame reveal">
        <CrownMark />
        <SectionTitle eyebrow="Manifiesto" title="El conocimiento no completa al ser humano. Lo revela." copy="LANCELOT no existe para enseñar más contenidos; existe para que más personas vuelvan a creer, con evidencia, en su capacidad de aprender." />
        <div className="transformation-list">
          <span>Claridad</span>
          <span>Autonomía</span>
          <span>Criterio</span>
          <span>Práctica</span>
          <span>Propósito</span>
        </div>
        <blockquote>Desde el ser para el saber.</blockquote>
      </div>
    </section>

    <section className="method-final lti-final" id="contacto">
      <div className="home-shell reveal">
        <BrandLockup />
        <p>El futuro necesita personas capaces de aprender durante toda la vida</p>
        <h2>Construyamos una experiencia de aprendizaje con claridad, evidencia y transformación.</h2>
        <div className="home-actions">
          <ButtonPrimary href="/citas">Hablar con LANCELOT</ButtonPrimary>
          <ButtonSecondary href="/marketplace">Explorar marketplace</ButtonSecondary>
        </div>
      </div>
    </section>

    <footer className="home-footer">
      <div className="home-shell">
        <BrandLockup />
        <nav aria-label="Navegación del footer">
          <Link href="#categoria">Categoría</Link>
          <Link href="#sistema">Sistema</Link>
          <Link href="#cultura">Cultura</Link>
          <Link href="/sound-sprint">Sound Sprint</Link>
          <Link href="/marketplace">Marketplace</Link>
        </nav>
        <p>© 2026 LANCELOT. Todos los derechos reservados.</p>
      </div>
    </footer>
    <div className="mobile-sticky"><ButtonPrimary href="#contacto">Empezar</ButtonPrimary></div>
  </main>;
}
