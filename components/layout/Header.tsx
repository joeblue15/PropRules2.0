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
          <GoogleLoginButton />

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

function GoogleLoginButton() {
  const t = useTranslations("nav");
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

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

  async function signIn() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

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
      onClick={signIn}
      className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[var(--border)] hover:opacity-90 transition-opacity"
      title={t("login")}
      aria-label={t("login")}
    >
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    </button>
  );
}
