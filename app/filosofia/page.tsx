import type { Metadata } from "next";
import { PhilosophyFlipbook } from "@/components/philosophy/PhilosophyFlipbook";
import { getPhilosophyLibrary } from "@/lib/philosophy-library";

export const metadata: Metadata = {
  title: "La filosofía Lancelot | Biblioteca de lectura",
  description: "Los cuatro volúmenes de la filosofía, estrategia, lenguaje y cultura de Lancelot en una experiencia de lectura web."
};

export default function FilosofiaPage() {
  return <PhilosophyFlipbook volumes={getPhilosophyLibrary()} />;
}
