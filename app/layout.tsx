import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "LANCELOT | Infraestructura de Transformación del Aprendizaje",
  description: "LANCELOT integra IA educativa, metacognición y ciencias del aprendizaje para convertir conocimiento en autonomía, criterio y transformación humana."
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
