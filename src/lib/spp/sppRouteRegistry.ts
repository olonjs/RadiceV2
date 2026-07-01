import type { PageConfig } from '@/types';
import { normalizeRenderPath } from '@/lib/spp/renderClient';

export function slugFromRenderPath(renderPath: string): string {
  const normalized = renderPath.trim() || '/';
  if (normalized === '/') return 'home';
  return normalized.replace(/^\/+|\/+$/g, '');
}

function matchDynamicTemplate(templateSlug: string, requestedSlug: string): boolean {
  const templateSegments = templateSlug.split('/').filter(Boolean);
  const requestedSegments = requestedSlug.split('/').filter(Boolean);
  if (templateSegments.length !== requestedSegments.length) return false;

  for (let index = 0; index < templateSegments.length; index += 1) {
    const templateSegment = templateSegments[index];
    const requestedSegment = requestedSegments[index];
    if (/^\[[A-Za-z0-9_-]+\]$/.test(templateSegment)) continue;
    if (templateSegment !== requestedSegment) return false;
  }

  return true;
}

export function isPageLoadedInRegistry(
  registry: Record<string, PageConfig>,
  pathname: string,
  basePath: string,
): boolean {
  const renderPath = normalizeRenderPath(pathname, basePath);
  const requestedSlug = slugFromRenderPath(renderPath);

  if (registry[requestedSlug]) return true;

  for (const [registrySlug, page] of Object.entries(registry)) {
    const templateSlug = (page.slug || registrySlug).trim();
    if (templateSlug === requestedSlug) return true;
    if (templateSlug.includes('[') && matchDynamicTemplate(templateSlug, requestedSlug)) {
      return true;
    }
  }

  return false;
}

export function resolvePageFromRegistry(
  registry: Record<string, PageConfig>,
  pathname: string,
  basePath: string,
): PageConfig | undefined {
  const renderPath = normalizeRenderPath(pathname, basePath);
  const requestedSlug = slugFromRenderPath(renderPath);

  const direct = registry[requestedSlug];
  if (direct) return direct;

  for (const [registrySlug, page] of Object.entries(registry)) {
    const templateSlug = (page.slug || registrySlug).trim();
    if (templateSlug === requestedSlug) return page;
    if (templateSlug.includes('[') && matchDynamicTemplate(templateSlug, requestedSlug)) {
      return page;
    }
  }

  return undefined;
}
