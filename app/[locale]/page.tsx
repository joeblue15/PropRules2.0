import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PropList } from "@/components/home/PropList";
import { UpdatesList } from "@/components/home/UpdatesList";
import { getProps, getUpdates, getHeroContent, getSiteSettings } from "@/lib/data";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getSiteSettings();
  return {
    title: locale === "es" ? settings?.seo_title_es : settings?.seo_title_en,
    description: locale === "es" ? settings?.seo_description_es : settings?.seo_description_en,
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  const [cfdProps, futureProps, updates, hero, settings] = await Promise.all([
    getProps("CFD"),
    getProps("Futuros"),
    getUpdates(8),
    getHeroContent(),
    getSiteSettings(),
  ]);

  const heroTitle =
    locale === "es"
      ? hero?.title_es ?? t("heroTitle")
      : hero?.title_en ?? t("heroTitle");

  const showUpdates = (settings?.updates_section_active ?? true) && updates.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 md:px-6 pt-12 pb-8">
        {/* Hero */}
        <section className="mb-12">
          <h1 className="text-2xl md:text-3xl font-semibold text-[var(--foreground)] leading-tight tracking-tight max-w-xl">
            {heroTitle}
          </h1>
        </section>

        {/* CFD Section */}
        {cfdProps.length > 0 && (
          <section id="cfd" className="mb-10">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[var(--foreground)]">{t("cfdTitle")}</h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">{t("cfdSubtitle")}</p>
            </div>
            <PropList props={cfdProps} />
          </section>
        )}

        {/* Futuros Section */}
        {futureProps.length > 0 && (
          <section id="futuros" className="mb-10">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[var(--foreground)]">{t("futuresTitle")}</h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">{t("futuresSubtitle")}</p>
            </div>
            <PropList props={futureProps} />
          </section>
        )}

        {/* Updates Section */}
        {showUpdates && (
          <section className="mt-12 pt-10 border-t border-[var(--border-subtle)]">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[var(--foreground)]">{t("updates")}</h2>
            </div>
            <UpdatesList updates={updates} />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
