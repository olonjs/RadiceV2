import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { DefaultNotFound, PageRenderer, StudioProvider } from '@olonjs/core/runtime';
import type { MenuConfig, PageConfig, SiteConfig } from '@/types';
import { normalizeRenderPath } from '@/lib/spp/renderClient';

export type StableVisitorSnapshot = {
  renderPath: string;
  page: PageConfig;
  siteConfig: SiteConfig;
  menuConfig: MenuConfig;
};

type SppRouteHoldContextValue = {
  basePath: string;
  pendingPath: string | null;
  lastStable: StableVisitorSnapshot | null;
};

const SppRouteHoldContext = createContext<SppRouteHoldContextValue | null>(null);

export function SppRouteHoldProvider({
  basePath,
  pendingPath,
  lastStable,
  children,
}: SppRouteHoldContextValue & { children: React.ReactNode }) {
  const value = useMemo(
    () => ({ basePath, pendingPath, lastStable }),
    [basePath, pendingPath, lastStable],
  );

  return <SppRouteHoldContext.Provider value={value}>{children}</SppRouteHoldContext.Provider>;
}

export function SppVisitorNotFound() {
  const ctx = useContext(SppRouteHoldContext);
  const location = useLocation();

  if (!ctx) return <DefaultNotFound />;

  const renderPath = normalizeRenderPath(location.pathname, ctx.basePath);
  if (ctx.pendingPath === renderPath && ctx.lastStable) {
    return (
      <StudioProvider mode="visitor">
        <PageRenderer
          pageConfig={ctx.lastStable.page}
          siteConfig={ctx.lastStable.siteConfig}
          menuConfig={ctx.lastStable.menuConfig}
        />
      </StudioProvider>
    );
  }

  return <DefaultNotFound />;
}
