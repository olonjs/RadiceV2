import { useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { isAdminPath, patchHistoryNavigation } from '@/lib/spp/renderClient';
import type { MenuConfig, PageConfig, SiteConfig } from '@/types';

const MAX_RETRIES = 2;

type ContentResponse = {
  ok?: boolean;
  siteConfig?: unknown;
  pages?: unknown;
  menuConfig?: unknown;
  error?: string;
  code?: string;
  correlationId?: string;
  contentStatus?: string;
};

type CloudLoadFailure = {
  reasonCode: string;
  message: string;
  correlationId?: string;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function backoffDelayMs(attempt: number): number {
  return 250 * Math.pow(2, attempt) + Math.floor(Math.random() * 120);
}

function cloudFingerprint(apiBase: string, apiKey: string): string {
  return `${apiBase.trim().replace(/\/+$/, '')}::${apiKey.slice(-8)}`;
}

function extractContentSources(payload: ContentResponse | Record<string, unknown>): {
  pagesSource: unknown;
  siteSource: unknown;
  menuSource: unknown;
} {
  if (isObjectRecord(payload) && isObjectRecord(payload.pages)) {
    return {
      pagesSource: payload.pages,
      siteSource: payload.siteConfig,
      menuSource: payload.menuConfig,
    };
  }
  return { pagesSource: payload, siteSource: null, menuSource: null };
}

function coerceSiteConfig(value: unknown): SiteConfig | null {
  if (!isObjectRecord(value)) return null;
  if (!isObjectRecord(value.identity)) return null;
  return value as unknown as SiteConfig;
}

function coercePageConfig(_slug: string, value: unknown): PageConfig | null {
  if (!isObjectRecord(value) || !Array.isArray(value.sections)) return null;
  return value as unknown as PageConfig;
}

function toPagesRecord(value: unknown): Record<string, PageConfig> | null {
  if (!isObjectRecord(value)) return null;
  const normalized: Record<string, PageConfig> = {};
  for (const [key, raw] of Object.entries(value)) {
    const slug = key.replace(/^\/+|\/+$/g, '') || 'home';
    const page = coercePageConfig(slug, raw);
    if (page) normalized[slug] = page;
  }
  return Object.keys(normalized).length > 0 ? normalized : null;
}

async function fetchLegacyCloudContentPayload(
  apiCandidates: string[],
  apiKey: string,
  signal: AbortSignal,
): Promise<ContentResponse> {
  let payload: ContentResponse | null = null;
  let lastFailure: CloudLoadFailure | null = null;

  for (const apiBase of apiCandidates) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        const res = await fetch(`${apiBase}/content`, {
          method: 'GET',
          cache: 'no-store',
          headers: { Authorization: `Bearer ${apiKey}` },
          signal,
        });

        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        if (!contentType.includes('application/json')) {
          lastFailure = {
            reasonCode: 'NON_JSON_RESPONSE',
            message: `Non-JSON response from ${apiBase}/content`,
          };
          break;
        }

        const parsed = (await res.json().catch(() => ({}))) as ContentResponse;
        if (!res.ok) {
          lastFailure = {
            reasonCode: parsed.code || `HTTP_${res.status}`,
            message: parsed.error || `Cloud content read failed: ${res.status}`,
            correlationId: parsed.correlationId,
          };
          if (isRetryableStatus(res.status) && attempt < MAX_RETRIES) {
            await sleep(backoffDelayMs(attempt));
            continue;
          }
          break;
        }

        payload = parsed;
        break;
      } catch (error: unknown) {
        if (signal.aborted) throw error;
        const message = error instanceof Error ? error.message : 'Network error';
        lastFailure = {
          reasonCode: 'NETWORK_TRANSIENT',
          message: `${message} (${apiBase}/content)`,
        };
        if (attempt < MAX_RETRIES) {
          await sleep(backoffDelayMs(attempt));
          continue;
        }
      }
    }
    if (payload) break;
  }

  if (!payload) {
    throw (
      lastFailure ?? {
        reasonCode: 'CLOUD_ENDPOINT_UNREACHABLE',
        message: 'Cloud content endpoint not reachable as JSON.',
      }
    );
  }

  return payload;
}

type UseAdminStudioContentOptions = {
  enabled: boolean;
  basePath: string;
  apiCandidates: string[];
  apiKey: string;
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

/** Studio `/admin` loads legacy `/content` (all pages). Visitor uses `/render` — never mix the two. */
export function useAdminStudioContent({
  enabled,
  basePath,
  apiCandidates,
  apiKey,
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

      inFlightRef.current = fetchLegacyCloudContentPayload(apiCandidates, apiKey, controller.signal)
        .then((payload) => {
          const { pagesSource, siteSource, menuSource } = extractContentSources(payload);
          const remotePages = toPagesRecord(pagesSource);
          const remoteSite = coerceSiteConfig(siteSource);
          const remotePageCount = remotePages ? Object.keys(remotePages).length : 0;
          if (remotePageCount === 0 && !remoteSite) {
            throw new Error('Cloud payload is empty for Studio bootstrap.');
          }
          if (remotePages && remotePageCount > 0) setPages(remotePages);
          if (remoteSite) setSiteConfig(remoteSite);
          if (menuSource && isObjectRecord(menuSource)) {
            setMenuConfig(menuSource as MenuConfig);
          }
          writeCache({
            keyFingerprint: fingerprint,
            savedAt: Date.now(),
            siteConfig: remoteSite ?? null,
            menuConfig: menuSource ?? null,
            pages: (remotePages ?? {}) as Record<string, unknown>,
          });
          loadedRef.current = true;
        })
        .catch((error: unknown) => {
          if (import.meta.env.DEV) {
            console.warn('[admin-studio] legacy content sync failed', error);
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
  }, [enabled, basePath, apiCandidates, apiKey, setPages, setSiteConfig, setMenuConfig, writeCache, onBootstrapResolved]);
}
