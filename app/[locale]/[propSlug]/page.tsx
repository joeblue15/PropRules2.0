import { redirect } from "next/navigation";
import { getProp } from "@/lib/data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ locale: string; propSlug: string }>;
}

export default async function PropPage({ params }: PageProps) {
  const { locale, propSlug } = await params;
  const prop = await getProp(propSlug);

  if (!prop) notFound();

  const activeChallenges = prop.challenges?.filter((c) => c.active) ?? [];

  if (activeChallenges.length === 1) {
    redirect(`/${locale}/${propSlug}/${activeChallenges[0].slug}`);
  }

  // Multiple challenges: redirect to home with modal trigger
  // The modal is handled client-side from PropList
  redirect(`/${locale}/#cfd`);
}
