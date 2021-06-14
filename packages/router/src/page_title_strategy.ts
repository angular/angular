/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {filter} from 'rxjs/operators';

import {NavigationEnd} from './events';
import {Router} from './router';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from './router_state';
import {PRIMARY_OUTLET} from './shared';

/**
 * Provides a strategy for setting the page title after a router navigation.
 *
 * The built-in implementation traverses the router state snapshot and finds the deepest primary
 * outlet with `pageTitle` on the route data. Given the `Routes` below, navigating to
 * `/base/child(popup:aux)` would result in the document title being set to "child".
 * ```
 * [
 *   {path: 'base', data: {pageTitle: 'base'}, children: [
 *     {path: 'child', data: {pageTitle: 'child'}},
 *   ],
 *   {path: 'aux', outlet: 'popup', data: {pageTitle: 'popupTitle'}}
 * ]
 * ```
 *
 * This class be used as a base class for custom title strategies. That is, you can create your own
 * class that extends the `PageTitleStrategy`.
 *
 * @publicApi
 * @see [Page title guide](guide/router#setting-the-page-title)
 */
@Injectable({providedIn: 'root'})
export class PageTitleStrategy implements OnDestroy {
  private readonly eventsSubscription =
      this.router.events
          .pipe(
              filter((e): e is NavigationEnd => e instanceof NavigationEnd),
              )
          .subscribe(() => {
            this.onNavigationEnd();
          });

  constructor(protected readonly title: Title, private readonly router: Router) {}

  private onNavigationEnd(): void {
    const routerState = this.router.routerState.snapshot;
    const title = this.getPageTitle(routerState);
    if (title !== undefined) {
      this.setTitle(title);
    }
  }

  /**
   * Sets the title of the browser to the given value.
   *
   * @param title The `pageTitle` from the deepest primary route.
   */
  setTitle(title: string): void {
    this.title.setTitle(title);
  }

  /**
   * @returns The `pageTitle` in the `data` of the deepest primary route.
   */
  getPageTitle(snapshot: RouterStateSnapshot): string|undefined {
    let pageTitle: string|undefined;
    let route: ActivatedRouteSnapshot|undefined = snapshot.root;
    while (route !== undefined) {
      pageTitle = route.data.pageTitle ?? pageTitle;
      route = route.children.find(child => child.outlet === PRIMARY_OUTLET);
    }
    return pageTitle;
  }

  /**
   * @nodoc
   */
  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }
}
