import type { Metadata } from "next";
import { PhilosophyFlipbook } from "@/components/philosophy/PhilosophyFlipbook";
import { getPhilosophyAccess } from "@/lib/philosophy-access";
import { getPhilosophyLibrary } from "@/lib/philosophy-library";

export const metadata: Metadata = {
  title: "La filosofía Lancelot | Biblioteca de lectura",
  description: "Los cuatro volúmenes de la filosofía, estrategia, lenguaje y cultura de Lancelot en una experiencia de lectura web."
};

export const dynamic = "force-dynamic";

export default async function FilosofiaPage() {
  const access = await getPhilosophyAccess();
  return (
    <PhilosophyFlipbook
      isSignedIn={access.isSignedIn}
      volumes={getPhilosophyLibrary(access.canReadRestrictedVolumes)}
    />
  );
}
