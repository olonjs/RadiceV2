import { useCallback, useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  fetchRenderProjection,
  isAdminPath,
  patchHistoryNavigation,
  registrySlugToRenderPath,
  resolveAdminSlugFromPathname,
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
  setPages: Dispatch<SetStateAction<Record<string, PageConfig>>>;
  setSiteConfig: Dispatch<SetStateAction<SiteConfig>>;
  setMenuConfig: Dispatch<SetStateAction<MenuConfig>>;
  readCache: () => {
    keyFingerprint: string;
    savedAt: number;
    siteConfig: unknown | null;
    menuConfig?: unknown | null;
    pages: Record<string, unknown>;
  } | null;
  writeCache: (entry: {
    keyFingerprint: string;
    savedAt: number;
    siteConfig: unknown | null;
    menuConfig?: unknown | null;
    pages: Record<string, unknown>;
  }) => void;
  onBootstrapResolved?: () => void;
};

/** Studio `/admin`: one GET /render for the active admin page; refetch when the page changes. */
export function useAdminStudioContent({
  enabled,
  basePath,
  apiCandidates,
  apiKey,
  setPages,
  setSiteConfig,
  setMenuConfig,
  readCache,
  writeCache,
  onBootstrapResolved,
}: UseAdminStudioContentOptions) {
  const bootstrapResolvedRef = useRef(false);
  const fetchControllerRef = useRef<AbortController | null>(null);

  const loadAdminPage = useCallback(
    async (pathname: string, options?: { signal?: AbortSignal }) => {
      const slug = resolveAdminSlugFromPathname(pathname, basePath);
      const fingerprint = cloudFingerprint(apiCandidates[0]!, apiKey);
      const cached = readCache();
      const renderPath = registrySlugToRenderPath(slug);

      try {
        const result = await fetchRenderProjection(apiCandidates, apiKey, renderPath, {
          signal: options?.signal,
          maxRetryAttempts: MAX_RETRIES,
        });

        if (!result.ok || !result.page) {
          throw new Error(result.error || `Render failed for admin page "${slug}".`);
        }

        const registrySlug = resolveRegistrySlugFromRender(result.page);
        setPages((prev) => ({ ...prev, [registrySlug]: result.page! }));
        if (result.context?.siteConfig) setSiteConfig(result.context.siteConfig);
        if (result.context?.menuConfig) setMenuConfig(result.context.menuConfig);

        writeCache({
          keyFingerprint: fingerprint,
          savedAt: Date.now(),
          siteConfig: result.context?.siteConfig ?? cached?.siteConfig ?? null,
          menuConfig: result.context?.menuConfig ?? cached?.menuConfig ?? null,
          pages: {
            ...(cached?.pages ?? {}),
            [registrySlug]: result.page,
          },
        });
      } catch (error: unknown) {
        if (options?.signal?.aborted) return;
        throw error;
      }
    },
    [
      apiCandidates,
      apiKey,
      basePath,
      readCache,
      setMenuConfig,
      setPages,
      setSiteConfig,
      writeCache,
    ],
  );

  useEffect(() => {
    if (!enabled || apiCandidates.length === 0 || !apiKey.trim()) return;

    const syncAdminPage = (pathname: string) => {
      if (!isAdminPath(pathname, basePath)) return;

      fetchControllerRef.current?.abort();
      const controller = new AbortController();
      fetchControllerRef.current = controller;

      void loadAdminPage(pathname, { signal: controller.signal })
        .catch((error: unknown) => {
          if (import.meta.env.DEV) {
            console.warn('[admin-studio] render load failed', error);
          }
        })
        .finally(() => {
          if (!bootstrapResolvedRef.current) {
            bootstrapResolvedRef.current = true;
            onBootstrapResolved?.();
          }
        });
    };

    syncAdminPage(window.location.pathname);
    const unpatch = patchHistoryNavigation(syncAdminPage);

    return () => {
      fetchControllerRef.current?.abort();
      fetchControllerRef.current = null;
      unpatch();
    };
  }, [enabled, basePath, apiCandidates, apiKey, loadAdminPage, onBootstrapResolved]);
}
