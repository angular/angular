/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '@angular/core';
import {Router} from './router';
import {Route} from './models';

/**
 * Returns the loaded routes for a given route.
 */
export function getLoadedRoutes(route: Route): Route[] | undefined {
  return route._loadedRoutes;
}

/**
 * Returns the Router instance from the given injector, or null if not available.
 */
export function getRouterInstance(injector: Injector): Router | null {
  return injector.get(Router, null, {optional: true});
}

/**
 * Navigates the given router to the specified URL.
 * Throws if the provided router is not an Angular Router.
 */
export function navigateByUrl(router: Router, url: string): Promise<boolean> {
  if (!(router instanceof Router)) {
    throw new Error('The provided router is not an Angular Router.');
  }
  return router.navigateByUrl(url);
}
