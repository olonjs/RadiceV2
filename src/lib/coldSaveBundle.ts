export const SITE_CONFIG_REPO_PATH = 'src/data/config/site.json';
export const MENU_CONFIG_REPO_PATH = 'src/data/config/menu.json';

interface ColdSaveBundleState {
  site: unknown;
  menu: unknown;
}

/**
 * Site (header/footer) and menu are always included alongside the page on
 * Cold Save — no diffing against last-synced state. Keeps the Save-to-Repo
 * commit in sync with what Studio's draft actually holds.
 */
export function buildColdSaveAdditionalFiles(
  state: ColdSaveBundleState
): Array<{ path: string; content: unknown }> {
  return [
    { path: SITE_CONFIG_REPO_PATH, content: state.site },
    { path: MENU_CONFIG_REPO_PATH, content: state.menu },
  ];
}
