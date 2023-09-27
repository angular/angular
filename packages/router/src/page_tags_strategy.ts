/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {inject, Injectable} from '@angular/core';
import {Meta, MetaDefinition} from '@angular/platform-browser';

import {ActivatedRouteSnapshot, RouterStateSnapshot} from './router_state';
import {PRIMARY_OUTLET, RouteTagsKey} from './shared';

/**
 * Provides a strategy for setting the page tags after a router navigation.
 *
 * The built-in implementation traverses the router state snapshot and finds the deepest primary
 * outlet with `tags` property. Given the `Routes` below, navigating to
 * `/base/child(popup:aux)` would result in the document tags being set to "child".
 * ```
 * [
 *   {path: 'base', tags: [{ name: 'description', content: 'base'}], children: [
 *     {path: 'child', tags: [{ name: 'description', content: 'child'}]},
 *   ],
 *   {path: 'aux', outlet: 'popup', tags: [{ name: 'description', content: 'popup description'}]}
 * ]
 * ```
 *
 * This class can be used as a base class for custom tags strategies. That is, you can create your
 * own class that extends the `TagsStrategy`. Note that in the above example, the `tags`
 * from the named outlet is never used. However, a custom strategy might be implemented to
 * incorporate tags in named outlets.
 *
 * @publicApi
 * @see [Page tags guide](guide/router#setting-the-page-tags)
 */
@Injectable({providedIn: 'root', useFactory: () => inject(DefaultTagsStrategy)})
export abstract class TagsStrategy {
  /** Performs the application tags update. */
  abstract updateTags(snapshot: RouterStateSnapshot): void;

  /**
   * @returns The `tags` of the deepest primary route.
   */
  buildTags(snapshot: RouterStateSnapshot): MetaDefinition[]|undefined {
    let pageTags: MetaDefinition[]|undefined;
    let route: ActivatedRouteSnapshot|undefined = snapshot.root;
    while (route !== undefined) {
      pageTags = this.getResolvedTagsForRoute(route) ?? pageTags;
      route = route.children.find(child => child.outlet === PRIMARY_OUTLET);
    }
    return pageTags;
  }

  /**
   * Given an `ActivatedRouteSnapshot`, returns the final value of the
   * `Route.tags` property, which can either be a static string or a resolved value.
   */
  getResolvedTagsForRoute(snapshot: ActivatedRouteSnapshot) {
    return snapshot.data[RouteTagsKey];
  }
}

/**
 * The default `TagsStrategy` used by the router that updates the tags using the `Tags` service.
 */
@Injectable({providedIn: 'root'})
export class DefaultTagsStrategy extends TagsStrategy {
  constructor(readonly meta: Meta) {
    super();
  }

  /**
   * Sets the tags of the browser to the given value.
   */
  override updateTags(snapshot: RouterStateSnapshot): void {
    const tags = this.buildTags(snapshot);
    if (tags !== undefined) {
      for (const tag of tags) {
        const selector = tag.name ? `name=${tag.name}` : undefined;
        this.meta.updateTag(tag, selector);
      }
    }
  }
}
