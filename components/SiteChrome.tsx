"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/sound-sprint" || pathname === "/orientacion" || pathname === "/filosofia" || pathname === "/idiomas" || pathname === "/login" || pathname === "/portal" || pathname.startsWith("/portal/")) return children;

  return <>
    <header className="topbar market-topbar lancelot-market-chrome"><div className="shell topbar-inner"><Link className="brand lancelot-market-brand" href="/"><LancelotCrownMark /><span className="lancelot-market-lockup"><strong>LANCELOT</strong><small>Desde el ser para el saber</small></span></Link><nav className="nav" aria-label="Navegación principal"><Link href="/">Inicio</Link><Link href="/login?next=/portal">Portal</Link><Link href="/citas">Agenda</Link><Link className="lancelot-market-enter" href="/login?next=/portal">Ingresar <span aria-hidden="true">→</span></Link></nav></div></header>
    {children}
    <footer className="footer"><div className="shell footer-grid"><div><strong>LANCELOT</strong><p>Desde el ser para el saber.</p></div><nav aria-label="Footer"><Link href="/legal/terms-of-use">Términos</Link><Link href="/legal/license">Licencia</Link><Link href="/legal/privacy">Privacidad</Link><Link href="/legal/live-class-policy">Clases en vivo</Link><Link href="/legal/copyright">Copyright</Link></nav></div></footer>
  </>;
}

function LancelotCrownMark() {
  return <span className="lancelot-market-seal" aria-hidden="true"><svg viewBox="0 0 72 40"><path d="M7 30 3 10l16 10L27 4l9 16L45 4l8 16 16-10-4 20H7Z" /><path d="M11 35h50" /></svg></span>;
}
