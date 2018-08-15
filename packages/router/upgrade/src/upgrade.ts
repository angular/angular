/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location} from '@angular/common';
import {APP_BOOTSTRAP_LISTENER, ComponentRef, InjectionToken} from '@angular/core';
import {Router} from '@angular/router';
import {UpgradeModule} from '@angular/upgrade/static';

/**
 * Creates an initializer that sets up `ngRoute` integration
 * along with setting up the Angular router.
 *
 * @usageNotes
 *
 * <code-example language="typescript">
 * @NgModule({
 *  imports: [
 *   RouterModule.forRoot(SOME_ROUTES),
 *   UpgradeModule
 * ],
 * providers: [
 *   RouterUpgradeInitializer
 * ]
 * })
 * export class AppModule {
 *   ngDoBootstrap() {}
 * }
 * </code-example>
 *
 * @publicApi
 */
export const RouterUpgradeInitializer = {
  provide: APP_BOOTSTRAP_LISTENER,
  multi: true,
  useFactory: locationSyncBootstrapListener as (ngUpgrade: UpgradeModule) => () => void,
  deps: [UpgradeModule]
};

/**
 * @internal
 */
export function locationSyncBootstrapListener(ngUpgrade: UpgradeModule) {
  return () => {
    setUpLocationSync(ngUpgrade);
  };
}

/**
 * Sets up a location change listener to trigger `history.pushState`.
 * Works around the problem that `onPopState` does not trigger `history.pushState`.
 * Must be called *after* calling `UpgradeModule.bootstrap`.
 *
 * @param ngUpgrade The upgrade NgModule.
 * @param urlType The location strategy.
 * @see `HashLocationStrategy`
 * @see `PathLocationStrategy`
 *
 * @publicApi
 */
export function setUpLocationSync(ngUpgrade: UpgradeModule, urlType: 'path'|'hash' = 'path') {
  if (!ngUpgrade.$injector) {
    throw new Error(`
        RouterUpgradeInitializer can be used only after UpgradeModule.bootstrap has been called.
        Remove RouterUpgradeInitializer and call setUpLocationSync after UpgradeModule.bootstrap.
      `);
  }

  const router: Router = ngUpgrade.injector.get(Router);
  const location: Location = ngUpgrade.injector.get(Location);

  ngUpgrade.$injector.get('$rootScope')
      .$on('$locationChangeStart', (_: any, next: string, __: string) => {
        let url;
        if (urlType === 'path') {
          url = resolveUrl(next);
        } else if (urlType === 'hash') {
          // Remove the first hash from the URL
          const hashIdx = next.indexOf('#');
          url = resolveUrl(next.substring(0, hashIdx) + next.substring(hashIdx + 1));
        } else {
          throw 'Invalid URLType passed to setUpLocationSync: ' + urlType;
        }
        const path = location.normalize(url.pathname);
        router.navigateByUrl(path + url.search + url.hash);
      });
}

/**
 * Normalizes and parses a URL.
 *
 * - Normalizing means that a relative URL will be resolved into an absolute URL in the context of
 *   the application document.
 * - Parsing means that the anchor's `protocol`, `hostname`, `port`, `pathname` and related
 *   properties are all populated to reflect the normalized URL.
 *
 * While this approach has wide compatibility, it doesn't work as expected on IE. On IE, normalizing
 * happens similar to other browsers, but the parsed components will not be set. (E.g. if you assign
 * `a.href = 'foo'`, then `a.protocol`, `a.host`, etc. will not be correctly updated.)
 * We work around that by performing the parsing in a 2nd step by taking a previously normalized URL
 * and assigning it again. This correctly populates all properties.
 *
 * See
 * https://github.com/angular/angular.js/blob/2c7400e7d07b0f6cec1817dab40b9250ce8ebce6/src/ng/urlUtils.js#L26-L33
 * for more info.
 */
let anchor: HTMLAnchorElement|undefined;
function resolveUrl(url: string): {pathname: string, search: string, hash: string} {
  if (!anchor) {
    anchor = document.createElement('a');
  }

  anchor.setAttribute('href', url);
  anchor.setAttribute('href', anchor.href);

  return {
    // IE does not start `pathname` with `/` like other browsers.
    pathname: `/${anchor.pathname.replace(/^\//, '')}`,
    search: anchor.search,
    hash: anchor.hash
  };
}
