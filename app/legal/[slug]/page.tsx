import { notFound } from "next/navigation";
import { legalPages, type LegalPageSlug } from "@/lib/marketplace/legal";

type LegalPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const page = legalPages[slug as LegalPageSlug];
  if (!page) notFound();

  return (
    <main className="page shell legal-page">
      <p className="eyebrow">Legal</p>
      <h1>{page.title}</h1>
      <div className="legal-doc">
        {page.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </main>
  );
}
