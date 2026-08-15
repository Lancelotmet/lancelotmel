import { SpellingLab } from "@/components/spelling-lab/SpellingLab";
import { authenticatedLearner } from "@/lib/portal/authenticated-learner";

export default async function SpellingLabPage() {
  const learner = await authenticatedLearner("/portal/the-small-trip/spelling-lab", "spelling_lab");
  return <SpellingLab {...learner} />;
}
