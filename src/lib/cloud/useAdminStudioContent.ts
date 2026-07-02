import { useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  fetchRenderProjection,
  isAdminPath,
  listAdminRenderPaths,
  patchHistoryNavigation,
  resolveRegistrySlugFromRender,
} from '@/lib/spp/renderClient';
import type { MenuConfig, PageConfig, SiteConfig } from '@/types';

const MAX_RETRIES = 2;

function cloudFingerprint(apiBase: string, apiKey: string): string {
  return `${apiBase.trim().replace(/\/+$/, '')}::${apiKey.slice(-8)}`;
}

type UseAdminStudioContentOptions = {
  enabled: boolean;
  basePath: string;
  apiCandidates: string[];
  apiKey: string;
  pageRegistry: Record<string, unknown>;
  setPages: Dispatch<SetStateAction<Record<string, PageConfig>>>;
  setSiteConfig: Dispatch<SetStateAction<SiteConfig>>;
  setMenuConfig: Dispatch<SetStateAction<MenuConfig>>;
  writeCache: (entry: {
    keyFingerprint: string;
    savedAt: number;
    siteConfig: unknown | null;
    menuConfig?: unknown | null;
    pages: Record<string, unknown>;
  }) => void;
  onBootstrapResolved?: () => void;
};

/** Studio `/admin` fan-out: GET /render per static page path. Visitor uses single-path render — never mix `/content`. */
export function useAdminStudioContent({
  enabled,
  basePath,
  apiCandidates,
  apiKey,
  pageRegistry,
  setPages,
  setSiteConfig,
  setMenuConfig,
  writeCache,
  onBootstrapResolved,
}: UseAdminStudioContentOptions) {
  const loadedRef = useRef(false);
  const inFlightRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!enabled || apiCandidates.length === 0 || !apiKey.trim()) return;

    const syncIfAdmin = () => {
      if (!isAdminPath(window.location.pathname, basePath)) return;
      if (loadedRef.current) {
        onBootstrapResolved?.();
        return;
      }
      if (inFlightRef.current) return;

      const controller = new AbortController();
      const fingerprint = cloudFingerprint(apiCandidates[0]!, apiKey);
      const renderPaths = listAdminRenderPaths(pageRegistry);

      inFlightRef.current = (async () => {
        const mergedPages: Record<string, PageConfig> = {};
        let remoteSite: SiteConfig | null = null;
        let remoteMenu: MenuConfig | null = null;

        const results = await Promise.allSettled(
          renderPaths.map((path) =>
            fetchRenderProjection(apiCandidates, apiKey, path, {
              signal: controller.signal,
              maxRetryAttempts: MAX_RETRIES,
            }),
          ),
        );

        for (const result of results) {
          if (result.status !== 'fulfilled' || !result.value.ok || !result.value.page) continue;

          const registrySlug = resolveRegistrySlugFromRender(result.value.page);
          mergedPages[registrySlug] = result.value.page;

          if (!remoteSite && result.value.context?.siteConfig) {
            remoteSite = result.value.context.siteConfig;
          }
          if (!remoteMenu && result.value.context?.menuConfig) {
            remoteMenu = result.value.context.menuConfig;
          }
        }

        const pageCount = Object.keys(mergedPages).length;
        if (pageCount === 0) {
          throw new Error('Admin render fan-out returned no pages.');
        }

        setPages((prev) => ({ ...prev, ...mergedPages }));
        if (remoteSite) setSiteConfig(remoteSite);
        if (remoteMenu) setMenuConfig(remoteMenu);

        writeCache({
          keyFingerprint: fingerprint,
          savedAt: Date.now(),
          siteConfig: remoteSite,
          menuConfig: remoteMenu,
          pages: mergedPages as Record<string, unknown>,
        });
        loadedRef.current = true;
      })()
        .catch((error: unknown) => {
          if (import.meta.env.DEV) {
            console.warn('[admin-studio] render fan-out failed', error);
          }
        })
        .finally(() => {
          inFlightRef.current = null;
          onBootstrapResolved?.();
        });
    };

    syncIfAdmin();
    const unpatch = patchHistoryNavigation(syncIfAdmin);
    return () => {
      unpatch();
      inFlightRef.current = null;
    };
  }, [
    enabled,
    basePath,
    apiCandidates,
    apiKey,
    pageRegistry,
    setPages,
    setSiteConfig,
    setMenuConfig,
    writeCache,
    onBootstrapResolved,
  ]);
}
