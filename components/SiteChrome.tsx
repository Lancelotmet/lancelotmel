"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/sound-sprint") return children;

  return <>
    <header className="topbar market-topbar"><div className="shell topbar-inner"><Link className="brand" href="/"><span className="brand-mark">L</span><span>LANCELOT</span></Link><nav className="nav" aria-label="Navegación principal"><Link href="/">Inicio</Link><Link href="/marketplace">Marketplace</Link><Link href="/marketplace?category=english">English</Link><Link href="/marketplace?kind=bundle">Bundles</Link><Link href="/my-library">Mi biblioteca</Link><Link href="/login">Ingresar</Link></nav></div></header>
    {children}
    <footer className="footer"><div className="shell footer-grid"><div><strong>LANCELOT</strong><p>Desde el ser para el saber.</p></div><nav aria-label="Footer"><Link href="/legal/terms-of-use">Términos</Link><Link href="/legal/license">Licencia</Link><Link href="/legal/privacy">Privacidad</Link><Link href="/legal/live-class-policy">Clases en vivo</Link><Link href="/legal/copyright">Copyright</Link></nav></div></footer>
  </>;
}
