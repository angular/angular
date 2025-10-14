/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Router} from './router';
/**
 * Returns the loaded routes for a given route.
 */
export function getLoadedRoutes(route) {
  return route._loadedRoutes;
}
/**
 * Returns the Router instance from the given injector, or null if not available.
 */
export function getRouterInstance(injector) {
  return injector.get(Router, null, {optional: true});
}
/**
 * Navigates the given router to the specified URL.
 * Throws if the provided router is not an Angular Router.
 */
export function navigateByUrl(router, url) {
  if (!(router instanceof Router)) {
    throw new Error('The provided router is not an Angular Router.');
  }
  return router.navigateByUrl(url);
}
//# sourceMappingURL=router_devtools.js.map
