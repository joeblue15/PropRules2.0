import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-[var(--border)] mt-16 py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            {(["about", "privacy", "cookies", "terms", "contact"] as const).map((key) => (
              <a
                key={key}
                href="#"
                className="text-xs text-[var(--muted-2)] hover:text-[var(--muted)] transition-colors"
              >
                {t(key)}
              </a>
            ))}
          </div>
          <p className="text-xs text-[var(--muted-2)]">
            © {new Date().getFullYear()} PropRules. {t("rights")}
          </p>
        </div>
        <p className="mt-4 text-[11px] text-[var(--muted-2)] leading-relaxed max-w-2xl">
          {t("disclaimer")}
        </p>
      </div>
    </footer>
  );
}
