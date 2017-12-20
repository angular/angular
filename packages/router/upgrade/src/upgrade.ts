/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_BOOTSTRAP_LISTENER, ComponentRef, InjectionToken, Injector} from '@angular/core';
import {Router} from '@angular/router';
import {UpgradeModule} from '@angular/upgrade/static';



/**
 * @whatItDoes Creates an initializer that in addition to setting up the Angular
 * router sets up the ngRoute integration.
 *
 * @howToUse
 *
 * ```
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
 * ```
 *
 * @experimental
 */
export const RouterUpgradeInitializer = {
  provide: APP_BOOTSTRAP_LISTENER,
  multi: true,
  useFactory: locationSyncBootstrapListener,
  deps: [UpgradeModule]
};

/**
 * @internal
 */
export function locationSyncBootstrapListener(ngUpgrade: UpgradeModule) {
  return () => { setUpLocationSync(ngUpgrade); };
}

/**
 * @whatItDoes Sets up a location synchronization using the provided UpgradeModule.
 *
 * History.pushState does not fire onPopState, so the Angular location
 * doesn't detect it. The workaround is to attach a location change listener
 *
 * @experimental
 */
export function setUpLocationSync(ngUpgrade: UpgradeModule) {
  if (!ngUpgrade.$injector) {
    throw new Error(`
        RouterUpgradeInitializer can be used only after UpgradeModule.bootstrap has been called.
        Remove RouterUpgradeInitializer and call setUpLocationSync after UpgradeModule.bootstrap.
      `);
  }
  setUpRouterSync(ngUpgrade.injector, ngUpgrade.$injector);
}

/**
 * @whatItDoes Sets up a router synchronization using the Angular and AngularJS injectors.
 *
 * History.pushState does not fire onPopState, so the Angular location
 * doesn't detect it. The workaround is to attach a location change listener
 *
 * @experimental
 */
export function setUpRouterSync(injector: Injector, $injector: any) {
  const router: Router = injector.get(Router);
  const url = document.createElement('a');

  $injector.get('$rootScope').$on('$locationChangeStart', (_: any, next: string, __: string) => {
    url.href = next;
    router.navigateByUrl(url.pathname + url.search + url.hash);
  });
}