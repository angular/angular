/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/every';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';

import {Location} from '@angular/common';
import {AppModuleFactoryLoader, ComponentFactoryResolver, ComponentResolver, Injector, ReflectiveInjector, Type} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';

import {applyRedirects} from './apply_redirects';
import {ResolveData, Routes, validateConfig} from './config';
import {createRouterState} from './create_router_state';
import {createUrlTree} from './create_url_tree';
import {RouterOutlet} from './directives/router_outlet';
import {recognize} from './recognize';
import {resolve} from './resolve';
import {RouterConfigLoader} from './router_config_loader';
import {RouterOutletMap} from './router_outlet_map';
import {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot, advanceActivatedRoute, createEmptyState} from './router_state';
import {PRIMARY_OUTLET, Params} from './shared';
import {UrlSerializer, UrlTree, createEmptyUrlTree} from './url_tree';
import {forEach, merge, shallowEqual, waitForMap} from './utils/collection';
import {TreeNode} from './utils/tree';

export interface NavigationExtras {
  relativeTo?: ActivatedRoute;
  queryParams?: Params;
  fragment?: string;
}

/**
 * An event triggered when a navigation starts
 *
 * @stable
 */
export class NavigationStart {
  constructor(public id: number, public url: string) {}

  toString(): string { return `NavigationStart(id: ${this.id}, url: '${this.url}')`; }
}

/**
 * An event triggered when a navigation ends successfully
 *
 * @stable
 */
export class NavigationEnd {
  constructor(public id: number, public url: string, public urlAfterRedirects: string) {}

  toString(): string {
    return `NavigationEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}')`;
  }
}

/**
 * An event triggered when a navigation is canceled
 *
 * @stable
 */
export class NavigationCancel {
  constructor(public id: number, public url: string) {}

  toString(): string { return `NavigationCancel(id: ${this.id}, url: '${this.url}')`; }
}

/**
 * An event triggered when a navigation fails due to unexpected error
 *
 * @stable
 */
export class NavigationError {
  constructor(public id: number, public url: string, public error: any) {}

  toString(): string {
    return `NavigationError(id: ${this.id}, url: '${this.url}', error: ${this.error})`;
  }
}

/**
 * An event triggered when routes are recognized
 *
 * @stable
 */
export class RoutesRecognized {
  constructor(
      public id: number, public url: string, public urlAfterRedirects: string,
      public state: RouterStateSnapshot) {}

  toString(): string {
    return `RoutesRecognized(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
}

/**
 * @stable
 */
export type Event = NavigationStart | NavigationEnd | NavigationCancel | NavigationError;

/**
 * The `Router` is responsible for mapping URLs to components.
 *
 * See {@link Routes} for more details and examples.
 *
 * @stable
 */
export class Router {
  private currentUrlTree: UrlTree;
  private currentRouterState: RouterState;
  private locationSubscription: Subscription;
  private routerEvents: Subject<Event>;
  private navigationId: number = 0;
  private config: Routes;
  private futureUrlTree: UrlTree;
  private configLoader: RouterConfigLoader;

  /**
   * Creates the router service.
   */
  constructor(
      private rootComponentType: Type, private resolver: ComponentResolver,
      private urlSerializer: UrlSerializer, private outletMap: RouterOutletMap,
      private location: Location, private injector: Injector, loader: AppModuleFactoryLoader,
      config: Routes) {
    this.resetConfig(config);
    this.routerEvents = new Subject<Event>();
    this.currentUrlTree = createEmptyUrlTree();
    this.futureUrlTree = this.currentUrlTree;
    this.configLoader = new RouterConfigLoader(loader);
    this.currentRouterState = createEmptyState(this.currentUrlTree, this.rootComponentType);
  }

  /**
   * @internal
   */
  initialNavigation(): void {
    this.setUpLocationChangeListener();
    this.navigateByUrl(this.location.path(true));
  }

  /**
   * Returns the current route state.
   */
  get routerState(): RouterState { return this.currentRouterState; }

  /**
   * Returns the current url.
   */
  get url(): string { return this.serializeUrl(this.currentUrlTree); }

  /**
   * Returns an observable of route events
   */
  get events(): Observable<Event> { return this.routerEvents; }

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
  resetConfig(config: Routes): void {
    validateConfig(config);
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
   * // create /team/33/(user/11//aux:chat)
   * router.createUrlTree(['/team', 33, {outlets: {"": 'user/11', right: 'chat'}}]);
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
  createUrlTree(commands: any[], {relativeTo, queryParams, fragment}: NavigationExtras = {}):
      UrlTree {
    const a = relativeTo ? relativeTo : this.routerState.root;
    return createUrlTree(a, this.currentUrlTree, commands, queryParams, fragment);
  }

  /**
   * Used by RouterLinkWithHref to update HREFs.
   * We have to use the futureUrl because we run change detection ind the middle of activation when
   * the current url has not been updated yet.
   * @internal
   */
  createUrlTreeUsingFutureUrl(
      commands: any[], {relativeTo, queryParams, fragment}: NavigationExtras = {}): UrlTree {
    const a = relativeTo ? relativeTo : this.routerState.root;
    return createUrlTree(a, this.futureUrlTree, commands, queryParams, fragment);
  }

  /**
   * Navigate based on the provided url. This navigation is always absolute.
   *
   * Returns a promise that:
   * - is resolved with 'true' when navigation succeeds
   * - is resolved with 'false' when navigation fails
   * - is rejected when an error happens
   *
   * ### Usage
   *
   * ```
   * router.navigateByUrl("/team/33/user/11");
   * ```
   */
  navigateByUrl(url: string|UrlTree): Promise<boolean> {
    if (url instanceof UrlTree) {
      return this.scheduleNavigation(url, false);
    } else {
      const urlTree = this.urlSerializer.parse(url);
      return this.scheduleNavigation(urlTree, false);
    }
  }

  /**
   * Navigate based on the provided array of commands and a starting point.
   * If no starting route is provided, the navigation is absolute.
   *
   * Returns a promise that:
   * - is resolved with 'true' when navigation succeeds
   * - is resolved with 'false' when navigation fails
   * - is rejected when an error happens
   *
   * ### Usage
   *
   * ```
   * router.navigate(['team', 33, 'team', '11], {relativeTo: route});
   * ```
   */
  navigate(commands: any[], extras: NavigationExtras = {}): Promise<boolean> {
    return this.scheduleNavigation(this.createUrlTree(commands, extras), false);
  }

  /**
   * Serializes a {@link UrlTree} into a string.
   */
  serializeUrl(url: UrlTree): string { return this.urlSerializer.serialize(url); }

  /**
   * Parse a string into a {@link UrlTree}.
   */
  parseUrl(url: string): UrlTree { return this.urlSerializer.parse(url); }

  private scheduleNavigation(url: UrlTree, preventPushState: boolean): Promise<boolean> {
    const id = ++this.navigationId;
    this.routerEvents.next(new NavigationStart(id, this.serializeUrl(url)));
    return Promise.resolve().then((_) => this.runNavigate(url, preventPushState, id));
  }

  private setUpLocationChangeListener(): void {
    this.locationSubscription = <any>this.location.subscribe((change) => {
      return this.scheduleNavigation(this.urlSerializer.parse(change['url']), change['pop']);
    });
  }

  private runNavigate(url: UrlTree, preventPushState: boolean, id: number): Promise<boolean> {
    if (id !== this.navigationId) {
      this.location.go(this.urlSerializer.serialize(this.currentUrlTree));
      this.routerEvents.next(new NavigationCancel(id, this.serializeUrl(url)));
      return Promise.resolve(false);
    }

    return new Promise((resolvePromise, rejectPromise) => {
      let state: RouterState;
      let navigationIsSuccessful: boolean;
      let preActivation: PreActivation;
      applyRedirects(this.configLoader, url, this.config)
          .mergeMap(u => {
            this.futureUrlTree = u;
            return recognize(
                this.rootComponentType, this.config, this.futureUrlTree,
                this.serializeUrl(this.futureUrlTree));
          })

          .mergeMap((newRouterStateSnapshot) => {
            this.routerEvents.next(new RoutesRecognized(
                id, this.serializeUrl(url), this.serializeUrl(this.futureUrlTree),
                newRouterStateSnapshot));
            return resolve(this.resolver, newRouterStateSnapshot);

          })
          .map((routerStateSnapshot) => {
            return createRouterState(routerStateSnapshot, this.currentRouterState);

          })
          .map((newState: RouterState) => {
            state = newState;
            preActivation =
                new PreActivation(state.snapshot, this.currentRouterState.snapshot, this.injector);
            preActivation.traverse(this.outletMap);
          })
          .mergeMap(_ => {
            return preActivation.checkGuards();

          })
          .mergeMap(shouldActivate => {
            if (shouldActivate) {
              return preActivation.resolveData().map(() => shouldActivate);
            } else {
              return Observable.of(shouldActivate);
            }

          })
          .forEach((shouldActivate: boolean) => {
            if (!shouldActivate || id !== this.navigationId) {
              this.routerEvents.next(new NavigationCancel(id, this.serializeUrl(url)));
              navigationIsSuccessful = false;
              return;
            }

            new ActivateRoutes(state, this.currentRouterState).activate(this.outletMap);

            this.currentUrlTree = this.futureUrlTree;
            this.currentRouterState = state;
            if (!preventPushState) {
              let path = this.urlSerializer.serialize(this.futureUrlTree);
              if (this.location.isCurrentPathEqualTo(path)) {
                this.location.replaceState(path);
              } else {
                this.location.go(path);
              }
            }
            navigationIsSuccessful = true;
          })
          .then(
              () => {
                this.routerEvents.next(new NavigationEnd(
                    id, this.serializeUrl(url), this.serializeUrl(this.futureUrlTree)));
                resolvePromise(navigationIsSuccessful);
              },
              e => {
                this.routerEvents.next(new NavigationError(id, this.serializeUrl(url), e));
                rejectPromise(e);
              });
    });
  }
}

/**
 * @experimental
 */
class CanActivate {
  constructor(public route: ActivatedRouteSnapshot) {}
}

/**
 * @experimental
 */
class CanDeactivate {
  constructor(public component: Object, public route: ActivatedRouteSnapshot) {}
}

class PreActivation {
  private checks: Array<CanActivate|CanDeactivate> = [];
  constructor(
      private future: RouterStateSnapshot, private curr: RouterStateSnapshot,
      private injector: Injector) {}

  traverse(parentOutletMap: RouterOutletMap): void {
    const futureRoot = this.future._root;
    const currRoot = this.curr ? this.curr._root : null;
    this.traverseChildRoutes(futureRoot, currRoot, parentOutletMap);
  }

  checkGuards(): Observable<boolean> {
    if (this.checks.length === 0) return Observable.of(true);
    return Observable.from(this.checks)
        .map(s => {
          if (s instanceof CanActivate) {
            return this.runCanActivate(s.route);
          } else if (s instanceof CanDeactivate) {
            // workaround https://github.com/Microsoft/TypeScript/issues/7271
            const s2 = s as CanDeactivate;
            return this.runCanDeactivate(s2.component, s2.route);
          } else {
            throw new Error('Cannot be reached');
          }
        })
        .mergeAll()
        .every(result => result === true);
  }

  resolveData(): Observable<any> {
    if (this.checks.length === 0) return Observable.of(null);
    return Observable.from(this.checks)
        .mergeMap(s => {
          if (s instanceof CanActivate) {
            return this.runResolve(s.route);
          } else {
            return Observable.of(null);
          }
        })
        .reduce((_, __) => _);
  }

  private traverseChildRoutes(
      futureNode: TreeNode<ActivatedRouteSnapshot>, currNode: TreeNode<ActivatedRouteSnapshot>,
      outletMap: RouterOutletMap): void {
    const prevChildren: {[key: string]: any} = nodeChildrenAsMap(currNode);
    futureNode.children.forEach(c => {
      this.traverseRoutes(c, prevChildren[c.value.outlet], outletMap);
      delete prevChildren[c.value.outlet];
    });
    forEach(
        prevChildren,
        (v: any, k: string) => this.deactivateOutletAndItChildren(v, outletMap._outlets[k]));
  }

  traverseRoutes(
      futureNode: TreeNode<ActivatedRouteSnapshot>, currNode: TreeNode<ActivatedRouteSnapshot>,
      parentOutletMap: RouterOutletMap): void {
    const future = futureNode.value;
    const curr = currNode ? currNode.value : null;
    const outlet = parentOutletMap ? parentOutletMap._outlets[futureNode.value.outlet] : null;

    // reusing the node
    if (curr && future._routeConfig === curr._routeConfig) {
      if (!shallowEqual(future.params, curr.params)) {
        this.checks.push(new CanDeactivate(outlet.component, curr), new CanActivate(future));
      }

      // If we have a component, we need to go through an outlet.
      if (future.component) {
        this.traverseChildRoutes(futureNode, currNode, outlet ? outlet.outletMap : null);

        // if we have a componentless route, we recurse but keep the same outlet map.
      } else {
        this.traverseChildRoutes(futureNode, currNode, parentOutletMap);
      }
    } else {
      if (curr) {
        // if we had a normal route, we need to deactivate only that outlet.
        if (curr.component) {
          this.deactivateOutletAndItChildren(curr, outlet);

          // if we had a componentless route, we need to deactivate everything!
        } else {
          this.deactivateOutletMap(parentOutletMap);
        }
      }

      this.checks.push(new CanActivate(future));
      // If we have a component, we need to go through an outlet.
      if (future.component) {
        this.traverseChildRoutes(futureNode, null, outlet ? outlet.outletMap : null);

        // if we have a componentless route, we recurse but keep the same outlet map.
      } else {
        this.traverseChildRoutes(futureNode, null, parentOutletMap);
      }
    }
  }

  private deactivateOutletAndItChildren(route: ActivatedRouteSnapshot, outlet: RouterOutlet): void {
    if (outlet && outlet.isActivated) {
      this.deactivateOutletMap(outlet.outletMap);
      this.checks.push(new CanDeactivate(outlet.component, route));
    }
  }

  private deactivateOutletMap(outletMap: RouterOutletMap): void {
    forEach(outletMap._outlets, (v: RouterOutlet) => {
      if (v.isActivated) {
        this.deactivateOutletAndItChildren(v.activatedRoute.snapshot, v);
      }
    });
  }

  private runCanActivate(future: ActivatedRouteSnapshot): Observable<boolean> {
    const canActivate = future._routeConfig ? future._routeConfig.canActivate : null;
    if (!canActivate || canActivate.length === 0) return Observable.of(true);
    return Observable.from(canActivate)
        .map(c => {
          const guard = this.injector.get(c);
          if (guard.canActivate) {
            return wrapIntoObservable(guard.canActivate(future, this.future));
          } else {
            return wrapIntoObservable(guard(future, this.future));
          }
        })
        .mergeAll()
        .every(result => result === true);
  }

  private runCanDeactivate(component: Object, curr: ActivatedRouteSnapshot): Observable<boolean> {
    const canDeactivate = curr && curr._routeConfig ? curr._routeConfig.canDeactivate : null;
    if (!canDeactivate || canDeactivate.length === 0) return Observable.of(true);
    return Observable.from(canDeactivate)
        .map(c => {
          const guard = this.injector.get(c);

          if (guard.canDeactivate) {
            return wrapIntoObservable(guard.canDeactivate(component, curr, this.curr));
          } else {
            return wrapIntoObservable(guard(component, curr, this.curr));
          }
        })
        .mergeAll()
        .every(result => result === true);
  }

  private runResolve(future: ActivatedRouteSnapshot): Observable<any> {
    const resolve = future._resolve;
    return this.resolveNode(resolve.current, future).map(resolvedData => {
      resolve.resolvedData = resolvedData;
      future.data = merge(future.data, resolve.flattenedResolvedData);
      return null;
    });
  }

  private resolveNode(resolve: ResolveData, future: ActivatedRouteSnapshot): Observable<any> {
    return waitForMap(resolve, (k, v) => {
      const resolver = this.injector.get(v);
      return resolver.resolve ? wrapIntoObservable(resolver.resolve(future, this.future)) :
                                wrapIntoObservable(resolver(future, this.future));
    });
  }
}

function wrapIntoObservable<T>(value: T | Observable<T>): Observable<T> {
  if (value instanceof Observable) {
    return value;
  } else {
    return Observable.of(value);
  }
}

class ActivateRoutes {
  constructor(private futureState: RouterState, private currState: RouterState) {}

  activate(parentOutletMap: RouterOutletMap): void {
    const futureRoot = this.futureState._root;
    const currRoot = this.currState ? this.currState._root : null;
    pushQueryParamsAndFragment(this.futureState);
    advanceActivatedRoute(this.futureState.root);
    this.activateChildRoutes(futureRoot, currRoot, parentOutletMap);
  }

  private activateChildRoutes(
      futureNode: TreeNode<ActivatedRoute>, currNode: TreeNode<ActivatedRoute>,
      outletMap: RouterOutletMap): void {
    const prevChildren: {[key: string]: any} = nodeChildrenAsMap(currNode);
    futureNode.children.forEach(c => {
      this.activateRoutes(c, prevChildren[c.value.outlet], outletMap);
      delete prevChildren[c.value.outlet];
    });
    forEach(
        prevChildren,
        (v: any, k: string) => this.deactivateOutletAndItChildren(outletMap._outlets[k]));
  }

  activateRoutes(
      futureNode: TreeNode<ActivatedRoute>, currNode: TreeNode<ActivatedRoute>,
      parentOutletMap: RouterOutletMap): void {
    const future = futureNode.value;
    const curr = currNode ? currNode.value : null;

    // reusing the node
    if (future === curr) {
      // advance the route to push the parameters
      advanceActivatedRoute(future);

      // If we have a normal route, we need to go through an outlet.
      if (future.component) {
        const outlet = getOutlet(parentOutletMap, futureNode.value);
        this.activateChildRoutes(futureNode, currNode, outlet.outletMap);

        // if we have a componentless route, we recurse but keep the same outlet map.
      } else {
        this.activateChildRoutes(futureNode, currNode, parentOutletMap);
      }
    } else {
      if (curr) {
        // if we had a normal route, we need to deactivate only that outlet.
        if (curr.component) {
          const outlet = getOutlet(parentOutletMap, futureNode.value);
          this.deactivateOutletAndItChildren(outlet);

          // if we had a componentless route, we need to deactivate everything!
        } else {
          this.deactivateOutletMap(parentOutletMap);
        }
      }

      // if we have a normal route, we need to advance the route
      // and place the component into the outlet. After that recurse.
      if (future.component) {
        advanceActivatedRoute(future);
        const outlet = getOutlet(parentOutletMap, futureNode.value);
        const outletMap = new RouterOutletMap();
        this.placeComponentIntoOutlet(outletMap, future, outlet);
        this.activateChildRoutes(futureNode, null, outletMap);

        // if we have a componentless route, we recurse but keep the same outlet map.
      } else {
        advanceActivatedRoute(future);
        this.activateChildRoutes(futureNode, null, parentOutletMap);
      }
    }
  }

  private placeComponentIntoOutlet(
      outletMap: RouterOutletMap, future: ActivatedRoute, outlet: RouterOutlet): void {
    const resolved = <any[]>[{provide: ActivatedRoute, useValue: future}, {
      provide: RouterOutletMap,
      useValue: outletMap
    }];

    const parentFuture = this.futureState.parent(future);  // find the closest parent?
    const config = parentFuture ? parentFuture.snapshot._routeConfig : null;
    let loadedFactoryResolver: ComponentFactoryResolver = null;

    if (config && (<any>config)._loadedConfig) {
      const loadedResolver = (<any>config)._loadedConfig.factoryResolver;
      loadedFactoryResolver = loadedResolver;
      resolved.push({provide: ComponentFactoryResolver, useValue: loadedResolver});
    };

    outlet.activate(future, loadedFactoryResolver, ReflectiveInjector.resolve(resolved), outletMap);
  }

  private deactivateOutletAndItChildren(outlet: RouterOutlet): void {
    if (outlet && outlet.isActivated) {
      this.deactivateOutletMap(outlet.outletMap);
      outlet.deactivate();
    }
  }

  private deactivateOutletMap(outletMap: RouterOutletMap): void {
    forEach(outletMap._outlets, (v: RouterOutlet) => this.deactivateOutletAndItChildren(v));
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

function nodeChildrenAsMap(node: TreeNode<any>) {
  return node ? node.children.reduce((m: any, c: TreeNode<any>) => {
    m[c.value.outlet] = c;
    return m;
  }, {}) : {};
}

function getOutlet(outletMap: RouterOutletMap, route: ActivatedRoute): RouterOutlet {
  let outlet = outletMap._outlets[route.outlet];
  if (!outlet) {
    const componentName = (<any>route.component).name;
    if (route.outlet === PRIMARY_OUTLET) {
      throw new Error(`Cannot find primary outlet to load '${componentName}'`);
    } else {
      throw new Error(`Cannot find the outlet ${route.outlet} to load '${componentName}'`);
    }
  }
  return outlet;
}
