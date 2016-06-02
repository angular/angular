import { ComponentResolver, ReflectiveInjector, Type, Injector } from '@angular/core';
import { Location } from '@angular/common';
import { UrlSerializer } from './url_serializer';
import { RouterOutletMap } from './router_outlet_map';
import { recognize } from './recognize';
import { resolve } from './resolve';
import { createRouterState } from './create_router_state';
import { TreeNode } from './utils/tree';
import { UrlTree, createEmptyUrlTree } from './url_tree';
import { PRIMARY_OUTLET, Params } from './shared';
import { createEmptyState, RouterState, RouterStateSnapshot, ActivatedRoute, ActivatedRouteSnapshot, advanceActivatedRoute} from './router_state';
import { RouterConfig } from './config';
import { RouterOutlet } from './directives/router_outlet';
import { createUrlTree } from './create_url_tree';
import { forEach, and, shallowEqual } from './utils/collection';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/mergeMap';
import {of} from 'rxjs/observable/of';
import {forkJoin} from 'rxjs/observable/forkJoin';

export interface NavigationExtras { relativeTo?: ActivatedRoute; queryParameters?: Params; fragment?: string; }

/**
 * The `Router` is responsible for mapping URLs to components.
 */
export class Router {
  private currentUrlTree: UrlTree;
  private currentRouterState: RouterState;
  private config: RouterConfig;
  private locationSubscription: Subscription;

  /**
   * @internal
   */
  constructor(private rootComponentType:Type, private resolver: ComponentResolver, private urlSerializer: UrlSerializer, private outletMap: RouterOutletMap, private location: Location, private injector: Injector) {
    this.currentUrlTree = createEmptyUrlTree();
    this.currentRouterState = createEmptyState(rootComponentType);
    this.setUpLocationChangeListener();
    this.navigateByUrl(this.location.path());
  }

  /**
   * Returns the current route state.
   */
  get routerState(): RouterState {
    return this.currentRouterState;
  }

  /**
   * Returns the current url tree.
   */
  get urlTree(): UrlTree {
    return this.currentUrlTree;
  }

  /**
   * Navigate based on the provided url. This navigation is always absolute.
   *
   * ### Usage
   *
   * ```
   * router.navigateByUrl("/team/33/user/11");
   * ```
   */
  navigateByUrl(url: string): Observable<void> {
    const urlTree = this.urlSerializer.parse(url);
    return this.runNavigate(urlTree, false);
  }

  /**
   * Resets the configuration used for navigation and generating links.
   *
   * ### Usage
   *
   * ```
   * router.resetConfig([
   *  { path: 'team/:id', component: TeamCmp, children: [
   *    { path: 'simple', component: SimpleCmp },
   *    { path: 'user/:name', component: UserCmp }
   *  ] }
   * ]);
   * ```
   */
  resetConfig(config: RouterConfig): void {
    this.config = config;
  }

  /**
   * @internal
   */
  dispose(): void { this.locationSubscription.unsubscribe(); }

  /**
   * Applies an array of commands to the current url tree and creates
   * a new url tree.
   *
   * When given an activate route, applies the given commands starting from the route.
   * When not given a route, applies the given command starting from the root.
   *
   * ### Usage
   *
   * ```
   * // create /team/33/user/11
   * router.createUrlTree(['/team', 33, 'user', 11]);
   *
   * // create /team/33;expand=true/user/11
   * router.createUrlTree(['/team', 33, {expand: true}, 'user', 11]);
   *
   * // you can collapse static fragments like this
   * router.createUrlTree(['/team/33/user', userId]);
   *
   * // assuming the current url is `/team/33/user/11` and the route points to `user/11`
   *
   * // navigate to /team/33/user/11/details
   * router.createUrlTree(['details'], {relativeTo: route});
   *
   * // navigate to /team/33/user/22
   * router.createUrlTree(['../22'], {relativeTo: route});
   *
   * // navigate to /team/44/user/22
   * router.createUrlTree(['../../team/44/user/22'], {relativeTo: route});
   * ```
   */
  createUrlTree(commands: any[], {relativeTo, queryParameters, fragment}: NavigationExtras = {}): UrlTree {
    const a = relativeTo ? relativeTo : this.routerState.root;
    return createUrlTree(a, this.currentUrlTree, commands, queryParameters, fragment);
  }


  /**
   * Navigate based on the provided array of commands and a starting point.
   * If no starting route is provided, the navigation is absolute.
   *
   * ### Usage
   *
   * ```
   * router.navigate(['team', 33, 'team', '11], {relativeTo: route});
   * ```
   */
  navigate(commands: any[], extras: NavigationExtras = {}): Observable<void> {
    return this.runNavigate(this.createUrlTree(commands, extras));
  }

  /**
   * Serializes a {@link UrlTree} into a string.
   */
  serializeUrl(url: UrlTree): string { return this.urlSerializer.serialize(url); }

  /**
   * Parse a string into a {@link UrlTree}.
   */
  parseUrl(url: string): UrlTree { return this.urlSerializer.parse(url); }

  private setUpLocationChangeListener(): void {
    this.locationSubscription = <any>this.location.subscribe((change) => {
      this.runNavigate(this.urlSerializer.parse(change['url']), change['pop'])
    });
  }

  private runNavigate(url:UrlTree, pop?:boolean):Observable<any> {
    let state;
    const r = recognize(this.rootComponentType, this.config, url).mergeMap((newRouterStateSnapshot) => {
      return resolve(this.resolver, newRouterStateSnapshot);

    }).map((routerStateSnapshot) => {
      return createRouterState(routerStateSnapshot, this.currentRouterState);

    }).map((newState:RouterState) => {
      state = newState;

    }).mergeMap(_ => {
      return new GuardChecks(state.snapshot, this.currentRouterState.snapshot, this.injector).check(this.outletMap);
    });

    r.subscribe((shouldActivate) => {
      if (!shouldActivate) return;
      new ActivateRoutes(state, this.currentRouterState).activate(this.outletMap);

      this.currentUrlTree = url;
      this.currentRouterState = state;

      if (!pop) {
        this.location.go(this.urlSerializer.serialize(url));
      }
    });
    return r;
  }
}

class CanActivate { constructor(public route: ActivatedRouteSnapshot) {}}
class CanDeactivate { constructor(public component: Object, public route: ActivatedRouteSnapshot) {}}

class GuardChecks {
  private checks = [];
  constructor(private future: RouterStateSnapshot, private curr: RouterStateSnapshot, private injector: Injector) {}

  check(parentOutletMap: RouterOutletMap): Observable<boolean> {
    const futureRoot = this.future._root;
    const currRoot = this.curr ? this.curr._root : null;
    this.traverseChildRoutes(futureRoot, currRoot, parentOutletMap);
    if (this.checks.length === 0) return of(true);
    return forkJoin(this.checks.map(s => {
      if (s instanceof CanActivate) {
        return this.runCanActivate(s.route)
      } else if (s instanceof CanDeactivate) {
        return this.runCanDeactivate(s.component, s.route);
      } else {
        throw new Error("Cannot be reached");
      }
    })).map(and);
  }

  private traverseChildRoutes(futureNode: TreeNode<ActivatedRouteSnapshot>,
                              currNode: TreeNode<ActivatedRouteSnapshot> | null,
                              outletMap: RouterOutletMap | null): void {
    const prevChildren = nodeChildrenAsMap(currNode);
    futureNode.children.forEach(c => {
      this.traverseRoutes(c, prevChildren[c.value.outlet], outletMap);
      delete prevChildren[c.value.outlet];
    });
    forEach(prevChildren, (v, k) => this.deactivateOutletAndItChildren(v, outletMap._outlets[k]));
  }

  traverseRoutes(futureNode: TreeNode<ActivatedRouteSnapshot>, currNode: TreeNode<ActivatedRouteSnapshot> | null,
                 parentOutletMap: RouterOutletMap | null): void {
    const future = futureNode.value;
    const curr = currNode ? currNode.value : null;
    const outlet = parentOutletMap ? parentOutletMap._outlets[futureNode.value.outlet] : null;

    if (curr && future._routeConfig === curr._routeConfig) {
      if (!shallowEqual(future.params, curr.params)) {
        this.checks.push(new CanDeactivate(outlet.component, curr), new CanActivate(future));
      }
      this.traverseChildRoutes(futureNode, currNode, outlet ? outlet.outletMap : null);
    } else {
      this.deactivateOutletAndItChildren(curr, outlet);
      this.checks.push(new CanActivate(future));
      this.traverseChildRoutes(futureNode, null, outlet ? outlet.outletMap : null);
    }
  }

  private deactivateOutletAndItChildren(route: ActivatedRouteSnapshot, outlet: RouterOutlet): void {
    if (outlet && outlet.isActivated) {
      forEach(outlet.outletMap._outlets, (v, k) => this.deactivateOutletAndItChildren(v, outlet.outletMap._outlets[k]));
      this.checks.push(new CanDeactivate(outlet.component, route))
    }
  }

  private runCanActivate(future: ActivatedRouteSnapshot): Observable<boolean> {
    const canActivate = future._routeConfig ? future._routeConfig.canActivate : null;
    if (!canActivate || canActivate.length === 0) return of(true);
    return forkJoin(canActivate.map(c => {
      const guard = this.injector.get(c);
      if (guard.canActivate) {
        return of(guard.canActivate(future, this.future));
      } else {
        return of(guard(future, this.future));
      }
    })).map(and);
  }

  private runCanDeactivate(component: Object, curr: ActivatedRouteSnapshot): Observable<boolean> {
    const canDeactivate = curr._routeConfig ? curr._routeConfig.canDeactivate : null;
    if (!canDeactivate || canDeactivate.length === 0) return of(true);
    return forkJoin(canDeactivate.map(c => {
      const guard = this.injector.get(c);
      if (guard.canDeactivate) {
        return of(guard.canDeactivate(component, curr, this.curr));
      } else {
        return of(guard(component, curr, this.curr));
      }
    })).map(and);
  }
}

class ActivateRoutes {
  constructor(private futureState: RouterState, private currState: RouterState) {}

  activate(parentOutletMap: RouterOutletMap):void {
    const futureRoot = this.futureState._root;
    const currRoot = this.currState ? this.currState._root : null;

    pushQueryParamsAndFragment(this.futureState);
    this.activateChildRoutes(futureRoot, currRoot, parentOutletMap);
  }

  private activateChildRoutes(futureNode: TreeNode<ActivatedRoute>,
                              currNode: TreeNode<ActivatedRoute> | null,
                              outletMap: RouterOutletMap): void {
    const prevChildren = nodeChildrenAsMap(currNode);
    futureNode.children.forEach(c => {
      this.activateRoutes(c, prevChildren[c.value.outlet], outletMap);
      delete prevChildren[c.value.outlet];
    });
    forEach(prevChildren, (v, k) => this.deactivateOutletAndItChildren(outletMap._outlets[k]));
  }

  activateRoutes(futureNode: TreeNode<ActivatedRoute>, currNode: TreeNode<ActivatedRoute> | null,
                 parentOutletMap: RouterOutletMap): void {
    const future = futureNode.value;
    const curr = currNode ? currNode.value : null;
    const outlet = getOutlet(parentOutletMap, futureNode.value);

    if (future === curr) {
      advanceActivatedRoute(future);
      this.activateChildRoutes(futureNode, currNode, outlet.outletMap);
    } else {
      this.deactivateOutletAndItChildren(outlet);
      const outletMap = new RouterOutletMap();
      this.activateNewRoutes(outletMap, future, outlet);
      this.activateChildRoutes(futureNode, null, outletMap);
    }
  }

  private activateNewRoutes(outletMap: RouterOutletMap, future: ActivatedRoute, outlet: RouterOutlet): void {
    const resolved = ReflectiveInjector.resolve([
      {provide: ActivatedRoute, useValue: future},
      {provide: RouterOutletMap, useValue: outletMap}
    ]);
    outlet.activate(future._futureSnapshot._resolvedComponentFactory, resolved, outletMap);
    advanceActivatedRoute(future);
  }

  private deactivateOutletAndItChildren(outlet: RouterOutlet): void {
    if (outlet && outlet.isActivated) {
      forEach(outlet.outletMap._outlets, (v, k) => this.deactivateOutletAndItChildren(v));
      outlet.deactivate();
    }
  }
}

function pushQueryParamsAndFragment(state: RouterState): void {
  if (!shallowEqual(state.snapshot.queryParams, (<any>state.queryParams).value)) {
    (<any>state.queryParams).next(state.snapshot.queryParams);
  }

  if (state.snapshot.fragment !== (<any>state.fragment).value) {
    (<any>state.fragment).next(state.snapshot.fragment);
  }
}

function nodeChildrenAsMap(node: TreeNode<any>|null) {
  return node ?
    node.children.reduce(
      (m, c) => {
        m[c.value.outlet] = c;
        return m;
      },
      {}) :
  {};
}

function getOutlet(outletMap: RouterOutletMap, route: ActivatedRoute): RouterOutlet {
  let outlet = outletMap._outlets[route.outlet];
  if (!outlet) {
    if (route.outlet === PRIMARY_OUTLET) {
      throw new Error(`Cannot find primary outlet`);
    } else {
      throw new Error(`Cannot find the outlet ${route.outlet}`);
    }
  }
  return outlet;
}
