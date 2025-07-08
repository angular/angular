/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {inject, Injectable} from '@angular/core';
import {Meta} from '@angular/platform-browser';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from './router_state';
import {PRIMARY_OUTLET, RouteNonIndexKey} from './shared';

/**
 * Provides a strategy for setting the non-index attribute of a route after a navigation.
 *
 * The built-in `DefaultNonIndexStrategy` writes the non-index attribute to the `robots` meta tag.
 *
 * @publicApi
 */
@Injectable({providedIn: 'root', useFactory: () => inject(DefaultNonIndexStrategy)})
export abstract class NonIndexStrategy {
  /**
   * Performs the application non-index strategy.
   * @param snapshot The snapshot of the router state.
   */
  abstract updateNonIndex(snapshot: RouterStateSnapshot): void;

  /**
   * @returns The `nonIndex` value from the deepest primary route.
   */
  buildNonIndex(snapshot: RouterStateSnapshot): boolean | undefined {
    let nonIndex: boolean | undefined;
    let route: ActivatedRouteSnapshot | undefined = snapshot.root;
    while (route !== undefined) {
      nonIndex = this.getResolvedNonIndexForRoute(route) ?? nonIndex;
      route = route.children.find((child) => child.outlet === PRIMARY_OUTLET);
    }
    return nonIndex;
  }

  /**
   * Given an `ActivatedRouteSnapshot`, returns the final value of the
   * `Route.nonIndex` property, which can either be a static boolean or a resolved value.
   */
  getResolvedNonIndexForRoute(snapshot: ActivatedRouteSnapshot): boolean | undefined {
    return snapshot.data[RouteNonIndexKey];
  }
}

/**
 * The default `NonIndexStrategy` used by the Angular router.
 *
 * @publicApi
 */
@Injectable({providedIn: 'root'})
export class DefaultNonIndexStrategy extends NonIndexStrategy {
  constructor(private meta: Meta) {
    super();
  }

  /**
   * Sets the non-index attribute on the `robots` meta tag.
   * @param snapshot The snapshot of the router state.
   */
  override updateNonIndex(snapshot: RouterStateSnapshot): void {
    const nonIndex = this.buildNonIndex(snapshot);
    this.updateMetaTag(nonIndex);
  }

  private updateMetaTag(nonIndex: boolean | undefined): void {
    if (nonIndex === undefined) {
      return;
    }

    if (nonIndex) {
      this.meta.updateTag({name: 'robots', content: 'noindex,nofollow'});
    } else if (nonIndex === false) {
      this.meta.updateTag({name: 'robots', content: 'index,follow'});
    }
  }
}
