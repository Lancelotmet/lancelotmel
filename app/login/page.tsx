import Link from "next/link";
import { Suspense } from "react";
import { LoginClient } from "@/components/marketplace/LoginClient";

export default function LoginPage() {
  return (
    <main className="lancelot-login-page">
      <header className="portal-nav login-nav">
        <Link className="portal-brand" href="/" aria-label="Volver a Lancelot"><img src="/brand/lancelot-logo-official.png" alt="Lancelot" /></Link>
        <Link className="portal-back-link" href="/">← Volver a Lancelot</Link>
      </header>
      <section className="login-stage">
        <div className="login-intro">
          <p className="portal-kicker">Portal de idiomas Lancelot</p>
          <h1>Entra por la escena que hoy te quiere enseñar algo.</h1>
          <p>Explora bloques por contexto, elige la práctica que necesitas y agenda acompañamiento cuando una conversación merezca más tiempo.</p>
          <blockquote>El conocimiento no completa al ser humano. Lo revela.</blockquote>
        </div>
        <div className="login-card-wrap">
          <p className="portal-kicker">Tu acceso</p>
          <h2>Continúa tu experiencia.</h2>
          <Suspense fallback={<p className="status info">Preparando acceso…</p>}>
            <LoginClient />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
