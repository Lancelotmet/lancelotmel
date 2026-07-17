"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useState } from "react";

const Arrow = () => <span aria-hidden="true">→</span>;

export function CrownMark({ compact = false }: { compact?: boolean }) {
  return <span className={`crown-mark${compact ? " compact" : ""}`} aria-hidden="true"><svg viewBox="0 0 64 48" fill="none"><path d="M7 36 3 12l16 12L32 5l13 19 16-12-4 24H7Z" /><path d="M9 36h46v7H9z" /><path d="M3 12h.01M32 5h.01M61 12h.01" /></svg></span>;
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return <span className={`brand-lockup${compact ? " compact" : ""}`}><span className="brand-crown-row"><i /><CrownMark compact={compact} /><i /></span><strong>LANCELOT</strong><span className="brand-slogan"><i />DESDE EL SER PARA EL SABER<i /></span></span>;
}

export function ButtonPrimary({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="home-button home-button-primary" href={href}>{children}<Arrow /></Link>;
}

export function ButtonSecondary({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="home-button home-button-secondary" href={href}>{children}<Arrow /></Link>;
}

export function SectionTitle({ eyebrow, title, copy, light = false }: { eyebrow: string; title: string; copy?: string; light?: boolean }) {
  return <header className={`home-section-title${light ? " is-light" : ""}`}><p className="home-section-eyebrow">{eyebrow}</p><h2>{title}</h2>{copy && <p className="home-section-copy">{copy}</p>}</header>;
}

type BenefitIconName = "microphone" | "clock" | "calendar" | "shield" | "coaching" | "headphones";

function BenefitIcon({ name }: { name: BenefitIconName }) {
  const paths: Record<BenefitIconName, ReactNode> = {
    microphone: <><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /><path d="M6.5 7.5h2M15.5 7.5h2" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2M4.5 4.5 2.8 6.2M19.5 4.5l1.7 1.7" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /><path d="m8 15 2.2 2.2L16 12" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
    coaching: <><circle cx="8" cy="9" r="3" /><circle cx="17" cy="8" r="2.5" /><path d="M2.8 20c.4-4 2.2-6 5.2-6s4.8 2 5.2 6M14 14.5c3.7-.7 6.3 1.2 6.8 4.5" /><path d="M14 4.5h6v5" /></>,
    headphones: <><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><rect x="3" y="12" width="4" height="7" rx="2" /><rect x="17" y="12" width="4" height="7" rx="2" /><path d="M9 14v3M12 12v7M15 14v3" /></>
  };
  return <span className="benefit-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg></span>;
}

function FeatureChip({ icon, title, copy, number }: { icon: BenefitIconName; title: string; copy: string; number: string }) {
  return <article className="feature-chip reveal"><span className="feature-number">{number}</span><BenefitIcon name={icon} /><div><strong>{title}</strong><span>{copy}</span></div></article>;
}

function AudioPlayerMockup() {
  return <div className="audio-player" aria-label="Demostración visual de audio"><button aria-label="Reproducir audio">▶</button><div className="audio-wave">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ height: `${18 + ((i * 17) % 34)}%` }} />)}</div><span>00:20</span></div>;
}

function ProductCard() {
  return <article className="sprint-product-card reveal">
    <div className="product-card-top"><CrownMark compact /><span>Edición intensiva · 1 semana</span></div>
    <p className="eyebrow">LANCELOT presenta</p><h2>Sound Sprint</h2><h3>Pronunciación acelerada en 1 semana</h3>
    <AudioPlayerMockup />
    <ul><li>3 sesiones de 20 minutos</li><li>Pronunciación americana</li><li>Palabras difíciles</li><li>Más claridad y confianza</li></ul>
    <ButtonPrimary href="/citas">Reservar mi lugar</ButtonPrimary>
  </article>;
}

function TestimonialCard({ quote, name, featured = false }: { quote: string; name: string; featured?: boolean }) {
  return <article className={`testimonial-card reveal${featured ? " featured" : ""}`}><div className="testimonial-top"><span className="avatar">{name.charAt(0)}</span><span className="stars">★★★★★</span><b>“</b></div><blockquote>“{quote}”</blockquote><footer><strong>{name}</strong><span>Estudiante LANCELOT</span></footer></article>;
}

function PricingCard() {
  return <article className="pricing-card reveal"><span className="pricing-ribbon">Más elegido</span><p>Sprint completo</p><div><strong>$49</strong><span>USD</span></div><p>3 sesiones · 20 minutos cada una</p><ul><li>Coaching 1 a 1</li><li>Audio feedback personalizado</li><li>Acceso inmediato</li></ul><ButtonPrimary href="/citas">Inscribirme</ButtonPrimary></article>;
}

function FormCard() {
  const [status, setStatus] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("¡Listo! Te llevamos a la agenda para elegir tu horario.");
    window.setTimeout(() => { window.location.href = "/citas"; }, 900);
  }
  return <form className="home-form" onSubmit={submit}><label>Nombre<input name="name" required placeholder="Tu nombre completo" /></label><label>Correo<input name="email" type="email" required placeholder="nombre@correo.com" /></label><div><label>País<input name="country" required placeholder="Colombia" /></label><label>WhatsApp<input name="phone" type="tel" required placeholder="+57 300 000 0000" /></label></div><button className="home-button home-button-gold" type="submit">Reservar mi lugar <Arrow /></button>{status && <p className="form-success" role="status">{status}</p>}</form>;
}

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")), { threshold: .12 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  const close = () => setMenuOpen(false);
  return <main className="lancelot-home">
    <nav className="home-nav" aria-label="Navegación de la página"><div className="home-shell nav-inner"><Link className="home-brand" href="#inicio" onClick={close}><BrandLockup compact /></Link><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Abrir menú"><i /><i /><i /></button><div className={`home-links${menuOpen ? " open" : ""}`}><Link href="#metodo" onClick={close}>Método</Link><Link href="#sprint" onClick={close}>Sprint</Link><Link href="#beneficios" onClick={close}>Beneficios</Link><Link href="#testimonios" onClick={close}>Testimonios</Link><Link href="/marketplace" onClick={close}>Marketplace</Link><ButtonPrimary href="#inscripcion">Inscríbete ahora</ButtonPrimary></div></div></nav>

    <section className="home-hero" id="inicio"><div className="home-shell"><div className="official-logo reveal"><img src="/brand/lancelot-logo-official.png" alt="LANCELOT — Desde el ser para el saber" /></div><div className="hero-layout"><div className="home-hero-copy reveal"><p className="home-kicker">Pronunciación americana · Sprint de 1 semana</p><h1>¿Sientes que sabes inglés, pero al hablar <em>te bloqueas?</em></h1><p className="hero-lead">LANCELOT desbloquea tu mente, ordena lo que ya sabes y entrena tu voz para hablar inglés con más claridad, confianza y fluidez.</p><blockquote>No te falta inglés. <strong>Te falta desbloquearlo.</strong></blockquote><div className="home-actions"><ButtonPrimary href="#inscripcion">Inscríbete al Sound Sprint</ButtonPrimary><ButtonSecondary href="#metodo">Ver cómo funciona</ButtonSecondary></div><p className="hero-micro">3 sesiones <i /> 20 minutos <i /> 1 semana</p></div><ProductCard /></div></div><div className="hero-scroll">Descubre el método <span>↓</span></div></section>

    <section className="problem-section" id="metodo"><div className="home-shell"><SectionTitle eyebrow="El problema no es lo que sabes" title="Cuando vas a hablar, tu mente se nubla" copy="Muchas personas han estudiado inglés durante años, pero cuando llega el momento de hablar sienten bloqueo, inseguridad o miedo a pronunciar mal." /><div className="problem-band reveal"><div className="mini-product"><CrownMark compact /><b>Sound Sprint</b></div><p><strong>Tu inglés está ahí.</strong><br />Solo necesita una ruta para salir con claridad.</p><ButtonSecondary href="#inscripcion">Vuelve a LANCELOT</ButtonSecondary></div><div className="problem-grid"><article className="reveal"><span>01</span><p>Sé lo que quiero decir, pero no me sale.</p></article><article className="reveal"><span>02</span><p>Me da miedo pronunciar mal.</p></article><article className="reveal"><span>03</span><p>Traduzco demasiado antes de hablar.</p></article></div></div></section>

    <section className="trust-section"><div className="home-shell trust-layout"><div><SectionTitle eyebrow="Una metodología que evoluciona" title="¿Por qué confiar en LANCELOT?" copy="Más de 15 años de experiencia nos enseñaron algo: aprender inglés tenía que evolucionar. Por eso creamos una metodología que une ciencia del aprendizaje, entrenamiento cognitivo y tecnología educativa." /><p className="premium-quote">No enseñamos inglés como una materia.<br /><strong>Lo entrenamos como una habilidad.</strong></p></div><div className="trust-orbits reveal"><article><strong>15<sup>+</sup></strong><span>años de experiencia</span></article><article><strong>3</strong><span>disciplinas conectadas</span><small>Aprendizaje · Tecnología · Educación</small></article></div></div></section>

    <section className="belong-section"><div className="home-shell belong-frame reveal"><CrownMark /><SectionTitle eyebrow="Pertenencia" title="El inglés también te pertenece" copy="LANCELOT te ayuda a dejar de sentirlo como algo ajeno y a empezar a hablarlo como parte de ti." /><div className="belong-card">Deja de sentirlo ajeno.<strong>Empieza a hacerlo tuyo.</strong></div></div></section>

    <section className="learn-section"><div className="home-shell"><SectionTitle eyebrow="El método" title="Aprende inglés como aprendiste tu primer idioma" copy="No empezaste hablando español por reglas. Empezaste escuchando, imitando y encontrando tu voz. Con LANCELOT entrenas el oído, la pronunciación y la mente para que el inglés haga click de verdad." /><div className="process-grid"><article className="reveal"><span>01</span><BenefitIcon name="headphones" /><h3>Escucha</h3><p>Reconoce el sonido, el ritmo y la intención.</p></article><article className="reveal"><span>02</span><BenefitIcon name="microphone" /><h3>Pronuncia</h3><p>Entrena tu voz con práctica breve y enfocada.</p></article><article className="reveal"><span>03</span><BenefitIcon name="shield" /><h3>Corrige</h3><p>Recibe feedback preciso y vuelve a intentarlo.</p></article></div></div></section>

    <section className="sprint-section" id="sprint"><div className="home-shell"><div className="sprint-intro"><SectionTitle light eyebrow="El producto" title="LANCELOT Sound Sprint" copy="3 sesiones de 20 minutos para entrenar palabras difíciles, mejorar tu claridad y sonar más natural en inglés." /><AudioPlayerMockup /></div><div className="sprint-layout" id="beneficios"><div className="feature-grid" aria-label="Beneficios del Sound Sprint"><FeatureChip number="01" icon="microphone" title="Pronunciación americana" copy="Sonidos, ritmo y entonación natural." /><FeatureChip number="02" icon="clock" title="Sesiones cortas" copy="Entrenamiento enfocado de 20 minutos." /><FeatureChip number="03" icon="calendar" title="Resultados en 1 semana" copy="Un sprint diseñado para avanzar rápido." /><FeatureChip number="04" icon="shield" title="Confianza al hablar" copy="Menos bloqueo, más claridad al expresarte." /><FeatureChip number="05" icon="coaching" title="Coaching 1 a 1" copy="Atención personal sobre tu propia voz." /><FeatureChip number="06" icon="headphones" title="Audio feedback" copy="Correcciones que puedes escuchar y repetir." /></div><PricingCard /></div></div></section>

    <section className="world-section"><div className="world-map" aria-hidden="true">◇ ◇ ◇<br /> ◇ ◇ ◇ ◇</div><div className="home-shell world-content reveal"><p className="home-kicker">Tu voz, sin fronteras</p><h2>Tu voz también puede sonar <em>internacional.</em></h2><p>Entrena tu pronunciación americana y comunícate con el mundo con claridad, confianza y ritmo natural.</p><AudioPlayerMockup /><ButtonPrimary href="#inscripcion">Quiero sonar más internacional</ButtonPrimary></div></section>

    <section className="testimonial-section" id="testimonios"><div className="home-shell"><SectionTitle eyebrow="Resultados reales" title="Cuando tu voz cambia, también cambia tu confianza" /><div className="testimonial-grid"><TestimonialCard featured quote="En una semana empecé a sonar más clara y segura." name="Valentina R." /><TestimonialCard quote="Ahora pronuncio palabras que antes evitaba." name="Mariana G." /><TestimonialCard quote="Me ayudó a hablar con menos miedo y más claridad." name="Daniel P." /></div><div className="proof-badge"><span>✓</span> Método probado</div></div></section>

    <section className="cta-section"><div className="home-shell cta-card reveal"><CrownMark /><p>Tu siguiente nivel comienza con tu voz</p><h2>Transforma tu forma de hablar inglés</h2><p>Entra al sprint de pronunciación acelerada y empieza a entrenar tu voz con claridad, ritmo y confianza.</p><div className="home-actions"><ButtonPrimary href="#inscripcion">Inscríbete ahora</ButtonPrimary><ButtonSecondary href="/marketplace">Ver programa</ButtonSecondary></div><small>Cupos limitados · Entrenamiento personalizado · 1 semana</small></div></section>

    <section className="form-section" id="inscripcion"><div className="home-shell form-layout"><div><SectionTitle light eyebrow="Reserva tu lugar" title="Tu voz está lista. ¿Empezamos?" copy="Completa tus datos y elige el horario de tus tres sesiones guiadas." /><div className="form-points"><span>✓ Acceso inmediato</span><span>✓ Acompañamiento 1 a 1</span><span>✓ Feedback personalizado</span></div></div><FormCard /></div></section>
    <footer className="home-footer"><div className="home-shell"><BrandLockup /><nav aria-label="Navegación del footer"><Link href="#metodo">Método</Link><Link href="#sprint">Sound Sprint</Link><Link href="#beneficios">Beneficios</Link><Link href="#inscripcion">Contacto</Link></nav><p>© 2026 LANCELOT. Todos los derechos reservados.</p></div></footer>
    <div className="mobile-sticky"><ButtonPrimary href="#inscripcion">Inscríbete ahora</ButtonPrimary></div>
  </main>;
}
