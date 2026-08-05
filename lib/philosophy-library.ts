import { readFileSync } from "node:fs";
import path from "node:path";

export type PhilosophyVolume = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  source: string;
  content: string;
};

const volumeDefinitions = [
  { id: "filosofia", number: "I", title: "La filosofía de Lancelot", subtitle: "El nacimiento de una nueva manera de aprender", source: "LANCELOT_Volumen_I_Filosofia.md" },
  { id: "estrategia", number: "II", title: "Estrategia de marca", subtitle: "Una filosofía del aprendizaje convertida en referente", source: "LANCELOT_Volumen_II_Estrategia_de_Marca.md" },
  { id: "lenguaje", number: "III", title: "Arquitectura del lenguaje", subtitle: "Cómo una organización enseña incluso cuando habla", source: "LANCELOT_Volumen_III_Arquitectura_del_Lenguaje_del_Aprendizaje.md" },
  { id: "cultura", number: "IV", title: "La cultura del aprendizaje", subtitle: "Personas capaces de transformar el mundo", source: "LANCELOT_Volumen_IV_Cultura_del_Aprendizaje.md" }
] as const;

export function getPhilosophyLibrary(): PhilosophyVolume[] {
  return volumeDefinitions.map((volume) => ({
    ...volume,
    content: readFileSync(path.join(process.cwd(), "content", "philosophy", volume.source), "utf8")
  }));
}
