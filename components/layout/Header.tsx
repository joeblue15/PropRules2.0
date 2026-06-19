"use client";
import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { Search, Moon, Sun, Globe, Menu, X } from "lucide-react";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
  searchQuery?: string;
  onSearch?: (q: string) => void;
}

export function Header({ searchQuery = "", onSearch }: HeaderProps) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchQuery);
  const searchRef = useRef<HTMLInputElement>(null);

  const otherLocale = locale === "es" ? "en" : "es";

  function switchLocale() {
    router.replace(pathname, { locale: otherLocale as "es" | "en" });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    onSearch?.(searchValue);
  }

  return (
    <>
      <header className="sticky top-0 z-40 h-14 bg-[var(--surface)] border-b border-[var(--border)] flex items-center px-4 md:px-6 gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 mr-2">
          <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight">
            <span className="text-[var(--foreground)]">Prop</span>
            <span className="text-[var(--accent)]">Rules</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/#cfd"
            className="px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors rounded-md hover:bg-[var(--surface-hover)]"
          >
            {t("cfd")}
          </Link>
          <Link
            href="/#futuros"
            className="px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors rounded-md hover:bg-[var(--surface-hover)]"
          >
            {t("futures")}
          </Link>
        </nav>

        {/* Search — desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-64 items-center gap-2 bg-[var(--background)] border border-[var(--border)] rounded-md px-3 h-8">
          <Search className="w-3.5 h-3.5 text-[var(--muted-2)] flex-shrink-0" />
          <input
            ref={searchRef}
            type="search"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder={t("search")}
            className="flex-1 text-xs bg-transparent outline-none text-[var(--foreground)] placeholder:text-[var(--muted-2)]"
          />
        </form>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Locale switch */}
          <button
            onClick={switchLocale}
            className="hidden md:flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors px-2 py-1.5 rounded-md hover:bg-[var(--surface-hover)] border border-[var(--border)]"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="uppercase font-medium">{otherLocale}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
            aria-label="Toggle theme"
          >
            <Sun className="w-3.5 h-3.5 hidden dark:block" />
            <Moon className="w-3.5 h-3.5 block dark:hidden" />
          </button>

          {/* Login */}
          <LoginButton />

          {/* Mobile menu */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)]"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[var(--surface)] border-l border-[var(--border)] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <span className="text-sm font-medium">Menú</span>
              <button onClick={() => setDrawerOpen(false)}>
                <X className="w-4 h-4 text-[var(--muted)]" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1">
              <Link href="/#cfd" onClick={() => setDrawerOpen(false)} className="px-3 py-2.5 text-sm text-[var(--foreground)] rounded-md hover:bg-[var(--surface-hover)]">
                {t("cfd")}
              </Link>
              <Link href="/#futuros" onClick={() => setDrawerOpen(false)} className="px-3 py-2.5 text-sm text-[var(--foreground)] rounded-md hover:bg-[var(--surface-hover)]">
                {t("futures")}
              </Link>
            </nav>
            <div className="mt-auto p-4 border-t border-[var(--border)] flex items-center justify-between">
              <button onClick={switchLocale} className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                <Globe className="w-3.5 h-3.5" />
                <span className="uppercase font-medium">{otherLocale}</span>
              </button>
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-8 h-8 flex items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)]">
                <Sun className="w-3.5 h-3.5 hidden dark:block" />
                <Moon className="w-3.5 h-3.5 block dark:hidden" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LoginButton() {
  const t = useTranslations("nav");
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function check() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data.user) setUser({ email: data.user.email ?? "" });
      } finally {
        setLoading(false);
      }
    }
    check();
  }, []);

  async function signOut() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  if (loading) return <div className="w-8 h-8 rounded-full bg-[var(--border)] animate-pulse" />;

  if (user) {
    return (
      <button
        onClick={signOut}
        className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold uppercase"
        title={user.email}
      >
        {user.email[0]}
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push("/dashboard/login")}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--accent)] hover:opacity-90 transition-opacity text-white"
      title={t("login")}
      aria-label={t("login")}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
        <polyline points="10 17 15 12 10 7"/>
        <line x1="15" y1="12" x2="3" y2="12"/>
      </svg>
    </button>
  );
}
