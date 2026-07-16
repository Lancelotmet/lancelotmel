import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";

export const metadata: Metadata = {
  title: "LANCELOT Sound Sprint | Pronunciación acelerada",
  description: "Entrena tu pronunciación americana en 3 sesiones de 20 minutos y habla inglés con más claridad y confianza."
};

export default function SoundSprintPage() {
  return <HomePage />;
}
