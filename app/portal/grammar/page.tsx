import { GrammarCatalog } from "@/components/grammar/GrammarPlay";
import { GrammarLevel } from "@/lib/grammar/types";
import { authenticatedLearner } from "@/lib/portal/authenticated-learner";

const grammarLevels: GrammarLevel[] = ["A1", "A2", "B1", "B2", "C1"];

export default async function GrammarPage({ searchParams }: { searchParams: Promise<{ level?: string; block?: string }> }) {
  const params = await searchParams;
  const learner = await authenticatedLearner(`/portal/grammar${params.level ? `?level=${encodeURIComponent(params.level)}` : ""}`);
  const initialLevel = grammarLevels.includes(params.level as GrammarLevel) ? params.level as GrammarLevel : undefined;
  return <GrammarCatalog {...learner} initialLevel={initialLevel} block={params.block} />;
}
