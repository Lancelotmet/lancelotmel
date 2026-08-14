import { notFound } from "next/navigation";
import { GrammarCapsulePlayer } from "@/components/grammar/GrammarPlay";
import { capsuleBySlug } from "@/lib/grammar/curriculum";
import { authenticatedLearner } from "@/lib/portal/authenticated-learner";

export default async function GrammarCapsulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!capsuleBySlug(slug)) notFound();
  const learner = await authenticatedLearner(`/portal/grammar/capsule/${encodeURIComponent(slug)}`);
  return <GrammarCapsulePlayer {...learner} slug={slug} />;
}
