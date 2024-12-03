/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';

import {ActivatedRouteSnapshot, RouterStateSnapshot} from './router_state';
import {PRIMARY_OUTLET, RouteTitleKey} from './shared';

/**
 * Provides a strategy for setting the page title after a router navigation.
 *
 * The built-in implementation traverses the router state snapshot and finds the deepest primary
 * outlet with `title` property. Given the `Routes` below, navigating to
 * `/base/child(popup:aux)` would result in the document title being set to "child".
 * ```ts
 * [
 *   {path: 'base', title: 'base', children: [
 *     {path: 'child', title: 'child'},
 *   ],
 *   {path: 'aux', outlet: 'popup', title: 'popupTitle'}
 * ]
 * ```
 *
 * This class can be used as a base class for custom title strategies. That is, you can create your
 * own class that extends the `TitleStrategy`. Note that in the above example, the `title`
 * from the named outlet is never used. However, a custom strategy might be implemented to
 * incorporate titles in named outlets.
 *
 * @publicApi
 * @see [Page title guide](guide/routing/common-router-tasks#setting-the-page-title)
 */
@Injectable({providedIn: 'root', useFactory: () => inject(DefaultTitleStrategy)})
export abstract class TitleStrategy {
  /** Performs the application title update. */
  abstract updateTitle(snapshot: RouterStateSnapshot): void;

  /**
   * @returns The `title` of the deepest primary route.
   */
  buildTitle(snapshot: RouterStateSnapshot): string | undefined {
    let pageTitle: string | undefined;
    let route: ActivatedRouteSnapshot | undefined = snapshot.root;
    while (route !== undefined) {
      pageTitle = this.getResolvedTitleForRoute(route) ?? pageTitle;
      route = route.children.find((child) => child.outlet === PRIMARY_OUTLET);
    }
    return pageTitle;
  }

  /**
   * Given an `ActivatedRouteSnapshot`, returns the final value of the
   * `Route.title` property, which can either be a static string or a resolved value.
   */
  getResolvedTitleForRoute(snapshot: ActivatedRouteSnapshot) {
    return snapshot.data[RouteTitleKey];
  }
}

/**
 * The default `TitleStrategy` used by the router that updates the title using the `Title` service.
 */
@Injectable({providedIn: 'root'})
export class DefaultTitleStrategy extends TitleStrategy {
  constructor(readonly title: Title) {
    super();
  }

  /**
   * Sets the title of the browser to the given value.
   *
   * @param title The `pageTitle` from the deepest primary route.
   */
  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    if (title !== undefined) {
      this.title.setTitle(title);
    }
  }
}
