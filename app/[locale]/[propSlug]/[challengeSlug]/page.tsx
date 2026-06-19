import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RulesTabs } from "@/components/rules/RulesTabs";
import { DiscountBar } from "@/components/rules/DiscountBar";
import { Badge } from "@/components/ui/Badge";
import { getProp, getChallenge } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string; propSlug: string; challengeSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, propSlug, challengeSlug } = await params;
  const prop = await getProp(propSlug);
  const challenge = await getChallenge(propSlug, challengeSlug);
  if (!prop || !challenge) return {};
  return {
    title: `${prop.name} ${challenge.name} — PropRules`,
    description: challenge.description,
  };
}

export default async function ChallengePage({ params }: PageProps) {
  const { locale, propSlug, challengeSlug } = await params;
  const t = await getTranslations({ locale, namespace: "rules" });

  const [prop, challenge] = await Promise.all([
    getProp(propSlug),
    getChallenge(propSlug, challengeSlug),
  ]);

  if (!prop || !challenge) notFound();

  const discount = prop.discount && prop.discount.active ? prop.discount : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 pt-6 pb-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[var(--muted-2)] mb-6">
          <Link href="/" className="hover:text-[var(--muted)] transition-colors">
            {t("../breadcrumb.home")}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--muted)]">{prop.name}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--foreground)]">{challenge.name}</span>
        </nav>

        {/* Prop header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 overflow-hidden">
            {prop.logo_url ? (
              <Image src={prop.logo_url} alt={prop.name} width={44} height={44} className="object-contain" />
            ) : (
              <span className="text-xs font-bold text-[var(--muted)] uppercase">{prop.name.slice(0, 3)}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-lg font-semibold text-[var(--foreground)]">{prop.name}</h1>
              {prop.badge_text && prop.badge_color && (
                <Badge text={prop.badge_text} color={prop.badge_color} />
              )}
            </div>
            <p className="text-sm text-[var(--muted)]">{challenge.name}</p>
            {challenge.last_updated && (
              <p className="text-xs text-[var(--muted-2)] mt-0.5">
                {t("lastUpdated", { date: formatDate(challenge.last_updated, locale) })}
              </p>
            )}
          </div>
        </div>

        {/* Tags */}
        {challenge.tags && challenge.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {challenge.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Discount bar */}
        {discount && (
          <div className="mb-6">
            <DiscountBar discount={discount} propName={prop.name} />
          </div>
        )}

        {/* Rules tabs */}
        <RulesTabs challenge={challenge} />

        {/* Report change */}
        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--muted-2)]">
            {challenge.last_updated && (
              <>{t("lastUpdated", { date: formatDate(challenge.last_updated, locale) })} · </>
            )}
            <a href="mailto:hola@proprules.pro" className="hover:text-[var(--muted)] transition-colors underline underline-offset-2">
              {t("reportChange")}
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
