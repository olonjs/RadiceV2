/**
 * Unit checks for the Cold Save site/menu bundle helper.
 * Run: node --experimental-strip-types scripts/cold-save-bundle-unit.mjs
 */
import assert from 'node:assert/strict';
import {
  buildColdSaveAdditionalFiles,
  MENU_CONFIG_REPO_PATH,
  SITE_CONFIG_REPO_PATH,
} from '../src/lib/coldSaveBundle.ts';

assert.equal(SITE_CONFIG_REPO_PATH, 'src/data/config/site.json');
assert.equal(MENU_CONFIG_REPO_PATH, 'src/data/config/menu.json');

const site = {
  identity: { title: 'Radice' },
  header: { id: 'header', type: 'header', data: {} },
  footer: { id: 'footer', type: 'footer', data: {} },
};
const menu = { main: [{ label: 'Home', href: '/' }] };

const files = buildColdSaveAdditionalFiles({ site, menu });

assert.equal(files.length, 2);
assert.equal(files[0].path, SITE_CONFIG_REPO_PATH);
assert.deepEqual(files[0].content, site);
assert.equal(files[1].path, MENU_CONFIG_REPO_PATH);
assert.deepEqual(files[1].content, menu);

console.log('cold-save-bundle-unit: ok');
