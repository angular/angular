/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {BaseRouteReuseStrategy} from '@angular/router';
// Match tutorial pages, apart of /tutorials.
export const IS_TUTORIAL_PAGE_RULE = /(^tutorials)\/(\S*)/s;
export class ReuseTutorialsRouteStrategy extends BaseRouteReuseStrategy {
  // reuse route when not navigating to a new one or when navigating between tutorial pages
  shouldReuseRoute(future, curr) {
    return (
      future.routeConfig === curr.routeConfig ||
      (this.isTutorialPage(this.getPathFromActivatedRouteSnapshot(future)) &&
        this.isTutorialPage(this.getPathFromActivatedRouteSnapshot(curr)))
    );
  }
  isTutorialPage(path) {
    if (!path) {
      return false;
    }
    return IS_TUTORIAL_PAGE_RULE.test(path);
  }
  getPathFromActivatedRouteSnapshot(snapshot) {
    let route = snapshot;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.routeConfig?.path;
  }
}
//# sourceMappingURL=tutorials-route-reuse-strategy.js.map
