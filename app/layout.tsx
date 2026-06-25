import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "LANCELOT Academic Marketplace",
  description: "Premium academic downloads and live LANCELOT learning experiences."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="topbar market-topbar">
          <div className="shell topbar-inner">
            <Link className="brand" href="/">
              <span className="brand-mark">L</span>
              <span>LANCELOT</span>
            </Link>
            <nav className="nav" aria-label="Navegacion principal">
              <Link href="/">Home</Link>
              <Link href="/marketplace">Marketplace</Link>
              <Link href="/marketplace?category=english">English</Link>
              <Link href="/marketplace?kind=bundle">Bundles</Link>
              <Link href="/marketplace/free-resources">Free Resources</Link>
              <Link href="/my-library">My Library</Link>
              <Link href="/admin/products">Admin</Link>
              <Link href="/login">Login</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="footer">
          <div className="shell footer-grid">
            <div>
              <strong>LANCELOT</strong>
              <p>Not just downloads. Guided learning experiences.</p>
            </div>
            <nav aria-label="Footer">
              <Link href="/legal/terms-of-use">Terms of Use</Link>
              <Link href="/legal/license">License</Link>
              <Link href="/legal/privacy">Privacy Policy</Link>
              <Link href="/legal/live-class-policy">Live Class Policy</Link>
              <Link href="/legal/copyright">Copyright Notice</Link>
              <Link href="/citas">Legacy appointments</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
