import type { PageConfig } from '@/types';
import { isInAppPathHref } from '@/lib/isInAppPathHref';
import { isAdminPath } from '@/lib/spp/renderClient';
import { isPageLoadedInRegistry } from '@/lib/spp/sppRouteRegistry';

export type SppNavigationGuardOptions = {
  basePath: string;
  isActive: () => boolean;
  isBusy: () => boolean;
  getPages: () => Record<string, PageConfig>;
  loadRenderPath: (pathname: string) => Promise<boolean>;
  onLoadStart: () => void;
  onLoadEnd: () => void;
  onNavigateComplete?: () => void;
};

function resolveAnchorPathname(anchor: HTMLAnchorElement): string {
  const url = new URL(anchor.href, window.location.origin);
  return url.pathname + url.search + url.hash;
}

export function completeSppClientNavigation(
  targetPath: string,
  onComplete?: () => void,
): void {
  const commit = () => {
    window.history.pushState(window.history.state, '', targetPath);
    window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
    onComplete?.();
  };

  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    document.startViewTransition(commit);
  } else {
    commit();
  }
}

export function installSppNavigationGuard(options: SppNavigationGuardOptions): () => void {
  const handler = (event: MouseEvent) => {
    if (!options.isActive()) return;
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const anchor = target.closest('a[href]');
    if (!(anchor instanceof HTMLAnchorElement)) return;
    if (anchor.target && anchor.target !== '_self') return;

    const rawHref = anchor.getAttribute('href');
    if (!isInAppPathHref(rawHref)) return;

    const targetPath = resolveAnchorPathname(anchor);
    if (isAdminPath(targetPath, options.basePath)) return;

    if (options.isBusy()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (isPageLoadedInRegistry(options.getPages(), targetPath, options.basePath)) return;

    event.preventDefault();
    event.stopPropagation();

    options.onLoadStart();
    void options
      .loadRenderPath(targetPath)
      .then((ok) => {
        if (!ok) return;
        completeSppClientNavigation(targetPath, options.onNavigateComplete);
      })
      .finally(() => options.onLoadEnd());
  };

  document.addEventListener('click', handler, true);
  return () => document.removeEventListener('click', handler, true);
}
