import type { MenuConfig, PageConfig, SiteConfig } from '@/types';

export type RenderProjectionResponse = {
  ok: boolean;
  error?: string;
  code?: string;
  correlationId?: string;
  route?: {
    path: string;
    template: string;
    params: Record<string, string>;
  };
  context?: {
    siteConfig: SiteConfig;
    menuConfig: MenuConfig;
  };
  page?: PageConfig;
  diagnostics?: {
    projectionMode: 'atomic' | 'legacy_fallback';
    unresolvedRefs: string[];
  };
};

export function normalizeRenderPath(pathname: string, basePath: string): string {
  const normalizedBase = basePath.replace(/\/+$/, '') || '';
  let path = pathname.trim() || '/';
  if (normalizedBase && normalizedBase !== '/' && path.startsWith(normalizedBase)) {
    path = path.slice(normalizedBase.length) || '/';
  }
  if (!path.startsWith('/')) path = `/${path}`;
  return path === '' ? '/' : path;
}

export function isAdminPath(pathname: string, basePath: string): boolean {
  const path = normalizeRenderPath(pathname, basePath);
  return path === '/admin' || path.startsWith('/admin/');
}

export function resolveRegistrySlugFromRender(page: PageConfig): string {
  const slug = typeof page.slug === 'string' ? page.slug.trim() : '';
  if (slug.includes('[')) return slug;
  if (slug) return slug;
  return 'home';
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffDelayMs(attempt: number): number {
  return 250 * Math.pow(2, attempt) + Math.floor(Math.random() * 120);
}

export async function fetchRenderProjection(
  apiBases: string[],
  apiKey: string,
  path: string,
  options?: { signal?: AbortSignal; maxRetryAttempts?: number },
): Promise<RenderProjectionResponse> {
  const maxRetryAttempts = options?.maxRetryAttempts ?? 2;
  const query = new URLSearchParams({ path });
  let lastFailure: RenderProjectionResponse | null = null;

  for (const apiBase of apiBases) {
    for (let attempt = 0; attempt <= maxRetryAttempts; attempt += 1) {
      try {
        const res = await fetch(`${apiBase}/render?${query.toString()}`, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          signal: options?.signal,
        });

        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        if (!contentType.includes('application/json')) {
          lastFailure = {
            ok: false,
            code: 'NON_JSON_RESPONSE',
            error: `Non-JSON response from ${apiBase}/render`,
          };
          break;
        }

        const parsed = (await res.json().catch(() => ({}))) as RenderProjectionResponse;
        if (!res.ok) {
          lastFailure = {
            ok: false,
            code: parsed.code || `HTTP_${res.status}`,
            error: parsed.error || `Render failed: ${res.status}`,
            correlationId: parsed.correlationId,
          };
          if (isRetryableStatus(res.status) && attempt < maxRetryAttempts) {
            await sleep(backoffDelayMs(attempt));
            continue;
          }
          break;
        }

        if (!parsed.ok || !parsed.page) {
          lastFailure = {
            ok: false,
            code: parsed.code || 'ERR_RENDER_PROJECTION_FAILED',
            error: parsed.error || 'Render payload missing page',
            correlationId: parsed.correlationId,
          };
          break;
        }

        return parsed;
      } catch (error: unknown) {
        if (options?.signal?.aborted) throw error;
        const message = error instanceof Error ? error.message : 'Network error';
        lastFailure = {
          ok: false,
          code: 'NETWORK_TRANSIENT',
          error: `${message} (${apiBase}/render)`,
        };
        if (attempt < maxRetryAttempts) {
          await sleep(backoffDelayMs(attempt));
          continue;
        }
      }
    }
    if (lastFailure?.ok === false && lastFailure.code !== 'NETWORK_TRANSIENT') {
      break;
    }
  }

  return (
    lastFailure ?? {
      ok: false,
      code: 'RENDER_ENDPOINT_UNREACHABLE',
      error: 'Render endpoint not reachable.',
    }
  );
}

export function patchHistoryNavigation(onNavigate: () => void): () => void {
  const notify = () => {
    window.queueMicrotask(onNavigate);
  };

  window.addEventListener('popstate', notify);
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = (...args: Parameters<History['pushState']>) => {
    originalPushState(...args);
    notify();
  };
  history.replaceState = (...args: Parameters<History['replaceState']>) => {
    originalReplaceState(...args);
    notify();
  };

  return () => {
    window.removeEventListener('popstate', notify);
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
  };
}
