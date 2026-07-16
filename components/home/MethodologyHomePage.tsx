"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BrandLockup, ButtonPrimary, ButtonSecondary, CrownMark, SectionTitle } from "./HomePage";

type MethodIconName = "mind" | "origin" | "practice" | "transfer" | "language" | "academy" | "business" | "human";

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

const applications = [
  { icon: "language" as const, title: "Idiomas", copy: "Descubre su lógica. Deja de traducir. Empieza a pensar.", href: "/sound-sprint", cta: "Conocer Sound Sprint" },
  { icon: "academy" as const, title: "Academia", copy: "Conecta ideas. Comprende lo que antes memorizabas.", href: "/marketplace", cta: "Explorar recursos" },
  { icon: "business" as const, title: "Mente empresarial", copy: "Lee patrones. Cambia decisiones. Crea estrategia.", href: "/marketplace", cta: "Desarrollar mentalidad" },
  { icon: "human" as const, title: "Desarrollo personal", copy: "Cambia tu mirada. Amplía lo que crees posible.", href: "/citas", cta: "Vivir la experiencia" }
];

const methodSlides = [
  { src: "/brand/method-slider/sliderhome6.png", alt: "LANCELOT cambia la forma de aprender" },
  { src: "/brand/method-slider/sliderhome3.png", alt: "Del bloqueo al desempeño en el colegio" },
  { src: "/brand/method-slider/sliderhome2.png", alt: "Cuando entiende, todo cambia" },
  { src: "/brand/method-slider/sliderhome4.png", alt: "En la universidad, la claridad marca la diferencia" },
  { src: "/brand/method-slider/sliderhome1.png", alt: "Entender te hace avanzar en la empresa" },
  { src: "/brand/method-slider/sliderhome5.png", alt: "Tu voz abre oportunidades en el mundo" }
];

function MethodSlider() {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);

  const move = (direction: number) => setActive((current) => (current + direction + methodSlides.length) % methodSlides.length);

  useEffect(() => {
    if (paused || expanded) return;
    const timer = window.setInterval(() => move(1), 6500);
    return () => window.clearInterval(timer);
  }, [paused, expanded]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setExpanded(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [expanded]);

  const slidePosition = (index: number) => {
    let offset = (index - active + methodSlides.length) % methodSlides.length;
    if (offset > methodSlides.length / 2) offset -= methodSlides.length;
    if (offset === 0) return "active";
    if (offset === -1) return "previous";
    if (offset === 1) return "next";
    if (offset === -2) return "far-previous";
    if (offset === 2) return "far-next";
    return "hidden";
  };

  return <><div className="method-slider reveal" aria-label="Historias de transformación LANCELOT" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
    <div className="method-slider-stage">
      {methodSlides.map((slide, index) => {
        const position = slidePosition(index);
        const isActive = position === "active";
        return <button
          className={`method-slide method-slide-${position}`}
          key={slide.src}
          type="button"
          aria-label={isActive ? `Ampliar: ${slide.alt}` : `Ver: ${slide.alt}`}
          aria-current={isActive ? "true" : undefined}
          tabIndex={position === "hidden" ? -1 : 0}
          onClick={() => isActive ? setExpanded(true) : setActive(index)}
        >
          <img src={slide.src} alt={slide.alt} loading={index === 0 ? "eager" : "lazy"} />
          {isActive && <span className="method-slide-zoom"><span aria-hidden="true">⌕</span> Ampliar</span>}
        </button>;
      })}
    </div>
    <div className="method-slider-controls">
      <button type="button" className="method-slider-arrow" onClick={() => move(-1)} aria-label="Imagen anterior">‹</button>
      <div className="method-slider-dots" aria-label="Seleccionar imagen">
        {methodSlides.map((slide, index) => <button type="button" key={slide.src} className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={`Ver imagen ${index + 1}`} aria-current={index === active ? "true" : undefined} />)}
      </div>
      <button type="button" className="method-slider-arrow" onClick={() => move(1)} aria-label="Imagen siguiente">›</button>
    </div>
    <p className="method-slider-hint"><span aria-hidden="true">＋</span> Toca la imagen para ampliarla</p>
  </div>
    {expanded && typeof document !== "undefined" && createPortal(<div className="method-lightbox" role="dialog" aria-modal="true" aria-label="Imagen ampliada" onClick={() => setExpanded(false)}>
      <button type="button" className="method-lightbox-close" onClick={() => setExpanded(false)} aria-label="Cerrar imagen">×</button>
      <button type="button" className="method-lightbox-nav method-lightbox-prev" onClick={(event) => { event.stopPropagation(); move(-1); }} aria-label="Imagen anterior">‹</button>
      <img src={methodSlides[active].src} alt={methodSlides[active].alt} onClick={(event) => event.stopPropagation()} />
      <button type="button" className="method-lightbox-nav method-lightbox-next" onClick={(event) => { event.stopPropagation(); move(1); }} aria-label="Imagen siguiente">›</button>
      <span className="method-lightbox-counter">{active + 1} / {methodSlides.length}</span>
    </div>, document.body)}
  </>;
}

export function MethodologyHomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")), { threshold: .12 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  const close = () => setMenuOpen(false);

  return <main className="lancelot-home methodology-home">
    <nav className="home-nav" aria-label="Navegación principal"><div className="home-shell nav-inner"><Link className="home-brand" href="#inicio" onClick={close}><BrandLockup compact /></Link><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Abrir menú"><i /><i /><i /></button><div className={`home-links${menuOpen ? " open" : ""}`}><Link href="#metodologia" onClick={close}>Metodología</Link><Link href="#proceso" onClick={close}>Cómo funciona</Link><Link href="#aplicaciones" onClick={close}>Aplicaciones</Link><Link href="/marketplace" onClick={close}>Experiencias</Link><ButtonPrimary href="#descubrir">Descubre LANCELOT</ButtonPrimary></div></div></nav>

    <section className="method-hero" id="inicio"><div className="home-shell"><div className="official-logo reveal"><img src="/brand/lancelot-logo-official.png" alt="LANCELOT — Desde el ser para el saber" /></div><div className="method-hero-grid"><div className="method-hero-copy reveal"><h1>Una metodología innovadora que hace entendible <em>lo que parecía imposible.</em></h1><div className="home-actions"><ButtonPrimary href="#metodologia">Descubre la metodología</ButtonPrimary><ButtonSecondary href="#aplicaciones">Dónde se aplica</ButtonSecondary></div></div><MethodSlider /></div></div></section>

    <section className="method-manifesto"><div className="home-shell reveal"><CrownMark /><p>Desde el ser para el saber</p><blockquote>Los genios no saben más, aprenden distinto.</blockquote></div></section>

    <section className="methodology-section" id="metodologia"><div className="home-shell"><SectionTitle eyebrow="La lógica revelada" title="No es saber más. Es verlo distinto." copy="Cuando descubres el porqué, la información se convierte en perspectiva." /><div className="method-pillars"><article className="reveal"><MethodIcon name="mind" /><span>01</span><h3>Mentalidad</h3><p>Abre la mente a nuevas posibilidades.</p></article><article className="reveal"><MethodIcon name="origin" /><span>02</span><h3>La lógica</h3><p>Revela el origen y el patrón de cada idea.</p></article><article className="reveal"><MethodIcon name="practice" /><span>03</span><h3>Momento eureka</h3><p>Conecta las piezas. Todo cobra sentido.</p></article><article className="reveal"><MethodIcon name="transfer" /><span>04</span><h3>Nueva perspectiva</h3><p>Piensa, decide y crea de otra manera.</p></article></div></div></section>

    <section className="genius-section"><div className="home-shell genius-grid"><div className="genius-statement reveal"><p className="home-kicker">El cambio de perspectiva</p><h2>Una idea puede reorganizar tu mundo.</h2><blockquote>El eureka ocurre cuando lo complejo revela su patrón.</blockquote></div><div className="genius-contrast reveal"><article><span>Memorizar</span><strong>Repetir</strong><p>Acumulas datos. Conservas la misma mirada.</p></article><i>→</i><article><span>Comprender</span><strong>Revelar</strong><p>Encuentras la lógica. Cambias la perspectiva.</p></article></div></div></section>

    <section className="method-process-section" id="proceso"><div className="home-shell"><SectionTitle eyebrow="La ruta hacia el click" title="De no entender a ver con claridad" copy="Cuatro movimientos. Una nueva forma de mirar." /><div className="method-process"><article className="reveal"><b>01</b><h3>Descubre</h3><p>Encuentra la pregunta que abre el tema.</p></article><article className="reveal"><b>02</b><h3>Entiende</h3><p>Revela la lógica oculta.</p></article><article className="reveal"><b>03</b><h3>Interioriza</h3><p>Conecta la idea contigo.</p></article><article className="reveal"><b>04</b><h3>Expresa</h3><p>Piensa y actúa distinto.</p></article></div></div></section>

    <section className="applications-section" id="aplicaciones"><div className="home-shell"><SectionTitle light eyebrow="Una lógica, múltiples caminos" title="El click puede ocurrir en cualquier tema" copy="Cambia el escenario. La revelación es la misma." /><div className="application-grid">{applications.map((application) => <article className="application-card reveal" key={application.title}><MethodIcon name={application.icon} /><span>Aplicación</span><h3>{application.title}</h3><p>{application.copy}</p><Link href={application.href}>{application.cta} <b>→</b></Link></article>)}</div></div></section>

    <section className="transformation-section"><div className="home-shell transformation-frame reveal"><CrownMark /><SectionTitle eyebrow="Después del click" title="Ya no vuelves a ver igual" /><div className="transformation-list"><span>Claridad</span><span>Perspectiva</span><span>Criterio</span><span>Conexión</span><span>Autonomía</span></div><blockquote>Aprender de verdad es cambiar la forma de mirar.</blockquote></div></section>

    <section className="method-final" id="descubrir"><div className="home-shell reveal"><BrandLockup /><p>Tu próximo eureka empieza con una pregunta</p><h2>Descubre la lógica que puede cambiar tu perspectiva.</h2><div className="home-actions"><ButtonPrimary href="/marketplace">Explorar experiencias</ButtonPrimary><ButtonSecondary href="/citas">Hablar con LANCELOT</ButtonSecondary></div></div></section>

    <footer className="home-footer"><div className="home-shell"><BrandLockup /><nav aria-label="Navegación del footer"><Link href="#metodologia">Metodología</Link><Link href="#proceso">Cómo funciona</Link><Link href="#aplicaciones">Aplicaciones</Link><Link href="/sound-sprint">Sound Sprint</Link><Link href="/marketplace">Marketplace</Link></nav><p>© 2026 LANCELOT. Todos los derechos reservados.</p></div></footer>
    <div className="mobile-sticky"><ButtonPrimary href="#descubrir">Descubre LANCELOT</ButtonPrimary></div>
  </main>;
}
