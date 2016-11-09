/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_BOOTSTRAP_LISTENER, ApplicationRef, OpaqueToken} from '@angular/core';
import {ExtraOptions, ROUTER_CONFIGURATION, ROUTER_INITIALIZER, Router, RouterPreloader} from '@angular/router';
import {UpgradeModule} from '@angular/upgrade/static';


/**
 * @whatItDoes Creates an initializer that in addition to setting up the Angular 2
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
  provide: ROUTER_INITIALIZER,
  useFactory: initialRouterNavigation,
  deps: [UpgradeModule, ApplicationRef, RouterPreloader, ROUTER_CONFIGURATION]
};

export function initialRouterNavigation(
    ngUpgrade: UpgradeModule, ref: ApplicationRef, preloader: RouterPreloader,
    opts: ExtraOptions): Function {
  return () => {
    const router = ngUpgrade.injector.get(Router);
    const ref = ngUpgrade.injector.get(ApplicationRef);

    router.resetRootComponentType(ref.componentTypes[0]);
    preloader.setUpPreloading();
    if (opts.initialNavigation === false) {
      router.setUpLocationChangeListener();
    } else {
      setTimeout(() => { router.initialNavigation(); }, 0);
    }

    // History.pushState does not fire onPopState, so the angular2 location
    // doesn't detect it. The workaround is to attach a location change listener
    // that will call navigate directly.
    ngUpgrade.$injector.get('$rootScope')
        .$on('$locationChangeStart', (_: any, next: string, __: string) => {
          const url = document.createElement('a');
          url.href = next;
          router.navigateByUrl(url.pathname);
        });
  };
}