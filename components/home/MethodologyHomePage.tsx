"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useCallback, useEffect, useState } from "react";
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
  { number: "02", title: "Metacognición activa", copy: "El aprendiz observa cómo aprende, ajusta su estrategia y deja de depender del azar o de la repetición ciega." },
  { number: "03", title: "IA con centro humano", copy: "La tecnología amplía acceso, práctica y personalización; el criterio humano decide, interpreta y transforma." },
  { number: "04", title: "Transferencia real", copy: "Comprender no termina en recordar. Termina cuando el conocimiento cambia una decisión, una acción o una forma de mirar." },
  { number: "05", title: "La disciplina como recompensa", copy: "La disciplina no es el castigo por querer aprender; es la primera prueba de que ya estamos cambiando. La práctica con sentido convierte el esfuerzo en progreso visible y la constancia en respeto por el propio potencial." }
];

const audiences = [
  { icon: "academy" as const, title: "Instituciones", copy: "Pasar de administrar cursos a formar aprendices autónomos, medibles y capaces de transferir conocimiento.", href: "#contacto", cta: "Conoce Lancelot" },
  { icon: "business" as const, title: "Empresas", copy: "Convertir capacitación en criterio, liderazgo que enseña y cultura de aprendizaje permanente.", href: "#empresas", cta: "Conocer entrenamiento" },
  { icon: "language" as const, title: "Idiomas", copy: "Desbloquear voz, confianza y pertenencia comunicativa con práctica deliberada y feedback claro.", href: "/idiomas", cta: "Conocer idiomas" },
  { icon: "human" as const, title: "Aprendices", copy: "Recuperar una relación digna con aprender: menos bloqueo, más claridad, autonomía y progreso visible.", href: "/orientacion", cta: "Conocer orientación" }
];

const audienceVisuals: Record<string, { image: string; number: string }> = {
  Instituciones: { image: "/brand/applications/instituciones.png", number: "01" },
  Empresas: { image: "/brand/applications/empresas.png", number: "02" },
  Idiomas: { image: "/brand/applications/idiomas.png", number: "03" },
  Aprendices: { image: "/brand/applications/aprendices.png", number: "04" }
};

const reasonsToBelieve = [
  { number: "01", title: "Doble Desbloqueo", copy: "Cada experiencia desarrolla una capacidad externa y una facultad interna." },
  { number: "02", title: "Metacognición transversal", copy: "Observar cómo se aprende es una capa presente en toda la experiencia." },
  { number: "03", title: "IA que aumenta criterio", copy: "La inteligencia artificial acompaña, personaliza y amplía el pensamiento humano." },
  { number: "04", title: "Rutas que responden", copy: "La práctica se adapta al estado cognitivo, emocional y práctico del aprendiz." },
  { number: "05", title: "Métricas que transforman", copy: "El progreso se mide en transferencia, confianza, autorregulación y dominio." },
  { number: "06", title: "Identidad académica", copy: "Docentes e instituciones aplican la filosofía sin perder lo que los hace únicos." },
  { number: "07", title: "Filosofía observable", copy: "La plataforma convierte principios en conductas, práctica y evidencia visible." }
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
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const goTo = useCallback((index: number) => {
    setActive((index + methodSlides.length) % methodSlides.length);
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (isPaused || reduceMotion) return;
    const timer = window.setInterval(() => goTo(active + 1), 7000);
    return () => window.clearInterval(timer);
  }, [active, goTo, isPaused, reduceMotion]);

  return <section
    className="lti-visual reveal"
    aria-label="Ecosistema visual LANCELOT"
    aria-roledescription="carrusel"
    onMouseEnter={() => setIsPaused(true)}
    onMouseLeave={() => setIsPaused(false)}
    onFocus={() => setIsPaused(true)}
    onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
    }}
  >
    <div className="lti-visual-main" aria-live="polite">
      {methodSlides.map((slide, index) => <img
        alt={index === active ? slide.alt : ""}
        aria-hidden={index !== active}
        className={index === active ? "active" : ""}
        key={slide.src}
        loading={index === 0 ? "eager" : "lazy"}
        src={slide.src}
      />)}
    </div>
    <div className="lti-visual-panel">
      <span>Centro de Entrenamiento del Aprendizaje</span>
      <strong>Conciencia · Autonomía · Criterio</strong>
      <p>Una experiencia diseñada para que aprender no sea consumo de contenido, sino transformación verificable.</p>
    </div>
    <div className="lti-visual-controls">
      <button aria-label="Ver imagen anterior" className="lti-visual-arrow" onClick={() => goTo(active - 1)} type="button">
        <span aria-hidden="true">←</span>
      </button>
      <div className="lti-visual-dots" aria-label="Seleccionar imagen">
      {methodSlides.map((slide, index) => <button
        aria-current={index === active ? "true" : undefined}
        aria-label={`Ver imagen ${index + 1}: ${slide.alt}`}
        className={index === active ? "active" : ""}
        key={slide.src}
        onClick={() => goTo(index)}
        type="button"
      />)}
      </div>
      <button aria-label="Ver imagen siguiente" className="lti-visual-arrow" onClick={() => goTo(active + 1)} type="button">
        <span aria-hidden="true">→</span>
      </button>
    </div>
  </section>;
}

function LearningSystemDiagram() {
  return <figure className="learning-system reveal" aria-label="Evidencia del sistema de aprendizaje Lancelot">
    <header className="system-evidence-header">
      <span>Metodología</span>
      <p>La posición de Lancelot se sostiene cuando su filosofía se vuelve evidencia.</p>
    </header>
    <div className="system-evidence-layout">
      <div className="system-core">
        <CrownMark compact />
        <strong>Lancelot</strong>
        <span>Del conocimiento a la transformación</span>
      </div>
      <div className="system-evidence-grid">
        {reasonsToBelieve.map((reason) => <article className="system-proof" key={reason.number}>
          <b>{reason.number}</b>
          <strong>{reason.title}</strong>
          <p>{reason.copy}</p>
        </article>)}
      </div>
    </div>
    <figcaption>Una filosofía solo tiene valor cuando cambia la forma de aprender, enseñar y acompañar.</figcaption>
  </figure>;
}

function ContactForm() {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portfolio, setPortfolio] = useState("");
  const [service, setService] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const occupation = String(data.get("occupation") ?? "").trim();
    const selectedPortfolio = String(data.get("portfolio") ?? "").trim();
    const selectedService = String(data.get("service") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    setIsSubmitting(true);
    setStatus("");
    try {
      const response = await fetch("/api/support", {
        body: JSON.stringify({
          email,
          subject: `Contacto web — ${selectedPortfolio}${selectedService ? `: ${selectedService}` : ""}`,
          message: `Nombre: ${name}\nCorreo: ${email}\nTeléfono: ${phone || "No informado"}\nOcupación: ${occupation || "No informada"}\nPortafolio: ${selectedPortfolio}\n${selectedService ? `${selectedPortfolio === "Idiomas" ? "Ruta de idiomas" : "Servicio"}: ${selectedService}\n` : ""}\n${message}`
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No fue posible enviar tu mensaje.");
      form.reset();
      setPortfolio("");
      setService("");
      setStatus("Gracias. Recibimos tu mensaje y pronto nos pondremos en contacto contigo.");
    } catch (error) {
      console.error("No fue posible enviar el formulario de contacto", error);
      setStatus("No fue posible enviar tu mensaje. Inténtalo de nuevo o escríbenos a centro@lancelotmet.com.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <form className="lti-contact-form" onSubmit={submit}>
    <div className="lti-contact-fields">
      <label>Nombre<input name="name" required placeholder="Tu nombre" /></label>
      <label>Correo electrónico<input name="email" required type="email" placeholder="nombre@correo.com" /></label>
      <label>Teléfono<input name="phone" placeholder="+57 300 000 0000" type="tel" /></label>
      <label>Ocupación<input name="occupation" placeholder="Tu rol o profesión" /></label>
      <label>Portafolio<select name="portfolio" required value={portfolio} onChange={(event) => { setPortfolio(event.target.value); setService(""); }}><option value="" disabled>Selecciona una opción</option><option>Instituciones</option><option>Empresas</option><option>Idiomas</option><option>Aprendices</option></select></label>
      {portfolio === "Aprendices" && <label>Servicio<select name="service" required value={service} onChange={(event) => setService(event.target.value)}><option value="" disabled>Selecciona un servicio</option><option>Servicio Psicopedagógico</option><option>Orientación Vocacional</option></select></label>}
      {portfolio === "Idiomas" && <label>Ruta de idiomas<select name="service" required value={service} onChange={(event) => setService(event.target.value)}><option value="" disabled>Selecciona una ruta</option><option>Sound Sprint</option><option>Grammar Journey</option><option>Sound Sprint y Grammar Journey</option></select></label>}
    </div>
    <label>¿Qué quieres transformar?<textarea minLength={10} name="message" placeholder="Cuéntanos qué quieres aprender, construir o desbloquear." required rows={5} /></label>
    <div className="lti-contact-actions">
      <Link className="home-button home-button-primary lti-contact-submit" href="#inicio">Desde el Ser para El Saber<span aria-hidden="true">→</span></Link>
      <button className="lti-contact-form-submit" disabled={isSubmitting} type="submit">{isSubmitting ? "Enviando…" : "Enviar mensaje"}</button>
    </div>
    {status && <p className="lti-contact-status" role="status">{status}</p>}
  </form>;
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
          <Link href="#portafolio" onClick={close}>Portafolio</Link>
          <Link href="#metodologia" onClick={close}>Metodología</Link>
          <Link href="#empresas" onClick={close}>Empresas</Link>
          <Link href="#manifiesto" onClick={close}>Manifiesto</Link>
          <Link href="/filosofia" onClick={close}>Filosofía</Link>
          <ButtonPrimary href="#contacto">Conocer</ButtonPrimary>
        </div>
      </div>
    </nav>

    <section className="lti-hero" id="inicio">
      <div className="home-shell lti-hero-grid">
        <div className="lti-hero-copy reveal">
          <div className="official-logo"><img src="/brand/lancelot-logo-official.png" alt="LANCELOT - Desde el ser para el saber" /></div>
          <p className="home-kicker">Centro de Entrenamiento del Aprendizaje</p>
          <h1>LANCELOT transforma la manera de aprender en la era de la IA.</h1>
          <p className="hero-lead">Aprender no es llenarse de información. Es descubrir capacidades, construir autonomía y transformar la relación con el conocimiento.</p>
          <div className="home-actions">
            <ButtonPrimary href="#contacto">Conocer</ButtonPrimary>
            <ButtonSecondary href="#metodologia">Metodología</ButtonSecondary>
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
          <p className="home-kicker">Desde el Ser para el Saber</p>
          <h2>No es otra plataforma de cursos.</h2>
          <h3>Es una infraestructura para transformar la relación humana con aprender.</h3>
        </div>
        <div className="lti-thesis-copy reveal">
          <p>Durante años la educación intentó resolver el aprendizaje entregando más contenido, más cursos y más tecnología. En la era de la IA, el contenido ya es abundante. Lo escaso es criterio, autonomía, profundidad y transferencia.</p>
          <p>LANCELOT integra filosofía educativa, ciencias del aprendizaje, metacognición activa, inteligencia aumentada y experiencias personalizadas para convertir conocimiento en capacidad, conciencia y desarrollo humano.</p>
        </div>
      </div>
    </section>

    <section className="methodology-section lti-principles">
      <div className="home-shell">
        <SectionTitle eyebrow="La promesa" title="Todo aprendizaje valioso debe revelar al Ser" copy="Una capacidad externa: poder hacer algo nuevo. Una facultad interna: poder sostenerlo con claridad, carácter y criterio." />
        <div className="lti-principle-grid">
          {principles.map((principle) => <article className="reveal" key={principle.title}>
            <span>{principle.number}</span>
            <h3>{principle.title}</h3>
            <p>{principle.copy}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="lti-system-section" id="metodologia">
      <div className="home-shell lti-system-grid">
        <LearningSystemDiagram />
        <div className="reveal">
          <SectionTitle light eyebrow="Centro de Entrenamiento del Aprendizaje" title="Conocimiento que se convierte en autonomía, criterio, capacidad y transformación humana" copy="Lancelot es un Centro de Entrenamiento del Aprendizaje para la era de la Inteligencia Artificial: un ecosistema que integra filosofía educativa, ciencias del aprendizaje, metacognición activa, inteligencia aumentada y experiencias personalizadas para ayudar a personas e instituciones a convertir el conocimiento en autonomía, criterio, capacidad y transformación humana." />
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
          {["Comprender", "Revelar", "Observar", "Ajustar", "Practicar", "Conectar", "Transformar", "Autonomía", "Criterio", "Evidencia", "Propósito", "Transferencia"].map((word) => <span key={word} tabIndex={0}>{word}</span>)}
        </div>
      </div>
    </section>

    <section className="applications-section lti-audiences" id="portafolio">
      <div className="home-shell">
        <header className="lti-audiences-intro reveal">
          <div className="lti-audiences-ornament" aria-hidden="true" />
          <h2>LANCELOT EN ACCIÓN</h2>
          <p className="lti-audiences-lead">Una metodología. Cuatro formas de transformar el aprendizaje.</p>
          <p>No enseñamos más contenido. Diseñamos experiencias para convertir cada intento en comprensión, autonomía y dominio visible.</p>
        </header>
        <SectionTitle light eyebrow="Una infraestructura, múltiples caminos" title="LANCELOT acompaña personas e instituciones que necesitan aprender mejor" copy="Cambia el contexto. La promesa permanece: claridad, autonomía, criterio y transformación." />
        <div className="application-grid">
          {audiences.map((audience) => <article className="application-card reveal" key={audience.title}>
            <div className="application-card-image">
              <img src={audienceVisuals[audience.title].image} alt="" />
              <span className="application-card-number" aria-hidden="true">{audienceVisuals[audience.title].number}</span>
            </div>
            <div className="application-card-content">
            <MethodIcon name={audience.icon} />
            <div className="application-card-copy">
            <h3>{audience.title}</h3>
            <p>{audience.copy}</p>
            </div>
            <Link href={audience.href}>{audience.cta} <b>→</b></Link>
            </div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="lti-culture-section lti-enterprise" id="empresas">
      <div className="home-shell">
        <header className="enterprise-intro reveal">
          <p className="home-kicker">Entrenamiento Lancelot para empresas</p>
          <h2>Equipos que aprenden más rápido, comprenden mejor y resuelven más.</h2>
          <p>Programa grupal de 6 sesiones para desarrollar habilidades cognitivas y metacognición aplicada en tu equipo.</p>
        </header>
        <div className="enterprise-value-grid">
          <article className="enterprise-value reveal">
            <span>01</span>
            <h3>Lo que hacemos</h3>
            <ul>
              <li>Detectamos bloqueos de aprendizaje.</li>
              <li>Reconfiguramos la forma de comprender.</li>
              <li>Fortalecemos pensamiento claro y aprendizaje activo.</li>
            </ul>
          </article>
          <article className="enterprise-value reveal">
            <span>02</span>
            <h3>Programa grupal</h3>
            <ul>
              <li>6 sesiones guiadas.</li>
              <li>Metacognición avanzada.</li>
              <li>Mindsets de alto desempeño.</li>
              <li>Aplicación inmediata al trabajo.</li>
            </ul>
          </article>
          <article className="enterprise-value reveal">
            <span>03</span>
            <h3>Lo que logras</h3>
            <ul>
              <li>Equipos que comprenden más rápido.</li>
              <li>Mejor identificación de problemas y soluciones.</li>
              <li>Mayor búsqueda de nuevos conocimientos.</li>
              <li>Más adaptación y aprendizaje continuo.</li>
            </ul>
          </article>
        </div>
        <Link className="enterprise-outcome reveal" href="#contacto">Conoce LANCELOT <b>→</b></Link>
      </div>
    </section>

    <section className="transformation-section lti-manifesto" id="manifiesto">
      <div className="home-shell lti-manifesto-frame reveal">
        <CrownMark />
        <header className="lti-manifesto-copy">
          <p className="home-kicker">Manifiesto LANCELOT</p>
          <h2>Donde otros ven contenidos por enseñar, LANCELOT ve seres humanos por revelar.</h2>
          <p>LANCELOT existe para reconciliar conocimiento y ser: para que cada persona descubra capacidades, construya criterio y sostenga su crecimiento con autonomía, humanidad y propósito.</p>
        </header>
        <div className="lti-manifesto-principles">
          <span>La dignidad precede al conocimiento.</span>
          <span>La práctica convierte el error en evidencia.</span>
          <span>La IA sirve al criterio, no lo sustituye.</span>
        </div>
        <blockquote>El conocimiento no completa al ser humano. Lo revela.</blockquote>
      </div>
    </section>

    <section className="lti-library-invite">
      <div className="home-shell lti-library-invite-frame reveal">
        <span>Biblioteca Lancelot</span>
        <div><p className="home-kicker">Filosofía, estrategia, lenguaje y cultura</p><h2>Una obra para leer la visión completa de Lancelot.</h2><p>Cuatro volúmenes que conectan la razón de existir de Lancelot con la forma en que habla, acompaña y construye cultura de aprendizaje.</p></div>
        <Link className="home-button home-button-primary" href="/filosofia">Leer la filosofía <b aria-hidden="true">→</b></Link>
      </div>
    </section>

    <section className="lti-contact" id="contacto">
      <div className="home-shell lti-contact-layout reveal">
        <div className="lti-contact-copy">
          <BrandLockup />
          <p className="home-kicker">Una conversación puede abrir una ruta</p>
          <h2>Empieza a construir una relación distinta con aprender.</h2>
          <p>Cuéntanos qué quieres transformar. Diseñaremos contigo el siguiente paso para aprender con claridad, evidencia y propósito.</p>
          <div className="home-actions">
            <ButtonPrimary href="#portafolio">Portafolio</ButtonPrimary>
            <ButtonSecondary href="#metodologia">Metodología</ButtonSecondary>
          </div>
        </div>
        <ContactForm />
      </div>
    </section>

    <footer className="home-footer">
      <div className="home-shell">
        <BrandLockup />
        <nav aria-label="Navegación del footer">
          <Link href="#portafolio">Portafolio</Link>
          <Link href="#metodologia">Metodología</Link>
          <Link href="#empresas">Empresas</Link>
          <Link href="#manifiesto">Manifiesto</Link>
          <Link href="/filosofia">Filosofía</Link>
        </nav>
        <p>© 2026 LANCELOT. Todos los derechos reservados.</p>
      </div>
    </footer>
    <div className="mobile-sticky"><ButtonPrimary href="#contacto">Conocer</ButtonPrimary></div>
  </main>;
}
