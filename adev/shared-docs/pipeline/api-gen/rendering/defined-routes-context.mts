/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Flat set of all routes (and `route#anchor` pairs) defined by the application's navigation
 * tree. Populated once per pipeline invocation from `defined-routes.json`, which is produced
 * by `//adev/scripts/routes:run_generate_route` from a TypeScript import of the canonical
 * `ALL_ITEMS` navigation entries.
 *
 * This is the same source of truth used by the markdown -> HTML guide rendering pipeline
 * (see `AdevDocsRenderer#isKnownRoute`), so api-gen and guide-gen agree on what counts as a
 * valid link target.
 *
 * Used by the `{@link /guide/...}` and `[label](/guide/...)` validators to catch broken or
 * stale guide links at build time.
 */
let definedRoutes = new Set<string>();

export function setDefinedRoutes(routes: string[]): void {
  definedRoutes = new Set(routes);
}

/**
 * Whether the given route (e.g. `guide/signals` or `guide/signals#what-are-signals`) is one
 * of the known navigation routes.
 */
export function isKnownRoute(route: string): boolean {
  return definedRoutes.has(route);
}

/** Whether a defined-routes manifest has been loaded for this pipeline invocation. */
export function hasDefinedRoutes(): boolean {
  return definedRoutes.size > 0;
}

/**
 * Returns the heading anchor IDs defined for the given route path. Used to suggest a
 * corrected anchor when a `#fragment` doesn't match (case-insensitive lookup).
 */
export function getAnchorsForRoute(route: string): string[] {
  const prefix = `${route}#`;
  const anchors: string[] = [];
  for (const currentRoute of definedRoutes) {
    if (currentRoute.startsWith(prefix)) {
      anchors.push(currentRoute.slice(prefix.length));
    }
  }
  return anchors;
}
