import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "LANCELOT | Metodología para aprender distinto",
  description: "Una metodología de aprendizaje profundo para comprender, pensar y aplicar conocimiento en idiomas, academia, empresa y vida."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
