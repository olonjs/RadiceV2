/**
 * Unit checks for admin render fan-out path helpers.
 * Run: node --experimental-strip-types scripts/admin-render-paths-unit.mjs
 */
import assert from 'node:assert/strict';
import {
  listAdminRenderPaths,
  registrySlugToRenderPath,
} from '../src/lib/spp/renderClient.ts';

assert.equal(registrySlugToRenderPath('home'), '/');
assert.equal(registrySlugToRenderPath('menu'), '/menu');
assert.equal(registrySlugToRenderPath('/chef/'), '/chef');

const radiceLikePages = {
  home: {},
  menu: {},
  philosophy: {},
  chef: {},
  contact: {},
  experience: {},
  reservations: {},
  'private-dining': {},
};

assert.deepEqual(listAdminRenderPaths(radiceLikePages), [
  '/',
  '/chef',
  '/contact',
  '/experience',
  '/menu',
  '/philosophy',
  '/private-dining',
  '/reservations',
]);

const withDynamic = {
  ...radiceLikePages,
  'libri/[slug]': {},
};
assert.deepEqual(listAdminRenderPaths(withDynamic), listAdminRenderPaths(radiceLikePages));

console.log('admin-render-paths-unit: ok');
