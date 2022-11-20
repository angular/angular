/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentRef, inject, Injectable} from '@angular/core';

import {OutletContext} from './router_outlet_context';
import {ActivatedRoute, ActivatedRouteSnapshot} from './router_state';
import {TreeNode} from './utils/tree';

/**
 * @description
 *
 * Represents the detached route tree.
 *
 * This is an opaque value the router will give to a custom route reuse strategy
 * to store and retrieve later on.
 *
 * @publicApi
 */
export type DetachedRouteHandle = {};

/** @internal */
export type DetachedRouteHandleInternal = {
  contexts: Map<string, OutletContext>,
  componentRef: ComponentRef<any>,
  route: TreeNode<ActivatedRoute>,
};

/**
 * @description
 *
 * Provides a way to customize when activated routes get reused.
 *
 * @publicApi
 */
@Injectable({providedIn: 'root', useFactory: () => inject(DefaultRouteReuseStrategy)})
export abstract class RouteReuseStrategy {
  /** Determines if this route (and its subtree) should be detached to be reused later */
  abstract shouldDetach(route: ActivatedRouteSnapshot): boolean;

  /**
   * Stores the detached route.
   *
   * Storing a `null` value should erase the previously stored value.
   */
  abstract store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle|null): void;

  /** Determines if this route (and its subtree) should be reattached */
  abstract shouldAttach(route: ActivatedRouteSnapshot): boolean;

  /** Retrieves the previously stored route */
  abstract retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle|null;

  /** Determines if a route should be reused */
  abstract shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean;
}

/**
 * @description
 *
 * This base route reuse strategy only reuses routes when the matched router configs are
 * identical. This prevents components from being destroyed and recreated
 * when just the route parameters, query parameters or fragment change
 * (that is, the existing component is _reused_).
 *
 * This strategy does not store any routes for later reuse.
 *
 * Angular uses this strategy by default.
 *
 *
 * It can be used as a base class for custom route reuse strategies, i.e. you can create your own
 * class that extends the `BaseRouteReuseStrategy` one.
 * @publicApi
 */
export abstract class BaseRouteReuseStrategy implements RouteReuseStrategy {
  /**
   * Whether the given route should detach for later reuse.
   * Always returns false for `BaseRouteReuseStrategy`.
   * */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  /**
   * A no-op; the route is never stored since this strategy never detaches routes for later re-use.
   */
  store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {}

  /** Returns `false`, meaning the route (and its subtree) is never reattached */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  /** Returns `null` because this strategy does not store routes for later re-use. */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle|null {
    return null;
  }

  /**
   * Determines if a route should be reused.
   * This strategy returns `true` when the future route config and current route config are
   * identical.
   */
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }
}

@Injectable({providedIn: 'root'})
export class DefaultRouteReuseStrategy extends BaseRouteReuseStrategy {
}
