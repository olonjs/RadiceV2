import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Moon, Sun } from 'lucide-react';
import { isInAppPathHref } from '@/lib/isInAppPathHref';
import type { HeaderData, HeaderSettings } from './types';

export const Header: React.FC<{ data: HeaderData; settings: HeaderSettings }> = ({ data }) => {
  const navItems = Array.isArray(data.menu) ? data.menu : [];
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    if (current === 'dark' || current === 'light') {
      setTheme(current);
      return;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dark' : 'light';
    root.setAttribute('data-theme', initialTheme);
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    setTheme(nextTheme);
  };

  const navItemClass = "font-primary text-xs uppercase tracking-[0.1em] text-[var(--local-text)] transition-colors hover:text-[var(--local-primary)]";
  const ctaButtonClass = "h-auto rounded-none border border-[var(--local-text)] bg-[var(--local-text)] px-4 py-2.5 text-xs uppercase tracking-[0.1em] text-[var(--local-bg)] transition-colors hover:border-[var(--local-primary)] hover:bg-[var(--local-primary)]";
  
  return (
    <header
      style={{
        '--local-bg': 'var(--background)',
        '--local-text': 'var(--foreground)',
        '--local-border': 'var(--border)',
        '--local-primary': 'var(--primary)',
      } as React.CSSProperties}
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[var(--local-bg)]/80 backdrop-blur-md border-b border-[var(--local-border)]' : 'bg-transparent'}`}
    >
      <div className="mx-auto flex h-24 max-w-[1280px] items-center justify-between px-6 md:px-12">
        <Link to="/" viewTransition className="flex items-center" aria-label="Radice Home">
          <span className="font-display text-3xl font-bold tracking-tight text-[var(--local-text)]" data-jp-field="logoText">
            {data.logoText}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.filter(item => !item.isCta).map((item, idx) =>
            isInAppPathHref(item.href) ? (
              <Link key={item.id || `nav-${idx}`} to={item.href} viewTransition className={navItemClass + ' px-4 py-2'}>
                {item.label}
              </Link>
            ) : (
              <a key={item.id || `nav-${idx}`} href={item.href} className={navItemClass + ' px-4 py-2'}>
                {item.label}
              </a>
            )
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {navItems.filter(item => item.isCta).map((item, idx) =>
            isInAppPathHref(item.href) ? (
              <Link key={item.id || `cta-${idx}`} to={item.href} viewTransition className={ctaButtonClass}>
                {item.label}
              </Link>
            ) : (
              <a key={item.id || `cta-${idx}`} href={item.href} className={ctaButtonClass}>
                {item.label}
              </a>
            )
          )}
          <Button type="button" variant="ghost" onClick={toggleTheme} size="icon" className="h-10 w-10 rounded-none hover:bg-[var(--local-bg)]">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button type="button" variant="ghost" onClick={toggleTheme} size="icon" className="h-10 w-10 rounded-none hover:bg-transparent">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none hover:bg-transparent">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full border-none bg-[var(--background)] text-[var(--foreground)]">
              <nav className="mt-16 flex flex-col items-center justify-center gap-8 text-center">
                {navItems.map((item, idx) =>
                  isInAppPathHref(item.href) ? (
                    <Link key={item.id || `mobile-${idx}`} to={item.href} viewTransition className={`font-display text-3xl ${item.isCta ? 'text-[var(--primary)]' : ''}`}>
                      {item.label}
                    </Link>
                  ) : (
                    <a key={item.id || `mobile-${idx}`} href={item.href} className={`font-display text-3xl ${item.isCta ? 'text-[var(--primary)]' : ''}`}>
                      {item.label}
                    </a>
                  )
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
