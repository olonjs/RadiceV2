/**
 * Thin Entry Point (Tenant).
 * Data from getHydratedData (file-backed or draft); assets from public/assets/images.
 * Supports Hybrid Persistence: Local Filesystem (Dev) or Cloud Bridge (Prod).
 */
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
// ADR-0009: visitor route imports the runtime-only engine statically.
// The full @olonjs/core (Studio admin) is loaded on demand only when the
// URL targets /admin (see LazyJsonPagesEngine below).
import { OlonJSEngine } from '@olonjs/core/runtime';
import type { JsonPagesConfig, LibraryImageEntry, ProjectState } from '@olonjs/core/runtime';
import { normalizeBasePath, withBasePath } from '@olonjs/core/runtime';
import { ComponentRegistry } from '@/lib/ComponentRegistry';
import { SECTION_SCHEMAS, SECTION_SUBMISSION_SCHEMAS } from '@/lib/schemas';
import { addSectionConfig } from '@/lib/addSectionConfig';
import { getHydratedData } from '@/lib/draftStorage';
import type { SiteConfig, ThemeConfig, MenuConfig, PageConfig } from '@/types';
import type { DeployPhase, StepId } from '@olonjs/core/runtime';
import { DEPLOY_STEPS } from '@olonjs/core/runtime';
import { startCloudSaveStream } from '@olonjs/core/runtime';
import siteData from '@/data/config/site.json';
import themeData from '@/data/config/theme.json';
import menuData from '@/data/config/menu.json';
import { getFilePages } from '@/lib/getFilePages';
import { DopaDrawer } from '@/components/save-drawer/DopaDrawer';
import { EmptyTenantView } from '@/components/empty-tenant';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeProvider } from '@/components/ThemeProvider';
import { useOlonForms } from '@/lib/useOlonForms';
import { OlonFormsContext } from '@olonjs/core/runtime';
import { iconMap } from '@/lib/IconResolver';
import {
  fetchRenderProjection,
  isAdminPath,
  normalizeRenderPath,
  patchHistoryNavigation,
  resolveRegistrySlugFromRender,
  type RenderProjectionResponse,
} from '@/lib/spp/renderClient';
import { isPageLoadedInRegistry } from '@/lib/spp/sppRouteRegistry';
import {
  completeSppClientNavigation,
  installSppNavigationGuard,
} from '@/lib/spp/sppNavigationGuard';
import { useAdminStudioContent } from '@/lib/cloud/useAdminStudioContent';

import tenantCss from './index.css?inline';

// Cloud Configuration (Injected by Vercel/Netlify Env Vars)
const CLOUD_API_URL =
  import.meta.env.VITE_OLONJS_CLOUD_URL ?? import.meta.env.VITE_JSONPAGES_CLOUD_URL;
const CLOUD_API_KEY =
  import.meta.env.VITE_OLONJS_API_KEY ?? import.meta.env.VITE_JSONPAGES_API_KEY;
const SAVE2REPO_ENABLED = import.meta.env.VITE_SAVE2REPO === 'true';
const APP_BASE_PATH = normalizeBasePath(import.meta.env.BASE_URL || '/');

const themeConfig = themeData as unknown as ThemeConfig;
const menuConfigSeed = menuData as unknown as MenuConfig;

const TENANT_ID = 'radice';

const filePages = getFilePages();
const fileSiteConfig = siteData as unknown as SiteConfig;
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const ASSET_UPLOAD_MAX_RETRIES = 2;
const ASSET_UPLOAD_TIMEOUT_MS = 20_000;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

interface CloudSaveUiState {
  isOpen: boolean;
  phase: DeployPhase;
  currentStepId: StepId | null;
  doneSteps: StepId[];
  progress: number;
  errorMessage?: string;
  deployUrl?: string;
}

type ContentMode = 'cloud' | 'error';

type CachedCloudContent = {
  keyFingerprint: string;
  savedAt: number;
  siteConfig: unknown | null;
  menuConfig?: unknown | null;
  pages: Record<string, unknown>;
};

const CLOUD_CACHE_KEY = 'jp_cloud_content_cache_v1';
const CLOUD_CACHE_TTL_MS = 5 * 60 * 1000;

function normalizeApiBase(raw: string): string {
  return raw.trim().replace(/\/+$/, '');
}

function buildApiCandidates(raw: string): string[] {
  const base = normalizeApiBase(raw);
  const withApi = /\/api\/v1$/i.test(base) ? base : `${base}/api/v1`;
  const candidates = [withApi, base];
  return Array.from(new Set(candidates.filter(Boolean)));
}

function getInitialData() {
  return getHydratedData(TENANT_ID, filePages, fileSiteConfig);
}

function getInitialCloudSaveUiState(): CloudSaveUiState {
  return {
    isOpen: false,
    phase: 'idle',
    currentStepId: null,
    doneSteps: [],
    progress: 0,
  };
}

function stepProgress(doneSteps: StepId[]): number {
  return Math.round((doneSteps.length / DEPLOY_STEPS.length) * 100);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function normalizeRouteSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, '-')
    .replace(/^\/+|\/+$/g, '') || 'home';
}

function coercePageConfig(slug: string, value: unknown): PageConfig | null {
  let input = value;
  if (typeof input === 'string') {
    try {
      input = JSON.parse(input) as unknown;
    } catch {
      return null;
    }
  }
  if (!isObjectRecord(input) || !Array.isArray(input.sections)) return null;

  const inputMeta = isObjectRecord(input.meta) ? input.meta : {};
  const normalizedSlug = asString(input.slug, slug);
  const normalizedId = asString(input.id, `${normalizedSlug}-page`);
  const title = asString(inputMeta.title, normalizedSlug);
  const description = asString(inputMeta.description, '');

  return {
    id: normalizedId,
    slug: normalizedSlug,
    meta: { title, description },
    sections: input.sections as PageConfig['sections'],
    ...(typeof input['global-header'] === 'boolean' ? { 'global-header': input['global-header'] } : {}),
  };
}

function coerceSiteConfig(value: unknown): SiteConfig | null {
  let input = value;
  if (typeof input === 'string') {
    try {
      input = JSON.parse(input) as unknown;
    } catch {
      return null;
    }
  }
  if (!isObjectRecord(input)) return null;
  if (!isObjectRecord(input.identity)) return null;

  return input as unknown as SiteConfig;
}

function toPagesRecord(value: unknown): Record<string, PageConfig> | null {
  const directPage = coercePageConfig('home', value);
  if (directPage) {
    const directSlug = normalizeRouteSlug(asString(directPage.slug, 'home'));
    return { [directSlug]: { ...directPage, slug: directSlug } };
  }

  if (!isObjectRecord(value)) return null;
  const next: Record<string, PageConfig> = {};
  for (const [rawKey, payload] of Object.entries(value)) {
    const rawKeyTrimmed = rawKey.trim();
    const slugFromNamespacedKey = rawKeyTrimmed.match(/^t_[a-z0-9-]+_page_(.+)$/i)?.[1];
    const slug = normalizeRouteSlug(slugFromNamespacedKey ?? rawKeyTrimmed);
    const page = coercePageConfig(slug, payload);
    if (!page) continue;
    next[slug] = { ...page, slug };
  }
  return next;
}

function normalizePageRegistry(value: unknown): Record<string, PageConfig> {
  if (!isObjectRecord(value)) return {};
  const normalized: Record<string, PageConfig> = {};

  for (const [registrySlug, rawPageValue] of Object.entries(value)) {
    const canonicalSlug = normalizeRouteSlug(registrySlug);
    const direct = coercePageConfig(canonicalSlug, rawPageValue);
    if (direct) {
      // Canonical key comes from registry/path, not from page JSON internal slug.
      normalized[canonicalSlug] = { ...direct, slug: canonicalSlug };
      continue;
    }

    const nested = toPagesRecord(rawPageValue);
    if (nested && Object.keys(nested).length > 0) {
      Object.assign(normalized, nested);
    }
  }

  return normalized;
}

type CloudLoadFailure = {
  reasonCode: string;
  message: string;
  correlationId?: string;
};

function isCloudLoadFailure(value: unknown): value is CloudLoadFailure {
  return (
    isObjectRecord(value) &&
    typeof value.reasonCode === 'string' &&
    typeof value.message === 'string'
  );
}

function toCloudLoadFailure(value: unknown): CloudLoadFailure {
  if (isCloudLoadFailure(value)) return value;
  if (value instanceof Error) {
    return { reasonCode: 'CLOUD_LOAD_FAILED', message: value.message };
  }
  return { reasonCode: 'CLOUD_LOAD_FAILED', message: 'Cloud content unavailable.' };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function backoffDelayMs(attempt: number): number {
  const base = 250 * Math.pow(2, attempt);
  const jitter = Math.floor(Math.random() * 120);
  return base + jitter;
}

function logBootstrapEvent(event: string, details: Record<string, unknown>) {
  console.info('[boot]', { event, at: new Date().toISOString(), ...details });
}

function cloudFingerprint(apiBase: string, apiKey: string): string {
  return `${normalizeApiBase(apiBase)}::${apiKey.slice(-8)}`;
}

function normalizeSlugForCache(slug: string): string {
  return (
    slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9/_-]/g, '-')
      .replace(/^\/+|\/+$/g, '') || 'home'
  );
}

function buildPublishedPageHref(slug: string): string {
  return withBasePath(`/pages/${normalizeSlugForCache(slug)}.json`, APP_BASE_PATH);
}

async function loadPublishedStaticContent(
  knownSlugs: string[]
): Promise<{ pages: Record<string, PageConfig>; siteConfig: SiteConfig }> {
  const siteResponse = await fetch(withBasePath('/config/site.json', APP_BASE_PATH), { cache: 'no-store' });
  if (!siteResponse.ok) {
    throw new Error(`Static site config unavailable: ${siteResponse.status}`);
  }

  const sitePayload = (await siteResponse.json().catch(() => null)) as unknown;
  const nextSite = coerceSiteConfig(sitePayload);
  if (!nextSite) {
    throw new Error('Static site config is invalid.');
  }

  const pageEntries = await Promise.all(
    knownSlugs.map(async (slug) => {
      const response = await fetch(buildPublishedPageHref(slug), { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Static page unavailable for slug "${slug}": ${response.status}`);
      }
      return [slug, (await response.json().catch(() => null)) as unknown] as const;
    })
  );

  const nextPages = normalizePageRegistry(Object.fromEntries(pageEntries));
  if (Object.keys(nextPages).length === 0) {
    throw new Error('Static published pages are empty.');
  }

  return {
    pages: nextPages,
    siteConfig: nextSite,
  };
}

function readCachedCloudContent(fingerprint: string): CachedCloudContent | null {
  try {
    const raw = localStorage.getItem(CLOUD_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedCloudContent;
    if (!parsed || parsed.keyFingerprint !== fingerprint) return null;
    if (!parsed.savedAt || Date.now() - parsed.savedAt > CLOUD_CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedCloudContent(entry: CachedCloudContent): void {
  try {
    localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(entry));
  } catch {
    // non-blocking cache path
  }
}

function buildThemeFontVarsCss(input: unknown): string {
  if (!isObjectRecord(input)) return '';
  const tokens = isObjectRecord(input.tokens) ? input.tokens : null;
  const typography = tokens && isObjectRecord(tokens.typography) ? tokens.typography : null;
  const fontFamily = typography && isObjectRecord(typography.fontFamily) ? typography.fontFamily : null;
  const primary = typeof fontFamily?.primary === 'string' ? fontFamily.primary : "'Instrument Sans', system-ui, sans-serif";
  const display = typeof fontFamily?.display === 'string' ? fontFamily.display : primary;
  const mono = typeof fontFamily?.mono === 'string' ? fontFamily.mono : "'JetBrains Mono', monospace";
  return `:root{--theme-font-primary:${primary};--theme-font-display:${display};--theme-font-mono:${mono};}`;
}

const REMOTE_CSS_LINK_ATTR = 'data-jp-tenant-remote-css';

function isRemoteStylesheetHref(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

function extractLeadingRemoteCssImports(cssText: string): { hrefs: string[]; rest: string } {
  const hrefs = new Set<string>();
  const leadingTriviaPattern = /^(?:\s+|\/\*[\s\S]*?\*\/)*/;
  const importPattern =
    /^@import\s+url\(\s*(?:'([^']+)'|"([^"]+)"|([^'")\s][^)]*))\s*\)\s*([^;]*);/i;
  let rest = cssText;

  for (;;) {
    const trivia = rest.match(leadingTriviaPattern);
    if (trivia && trivia[0]) {
      rest = rest.slice(trivia[0].length);
    }

    const match = rest.match(importPattern);
    if (!match) break;

    const href = (match[1] ?? match[2] ?? match[3] ?? '').trim();
    const trailingDirectives = (match[4] ?? '').trim();

    if (!isRemoteStylesheetHref(href) || trailingDirectives.length > 0) {
      break;
    }

    hrefs.add(href);
    rest = rest.slice(match[0].length);
  }

  return { hrefs: Array.from(hrefs), rest };
}

function setTenantPreviewReady(ready: boolean): void {
  if (typeof window !== 'undefined') {
    (window as Window & { __TENANT_PREVIEW_READY__?: boolean }).__TENANT_PREVIEW_READY__ = ready;
  }
  if (typeof document !== 'undefined' && document.body) {
    document.body.dataset.previewReady = ready ? '1' : '0';
  }
}

const LazyJsonPagesEngine = lazy(() =>
  import('@olonjs/core').then((m) => ({ default: m.JsonPagesEngine })),
);

function App() {
  const { states: formStates } = useOlonForms();
  const isCloudMode = Boolean(CLOUD_API_URL && CLOUD_API_KEY);
  const isSave2RepoMode = isCloudMode && SAVE2REPO_ENABLED;
  const isHotSaveMode = isCloudMode && !isSave2RepoMode;
  const localInitialData = useMemo(() => (isCloudMode ? null : getInitialData()), [isCloudMode]);
  const localInitialPages = useMemo(() => {
    if (!localInitialData) return {};
    const normalized = normalizePageRegistry(localInitialData.pages as unknown);
    return Object.keys(normalized).length > 0 ? normalized : localInitialData.pages;
  }, [localInitialData]);
  const [pages, setPages] = useState<Record<string, PageConfig>>(localInitialPages);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(
    localInitialData?.siteConfig ?? fileSiteConfig
  );
  const [menuConfig, setMenuConfig] = useState<MenuConfig>(menuConfigSeed);
  const [assetsManifest, setAssetsManifest] = useState<LibraryImageEntry[]>([]);
  const [cloudSaveUi, setCloudSaveUi] = useState<CloudSaveUiState>(getInitialCloudSaveUiState);
  const [contentMode, setContentMode] = useState<ContentMode>('cloud');
  const [contentFallback, setContentFallback] = useState<CloudLoadFailure | null>(null);
  const [showTopProgress, setShowTopProgress] = useState(false);
  const [hasInitialCloudResolved, setHasInitialCloudResolved] = useState(!isCloudMode);
  const [bootstrapRunId, setBootstrapRunId] = useState(0);
  const activeCloudSaveController = useRef<AbortController | null>(null);
  const contentLoadInFlight = useRef<Promise<void> | null>(null);
  const sppRenderInFlightRef = useRef<string | null>(null);
  const sppBootstrappedRef = useRef(false);
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  const sppLoadRenderPathRef = useRef<(pathname: string) => Promise<boolean>>(async () => false);
  const lastCommittedUrlRef = useRef(
    typeof window !== 'undefined' ? window.location.href : '',
  );
  const pendingCloudSave = useRef<{ state: ProjectState; slug: string } | null>(null);
  const cloudApiCandidates = useMemo(
    () => (isCloudMode && CLOUD_API_URL ? buildApiCandidates(CLOUD_API_URL) : []),
    [isCloudMode, CLOUD_API_URL]
  );

  const engineRefDocuments = useMemo(
    () => ({
      'menu.json': menuConfig,
      'config/menu.json': menuConfig,
      'src/data/config/menu.json': menuConfig,
    }),
    [menuConfig],
  );

  const writeCloudCache = useCallback((entry: CachedCloudContent) => {
    writeCachedCloudContent(entry);
  }, []);

  const resolveAdminBootstrap = useCallback(() => {
    setContentMode('cloud');
    setContentFallback(null);
    setShowTopProgress(false);
    setHasInitialCloudResolved(true);
  }, []);

  useAdminStudioContent({
    enabled: isHotSaveMode,
    basePath: APP_BASE_PATH,
    apiCandidates: cloudApiCandidates,
    apiKey: CLOUD_API_KEY ?? '',
    setPages,
    setSiteConfig,
    setMenuConfig,
    writeCache: writeCloudCache,
    onBootstrapResolved: resolveAdminBootstrap,
  });

  const adminRoute =
    typeof window !== 'undefined' && isAdminPath(window.location.pathname, APP_BASE_PATH);

  const loadAssetsManifest = useCallback(async (): Promise<void> => {
    if (isCloudMode && CLOUD_API_URL && CLOUD_API_KEY) {
      const apiBases = cloudApiCandidates.length > 0 ? cloudApiCandidates : [normalizeApiBase(CLOUD_API_URL)];
      for (const apiBase of apiBases) {
        try {
          const res = await fetch(`${apiBase}/assets/list?limit=200`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${CLOUD_API_KEY}`,
            },
          });
          const body = (await res.json().catch(() => ({}))) as { items?: LibraryImageEntry[] };
          if (!res.ok) continue;
          const items = Array.isArray(body.items) ? body.items : [];
          setAssetsManifest(items);
          return;
        } catch {
          // try next candidate
        }
      }
      setAssetsManifest([]);
      return;
    }

    fetch('/api/list-assets')
      .then((r) => (r.ok ? r.json() : []))
      .then((list: LibraryImageEntry[]) => setAssetsManifest(Array.isArray(list) ? list : []))
      .catch(() => setAssetsManifest([]));
  }, [isCloudMode, CLOUD_API_URL, CLOUD_API_KEY, cloudApiCandidates]);

  useEffect(() => {
    void loadAssetsManifest();
  }, [loadAssetsManifest]);

  useEffect(() => {
    return () => {
      activeCloudSaveController.current?.abort();
    };
  }, []);

  useEffect(() => {
    setTenantPreviewReady(false);
    return () => {
      setTenantPreviewReady(false);
    };
  }, []);

  useEffect(() => {
    if (!isCloudMode || !CLOUD_API_URL || !CLOUD_API_KEY) {
      setContentMode('cloud');
      setContentFallback(null);
      setShowTopProgress(false);
      setHasInitialCloudResolved(true);
      logBootstrapEvent('boot.local.ready', { mode: 'local' });
      return;
    }

    if (isSave2RepoMode) {
      if (contentLoadInFlight.current) {
        return;
      }

      setContentMode('cloud');
      setContentFallback(null);
      setShowTopProgress(true);
      setHasInitialCloudResolved(false);
      logBootstrapEvent('boot.start', { mode: 'save2repo-static', pageCount: Object.keys(filePages).length });

      let inFlight: Promise<void> | null = null;
      inFlight = loadPublishedStaticContent(Object.keys(filePages))
        .then(({ pages: nextPages, siteConfig: nextSite }) => {
          setPages(nextPages);
          setSiteConfig(nextSite);
          setContentMode('cloud');
          setContentFallback(null);
          setHasInitialCloudResolved(true);
          logBootstrapEvent('boot.save2repo.success', {
            mode: 'save2repo-static',
            pageCount: Object.keys(nextPages).length,
          });
        })
        .catch((error: unknown) => {
          const failure = toCloudLoadFailure(error);
          setContentMode('error');
          setContentFallback(failure);
          setHasInitialCloudResolved(true);
          logBootstrapEvent('boot.save2repo.error', {
            mode: 'save2repo-static',
            reasonCode: failure.reasonCode,
            correlationId: failure.correlationId ?? null,
          });
        })
        .finally(() => {
          setShowTopProgress(false);
          if (contentLoadInFlight.current === inFlight) {
            contentLoadInFlight.current = null;
          }
        });
      contentLoadInFlight.current = inFlight;
      return () => {
        contentLoadInFlight.current = null;
      };
    }

    if (contentLoadInFlight.current) {
      return;
    }

    if (isAdminPath(window.location.pathname, APP_BASE_PATH)) {
      setContentMode('cloud');
      setContentFallback(null);
      setShowTopProgress(false);
      setHasInitialCloudResolved(false);
      return;
    }

    const controller = new AbortController();
    const startedAt = Date.now();
    const primaryApiBase = cloudApiCandidates[0] ?? normalizeApiBase(CLOUD_API_URL);
    const fingerprint = cloudFingerprint(primaryApiBase, CLOUD_API_KEY);
    const cached = readCachedCloudContent(fingerprint);
    const cachedPages = cached ? toPagesRecord(cached.pages) : null;
    const cachedSite = cached ? coerceSiteConfig(cached.siteConfig) : null;
    const cachedMenu =
      cached?.menuConfig && isObjectRecord(cached.menuConfig)
        ? (cached.menuConfig as MenuConfig)
        : null;
    sppBootstrappedRef.current = false;
    setContentMode('cloud');
    setContentFallback(null);
    setShowTopProgress(true);
    setHasInitialCloudResolved(false);
    logBootstrapEvent('boot.start', { mode: 'spp-render', apiCandidates: cloudApiCandidates.length });

    const applyRenderPayload = (result: RenderProjectionResponse) => {
      if (!result.page) return;
      const registrySlug = resolveRegistrySlugFromRender(result.page);
      setPages((prev) => ({ ...prev, [registrySlug]: result.page! }));
      if (result.context?.siteConfig) setSiteConfig(result.context.siteConfig);
      if (result.context?.menuConfig) setMenuConfig(result.context.menuConfig);
      writeCachedCloudContent({
        keyFingerprint: fingerprint,
        savedAt: Date.now(),
        siteConfig: result.context?.siteConfig ?? cachedSite ?? null,
        menuConfig: result.context?.menuConfig ?? cachedMenu ?? null,
        pages: {
          ...(cached?.pages ?? {}),
          [registrySlug]: result.page,
        },
      });
    };

    const loadRenderPath = async (
      pathname: string,
      options?: { initial?: boolean },
    ): Promise<boolean> => {
      if (controller.signal.aborted) return false;
      if (isAdminPath(pathname, APP_BASE_PATH)) return false;

      const renderPath = normalizeRenderPath(pathname, APP_BASE_PATH);
      const inFlightKey = renderPath;
      if (sppRenderInFlightRef.current === inFlightKey) return false;
      sppRenderInFlightRef.current = inFlightKey;

      try {
        const result = await fetchRenderProjection(cloudApiCandidates, CLOUD_API_KEY, renderPath, {
          signal: controller.signal,
          maxRetryAttempts: 2,
        });

        if (!result.ok) {
          if (options?.initial) {
            throw {
              reasonCode: result.code || 'RENDER_FAILED',
              message: result.error || 'Render projection failed',
              correlationId: result.correlationId,
            } satisfies CloudLoadFailure;
          }
          logBootstrapEvent('boot.spp_render.route_error', {
            path: renderPath,
            code: result.code ?? null,
          });
          return false;
        }

        if (options?.initial) {
          applyRenderPayload(result);
        } else {
          flushSync(() => {
            applyRenderPayload(result);
          });
        }

        if (options?.initial) {
          sppBootstrappedRef.current = true;
          setContentMode('cloud');
          setContentFallback(null);
          setHasInitialCloudResolved(true);
          lastCommittedUrlRef.current = window.location.href;
          logBootstrapEvent('boot.spp_render.success', {
            elapsedMs: Date.now() - startedAt,
            projectionMode: result.diagnostics?.projectionMode ?? null,
            correlationId: result.correlationId ?? null,
          });
        } else {
          logBootstrapEvent('boot.spp_render.route_success', {
            path: renderPath,
            correlationId: result.correlationId ?? null,
          });
        }

        return true;
      } finally {
        if (sppRenderInFlightRef.current === inFlightKey) {
          sppRenderInFlightRef.current = null;
        }
      }
    };

    sppLoadRenderPathRef.current = loadRenderPath;

    const bootstrap = async () => {
      try {
        await loadRenderPath(window.location.pathname, { initial: true });
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        const failure = toCloudLoadFailure(error);
        const hasCachedFallback = Boolean(
          (cachedPages && Object.keys(cachedPages).length > 0) || cachedSite,
        );
        if (hasCachedFallback) {
          if (cachedPages && Object.keys(cachedPages).length > 0) setPages(cachedPages);
          if (cachedSite) setSiteConfig(cachedSite);
          if (cachedMenu) setMenuConfig(cachedMenu);
          setContentMode('cloud');
          setContentFallback({
            reasonCode: 'RENDER_FAILED',
            message: failure.message,
            correlationId: failure.correlationId,
          });
          setHasInitialCloudResolved(true);
        } else {
          setContentMode('error');
          setContentFallback(failure);
          setHasInitialCloudResolved(true);
        }
        logBootstrapEvent('boot.spp_render.error', {
          reasonCode: failure.reasonCode,
          correlationId: failure.correlationId ?? null,
        });
      } finally {
        setShowTopProgress(false);
      }
    };

    let inFlight: Promise<void> | null = null;
    inFlight = bootstrap().finally(() => {
      if (contentLoadInFlight.current === inFlight) {
        contentLoadInFlight.current = null;
      }
    });
    contentLoadInFlight.current = inFlight;

    const unpatchHistory = patchHistoryNavigation((pathname) => {
      if (!sppBootstrappedRef.current) return;
      if (isAdminPath(pathname, APP_BASE_PATH)) return;
      if (isPageLoadedInRegistry(pagesRef.current, pathname, APP_BASE_PATH)) {
        lastCommittedUrlRef.current = window.location.href;
        return;
      }

      const revertUrl = lastCommittedUrlRef.current;
      window.history.replaceState(window.history.state, '', revertUrl);
      window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));

      setShowTopProgress(true);
      void loadRenderPath(pathname)
        .then((ok) => {
          if (!ok) return;
          completeSppClientNavigation(pathname, () => {
            lastCommittedUrlRef.current = window.location.href;
          });
        })
        .finally(() => {
          setShowTopProgress(false);
        });
    });

    return () => {
      controller.abort();
      unpatchHistory();
      contentLoadInFlight.current = null;
      sppLoadRenderPathRef.current = async () => false;
    };
  }, [isCloudMode, isSave2RepoMode, CLOUD_API_KEY, CLOUD_API_URL, cloudApiCandidates, bootstrapRunId]);

  useEffect(() => {
    if (!isHotSaveMode || !hasInitialCloudResolved) return;

    return installSppNavigationGuard({
      basePath: APP_BASE_PATH,
      isActive: () => sppBootstrappedRef.current,
      isBusy: () => sppRenderInFlightRef.current !== null,
      getPages: () => pagesRef.current,
      loadRenderPath: (pathname) => sppLoadRenderPathRef.current(pathname),
      onLoadStart: () => setShowTopProgress(true),
      onLoadEnd: () => setShowTopProgress(false),
      onNavigateComplete: () => {
        lastCommittedUrlRef.current = window.location.href;
      },
    });
  }, [isHotSaveMode, hasInitialCloudResolved]);

  useEffect(() => {
    if (!isHotSaveMode || !hasInitialCloudResolved) return;
    lastCommittedUrlRef.current = window.location.href;
  }, [isHotSaveMode, hasInitialCloudResolved, pages]);

  const runCloudSave = useCallback(
    async (
      payload: { state: ProjectState; slug: string },
      rejectOnError: boolean
    ): Promise<void> => {
      if (!CLOUD_API_URL || !CLOUD_API_KEY) {
        const noCloudError = new Error('Cloud mode is not configured.');
        if (rejectOnError) throw noCloudError;
        return;
      }

      pendingCloudSave.current = payload;
      activeCloudSaveController.current?.abort();
      const controller = new AbortController();
      activeCloudSaveController.current = controller;

      setCloudSaveUi({
        isOpen: true,
        phase: 'running',
        currentStepId: null,
        doneSteps: [],
        progress: 0,
      });

      try {
        await startCloudSaveStream({
          apiBaseUrl: CLOUD_API_URL,
          apiKey: CLOUD_API_KEY,
          path: `src/data/pages/${payload.slug}.json`,
          content: payload.state.page,
          message: `Content update for ${payload.slug} via Visual Editor`,
          signal: controller.signal,
          onStep: (event) => {
            setCloudSaveUi((prev) => {
              if (event.status === 'running') {
                return {
                  ...prev,
                  isOpen: true,
                  phase: 'running',
                  currentStepId: event.id,
                  errorMessage: undefined,
                };
              }

              if (prev.doneSteps.includes(event.id)) {
                return prev;
              }

              const nextDone = [...prev.doneSteps, event.id];
              return {
                ...prev,
                isOpen: true,
                phase: 'running',
                currentStepId: event.id,
                doneSteps: nextDone,
                progress: stepProgress(nextDone),
              };
            });
          },
          onDone: (event) => {
            const completed = DEPLOY_STEPS.map((step) => step.id);
            setCloudSaveUi({
              isOpen: true,
              phase: 'done',
              currentStepId: 'live',
              doneSteps: completed,
              progress: 100,
              deployUrl: event.deployUrl,
            });
          },
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Cloud save failed.';
        setCloudSaveUi((prev) => ({
          ...prev,
          isOpen: true,
          phase: 'error',
          errorMessage: message,
        }));
        if (rejectOnError) throw new Error(message);
      } finally {
        if (activeCloudSaveController.current === controller) {
          activeCloudSaveController.current = null;
        }
      }
    },
    []
  );

  const closeCloudDrawer = useCallback(() => {
    setCloudSaveUi(getInitialCloudSaveUiState());
  }, []);

  const retryCloudSave = useCallback(() => {
    if (!pendingCloudSave.current) return;
    void runCloudSave(pendingCloudSave.current, false);
  }, [runCloudSave]);

  const tenantCssParts = useMemo(() => extractLeadingRemoteCssImports(tenantCss), [tenantCss]);
  const resolvedTenantCss = useMemo(
    () => [buildThemeFontVarsCss(themeConfig), tenantCssParts.rest].filter(Boolean).join('\n'),
    [tenantCssParts],
  );

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const createdLinks: HTMLLinkElement[] = [];

    tenantCssParts.hrefs.forEach((href) => {
      const existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(
        (link) => (link as HTMLLinkElement).href === href,
      ) as HTMLLinkElement | undefined;
      if (existing) return;

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute(REMOTE_CSS_LINK_ATTR, href);
      document.head.appendChild(link);
      createdLinks.push(link);
    });

    return () => {
      createdLinks.forEach((link) => {
        if (link.getAttribute(REMOTE_CSS_LINK_ATTR) !== link.href) return;
        if (link.parentNode) link.parentNode.removeChild(link);
      });
    };
  }, [tenantCssParts]);

  const config: JsonPagesConfig = {
    tenantId: TENANT_ID,
    basePath: APP_BASE_PATH,
    registry: ComponentRegistry as JsonPagesConfig['registry'],
    schemas: SECTION_SCHEMAS as unknown as JsonPagesConfig['schemas'],
    submissionSchemas: SECTION_SUBMISSION_SCHEMAS as unknown as JsonPagesConfig['submissionSchemas'],
    pages,
    siteConfig,
    themeConfig,
    menuConfig,
    refDocuments: engineRefDocuments,
    iconRegistry: iconMap,
    themeCss: { tenant: resolvedTenantCss },
    addSection: addSectionConfig,
    webmcp: {
      enabled: true,
      namespace: typeof window !== 'undefined' ? window.location.href : '',
    },
    persistence: {
      async saveToFile(state: ProjectState, slug: string): Promise<void> {
        // 💻 LOCAL FILESYSTEM (development path)
        console.log(`💻 Saving ${slug} to Local Filesystem...`);
        const res = await fetch('/api/save-to-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectState: state, slug }),
        });
        
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(body.error ?? `Save to file failed: ${res.status}`);
      },
      async hotSave(state: ProjectState, slug: string): Promise<void> {
        if (!isCloudMode || !CLOUD_API_URL || !CLOUD_API_KEY) {
          throw new Error('Cloud mode is not configured for hot save.');
        }
        const apiBase = cloudApiCandidates[0] ?? normalizeApiBase(CLOUD_API_URL);
        const res = await fetch(`${apiBase}/hotSave`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CLOUD_API_KEY}`,
          },
          body: JSON.stringify({
            slug,
            page: state.page,
            siteConfig: state.site,
            menuConfig: state.menu,
          }),
        });
        const body = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
        if (!res.ok) {
          throw new Error(body.error || body.code || `Hot save failed: ${res.status}`);
        }
        const keyFingerprint = cloudFingerprint(apiBase, CLOUD_API_KEY);
        const normalizedSlug = normalizeSlugForCache(slug);
        const existing = readCachedCloudContent(keyFingerprint);
        writeCachedCloudContent({
          keyFingerprint,
          savedAt: Date.now(),
          siteConfig: state.site ?? null,
          menuConfig: state.menu ?? null,
          pages: {
            ...(existing?.pages ?? {}),
            [normalizedSlug]: state.page,
          },
        });
      },
      async coldSave(state: ProjectState, slug: string): Promise<void> {
        await runCloudSave({ state, slug }, true);
      },
      showLocalSave: !isCloudMode,
      showHotSave: isHotSaveMode,
      showColdSave: isSave2RepoMode,
    },
    assets: {
      assetsBaseUrl: withBasePath('/assets', APP_BASE_PATH),
      assetsManifest,
      async onAssetUpload(file: File): Promise<string> {
        if (!file.type.startsWith('image/')) throw new Error('Invalid file type.');
        if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
          throw new Error('Unsupported image format. Allowed: jpeg, png, webp, gif, avif.');
        }
        if (file.size > MAX_UPLOAD_SIZE_BYTES) throw new Error(`File too large. Max ${MAX_UPLOAD_SIZE_BYTES / 1024 / 1024}MB.`);

        if (isCloudMode && CLOUD_API_URL && CLOUD_API_KEY) {
          const apiBases = cloudApiCandidates.length > 0 ? cloudApiCandidates : [normalizeApiBase(CLOUD_API_URL)];
          let lastError: Error | null = null;
          for (const apiBase of apiBases) {
            for (let attempt = 0; attempt <= ASSET_UPLOAD_MAX_RETRIES; attempt += 1) {
              try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('filename', file.name);
                const controller = new AbortController();
                const timeout = window.setTimeout(() => controller.abort(), ASSET_UPLOAD_TIMEOUT_MS);
                const res = await fetch(`${apiBase}/assets/upload`, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${CLOUD_API_KEY}`,
                    'X-Correlation-Id': crypto.randomUUID(),
                  },
                  body: formData,
                  signal: controller.signal,
                }).finally(() => window.clearTimeout(timeout));
                const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string; code?: string };
                if (res.ok && typeof body.url === 'string') {
                  await loadAssetsManifest().catch(() => undefined);
                  return body.url;
                }
                lastError = new Error(body.error || body.code || `Cloud upload failed: ${res.status}`);
                if (isRetryableStatus(res.status) && attempt < ASSET_UPLOAD_MAX_RETRIES) {
                  await sleep(backoffDelayMs(attempt));
                  continue;
                }
                break;
              } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Cloud upload failed.';
                lastError = new Error(message);
                if (attempt < ASSET_UPLOAD_MAX_RETRIES) {
                  await sleep(backoffDelayMs(attempt));
                  continue;
                }
                break;
              }
            }
          }
          throw lastError ?? new Error('Cloud upload failed.');
        }

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });

        const res = await fetch('/api/upload-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, mimeType: file.type || undefined, data: base64 }),
        });
        const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!res.ok) throw new Error(body.error || `Upload failed: ${res.status}`);
        if (typeof body.url !== 'string') throw new Error('Invalid server response: missing url');
        await loadAssetsManifest().catch(() => undefined);
        return body.url;
      },
    },
  };

  const shouldRenderEngine = !isCloudMode || hasInitialCloudResolved;
  const isTenantEmpty = Object.keys(pages).length === 0;

  useEffect(() => {
    if (!shouldRenderEngine) {
      setTenantPreviewReady(false);
      return;
    }
    let cancelled = false;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        if (!cancelled) setTenantPreviewReady(true);
      });
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      setTenantPreviewReady(false);
    };
  }, [shouldRenderEngine, pages, siteConfig]);

  return (
    <ThemeProvider>
      <OlonFormsContext.Provider value={formStates}>
      <>
      {isCloudMode && showTopProgress ? (
        <>
          <style>
            {`@keyframes jp-top-progress-slide { 0% { transform: translateX(-120%); } 100% { transform: translateX(320%); } }`}
          </style>
          <div
            role="status"
            aria-live="polite"
            aria-label="Cloud loading progress"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              zIndex: 1300,
              background: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '32%',
                height: '100%',
                background: 'linear-gradient(90deg, rgba(88,166,255,0.15) 0%, rgba(88,166,255,0.85) 50%, rgba(88,166,255,0.15) 100%)',
                animation: 'jp-top-progress-slide 1.15s ease-in-out infinite',
                willChange: 'transform',
              }}
            />
          </div>
        </>
      ) : null}
      {isCloudMode && !hasInitialCloudResolved ? (
        <div className="fixed inset-0 z-[1290] bg-background/80 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-[1600px] p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
              <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-[220px] w-full rounded-xl" />
                <Skeleton className="h-[220px] w-full rounded-xl" />
              </div>
              <div className="space-y-3 rounded-xl border border-border/50 bg-card/60 p-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-4/6" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
     {shouldRenderEngine ? (
        isTenantEmpty ? (
          <EmptyTenantView />
        ) : adminRoute ? (
          <Suspense fallback={null}>
            <LazyJsonPagesEngine config={config} />
          </Suspense>
        ) : (
          <OlonJSEngine config={config} />
        )
      ) : null}
      {isCloudMode && (contentMode === 'error' || contentFallback?.reasonCode === 'RENDER_FAILED') ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: 12,
            right: 12,
            zIndex: 1200,
            background: 'rgba(179, 65, 24, 0.92)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 10,
            fontSize: 12,
            maxWidth: 360,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}
        >
          {contentMode === 'error' ? 'Cloud content unavailable.' : 'Render refresh failed, showing cached content.'}
          {contentFallback ? (
            <div style={{ opacity: 0.85, marginTop: 4 }}>
              <div>{contentFallback.message}</div>
              <div style={{ marginTop: 2 }}>
                Reason: {contentFallback.reasonCode}
                {contentFallback.correlationId ? ` | Correlation: ${contentFallback.correlationId}` : ''}
              </div>
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    contentLoadInFlight.current = null;
                    setContentMode('cloud');
                    setContentFallback(null);
                    setHasInitialCloudResolved(false);
                    setShowTopProgress(true);
                    setBootstrapRunId((prev) => prev + 1);
                  }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 8,
                    padding: '4px 10px',
                    background: 'transparent',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  Retry
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      <DopaDrawer
        isOpen={cloudSaveUi.isOpen}
        phase={cloudSaveUi.phase}
        currentStepId={cloudSaveUi.currentStepId}
        doneSteps={cloudSaveUi.doneSteps}
        progress={cloudSaveUi.progress}
        errorMessage={cloudSaveUi.errorMessage}
        deployUrl={cloudSaveUi.deployUrl}
        onClose={closeCloudDrawer}
        onRetry={retryCloudSave}
      />
      </>
      </OlonFormsContext.Provider>
    </ThemeProvider>
  );
}

export default App;

