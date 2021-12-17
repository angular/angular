/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_INITIALIZER, Injectable, OnDestroy} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {Subscription} from 'rxjs';
import {filter} from 'rxjs/operators';

import {NavigationEnd} from './events';
import {Router} from './router';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from './router_state';
import {PRIMARY_OUTLET} from './shared';
import {RouteTitle as TitleKey} from './utils/config';

/**
 * Provides a strategy for setting the page title after a router navigation.
 *
 * The built-in implementation traverses the router state snapshot and finds the deepest primary
 * outlet with `title` property. Given the `Routes` below, navigating to
 * `/base/child(popup:aux)` would result in the document title being set to "child".
 * ```
 * [
 *   {path: 'base', title: 'base', children: [
 *     {path: 'child', title: 'child'},
 *   ],
 *   {path: 'aux', outlet: 'popup', title: 'popupTitle'}
 * ]
 * ```
 *
 * This class be used as a base class for custom title strategies. That is, you can create your own
 * class that extends the `PageTitleStrategy`. Note that in the above example, the `title` from the
 * named outlet is never used. However, a custom strategy might be implemented to incorporate titles
 * in named outlets.
 *
 * @publicApi
 * @see [Page title guide](guide/router#setting-the-page-title)
 */
@Injectable({providedIn: 'root'})
export class PageTitleStrategy implements OnDestroy {
  private eventsSubscription?: Subscription;

  constructor(protected readonly title: Title, private readonly router: Router) {}

  /**
   * Activates the `PageTitleStrategy` by subscribing to the router `NavigationEnd` events.
   */
  activate(): void {
    if (this.eventsSubscription) return;

    this.eventsSubscription = this.router.events
                                  .pipe(
                                      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
                                      )
                                  .subscribe(() => {
                                    this.onNavigationEnd();
                                  });
  }

  private onNavigationEnd(): void {
    const routerState = this.router.routerState.snapshot;
    const title = this.getTitleForPage(routerState);
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
  getTitleForPage(snapshot: RouterStateSnapshot): string|undefined {
    let pageTitle: string|undefined;
    let route: ActivatedRouteSnapshot|undefined = snapshot.root;
    while (route !== undefined) {
      pageTitle = this.getResolvedTitleForRoute(route) ?? pageTitle;
      route = route.children.find(child => child.outlet === PRIMARY_OUTLET);
    }
    return pageTitle;
  }

  /**
   * Given an `ActivatedRouteSnapshot`, returns the final value of the
   * `Route.title` property, which can either be a static string or a resolved value.
   */
  getResolvedTitleForRoute(snapshot: ActivatedRouteSnapshot) {
    return snapshot.data[TitleKey];
  }

  /**
   * @nodoc
   */
  ngOnDestroy() {
    this.eventsSubscription?.unsubscribe();
  }
}

/**
 * Initializer for the `PageTitleStrategy` which activates the strategy as part of the
 * `APP_INITIALIZER`.
 */
export const pageTitleInitializer = {
  provide: APP_INITIALIZER,
  multi: true,
  useFactory: (pageTitle: PageTitleStrategy): () => void => {
    return () => pageTitle.activate();
  },
  deps: [PageTitleStrategy],
};
