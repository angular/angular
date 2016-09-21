/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location} from '@angular/common';
import {Compiler, ComponentFactoryResolver, Injector, NgModuleFactoryLoader, ReflectiveInjector, Type} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {from} from 'rxjs/observable/from';
import {of } from 'rxjs/observable/of';
import {every} from 'rxjs/operator/every';
import {map} from 'rxjs/operator/map';
import {mergeAll} from 'rxjs/operator/mergeAll';
import {mergeMap} from 'rxjs/operator/mergeMap';
import {reduce} from 'rxjs/operator/reduce';

import {applyRedirects} from './apply_redirects';
import {ResolveData, Routes, validateConfig} from './config';
import {createRouterState} from './create_router_state';
import {createUrlTree} from './create_url_tree';
import {RouterOutlet} from './directives/router_outlet';
import {recognize} from './recognize';
import {LoadedRouterConfig, RouterConfigLoader} from './router_config_loader';
import {RouterOutletMap} from './router_outlet_map';
import {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot, advanceActivatedRoute, createEmptyState} from './router_state';
import {NavigationCancelingError, PRIMARY_OUTLET, Params} from './shared';
import {UrlSerializer, UrlTree, containsTree, createEmptyUrlTree} from './url_tree';
import {andObservables, forEach, merge, shallowEqual, waitForMap, wrapIntoObservable} from './utils/collection';
import {TreeNode} from './utils/tree';

declare var Zone: any;

/**
 * @whatItDoes Represents the extra options used during navigation.
 *
 * @stable
 */
export interface NavigationExtras {
  /**
  * Enables relative navigation from the current ActivatedRoute.
  *
  * Configuration:
  *
  * ```
  * [{
  *   path: 'parent',
  *   component: ParentComponent,
  *   children: [
  *     {
  *       path: 'list',
  *       component: ListComponent
  *     },
  *     {
  *       path: 'child',
  *       component: ChildComponent
  *     }
  *   ]
  * }]
  * ```
  *
  * Navigate to list route from child route:
  *
  * ```
  *  @Component({...})
  *  class ChildComponent {
  *    constructor(private router: Router, private route: ActivatedRoute) {}
  *
  *    go() {
  *      this.router.navigate(['../list'], { relativeTo: this.route });
  *    }
  *  }
  * ```
  */
  relativeTo?: ActivatedRoute;

  /**
  * Sets query parameters to the URL.
  *
  * ```
  * // Navigate to /results?page=1
  * this.router.navigate(['/results'], { queryParams: { page: 1 } });
  * ```
  */
  queryParams?: Params;

  /**
  * Sets the hash fragment for the URL.
  *
  * ```
  * // Navigate to /results#top
  * this.router.navigate(['/results'], { fragment: 'top' });
  * ```
  */
  fragment?: string;

  /**
  * Preserves the query parameters for the next navigation.
  *
  * ```
  * // Preserve query params from /results?page=1 to /view?page=1
  * this.router.navigate(['/view'], { preserveQueryParams: true });
  * ```
  */
  preserveQueryParams?: boolean;
  /**
  * Preserves the fragment for the next navigation
  *
  * ```
  * // Preserve fragment from /results#top to /view#top
  * this.router.navigate(['/view'], { preserveFragment: true });
  * ```
  */
  preserveFragment?: boolean;
  /**
  * Navigates without pushing a new state into history.
  *
  * ```
  * // Navigate silently to /view
  * this.router.navigate(['/view'], { skipLocationChange: true });
  * ```
  */
  skipLocationChange?: boolean;
  /**
  * Navigates while replacing the current state in history.
  *
  * ```
  * // Navigate to /view
  * this.router.navigate(['/view'], { replaceUrl: true });
  * ```
  */
  replaceUrl?: boolean;
}

/**
 * @whatItDoes Represents an event triggered when a navigation starts.
 *
 * @stable
 */
export class NavigationStart {
  // TODO: vsavkin: make internal
  constructor(
      /** @docsNotRequired */
      public id: number,

      /** @docsNotRequired */
      public url: string) {}

  /** @docsNotRequired */
  toString(): string { return `NavigationStart(id: ${this.id}, url: '${this.url}')`; }
}

/**
 * @whatItDoes Represents an event triggered when a navigation ends successfully.
 *
 * @stable
 */
export class NavigationEnd {
  // TODO: vsavkin: make internal
  constructor(
      /** @docsNotRequired */
      public id: number,

      /** @docsNotRequired */
      public url: string,

      /** @docsNotRequired */
      public urlAfterRedirects: string) {}

  /** @docsNotRequired */
  toString(): string {
    return `NavigationEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}')`;
  }
}

/**
 * @whatItDoes Represents an event triggered when a navigation is canceled.
 *
 * @stable
 */
export class NavigationCancel {
  // TODO: vsavkin: make internal
  constructor(
      /** @docsNotRequired */
      public id: number,

      /** @docsNotRequired */
      public url: string,

      /** @docsNotRequired */
      public reason: string) {}

  /** @docsNotRequired */
  toString(): string { return `NavigationCancel(id: ${this.id}, url: '${this.url}')`; }
}

/**
 * @whatItDoes Represents an event triggered when a navigation fails due to an unexpected error.
 *
 * @stable
 */
export class NavigationError {
  // TODO: vsavkin: make internal
  constructor(
      /** @docsNotRequired */
      public id: number,

      /** @docsNotRequired */
      public url: string,

      /** @docsNotRequired */
      public error: any) {}

  /** @docsNotRequired */
  toString(): string {
    return `NavigationError(id: ${this.id}, url: '${this.url}', error: ${this.error})`;
  }
}

/**
 * @whatItDoes Represents an event triggered when routes are recognized.
 *
 * @stable
 */
export class RoutesRecognized {
  // TODO: vsavkin: make internal
  constructor(
      /** @docsNotRequired */
      public id: number,

      /** @docsNotRequired */
      public url: string,
      /** @docsNotRequired */
      public urlAfterRedirects: string,
      /** @docsNotRequired */
      public state: RouterStateSnapshot) {}

  /** @docsNotRequired */
  toString(): string {
    return `RoutesRecognized(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
}

/**
 * @whatItDoes Represents a router event.
 *
 * Please see {@link NavigationStart}, {@link NavigationEnd}, {@link NavigationCancel}, {@link
 * NavigationError},
 * {@link RoutesRecognized} for more information.
 *
 * @stable
 */
export type Event =
    NavigationStart | NavigationEnd | NavigationCancel | NavigationError | RoutesRecognized;

/**
 * @whatItDoes Error handler that is invoked when a navigation errors.
 *
 * @description
 * If the handler returns a value, the navigation promise will be resolved with this value.
 * If the handler throws an exception, the navigation promise will be rejected with
 * the exception.
 *
 * @stable
 */
export type ErrorHandler = (error: any) => any;

function defaultErrorHandler(error: any): any {
  throw error;
}

/**
 * @whatItDoes Provides the navigation and url manipulation capabilities.
 *
 * See {@link Routes} for more details and examples.
 *
 * @ngModule RouterModule
 *
 * @stable
 */
export class Router {
  private currentUrlTree: UrlTree;
  private currentRouterState: RouterState;
  private locationSubscription: Subscription;
  private routerEvents: Subject<Event>;
  private navigationId: number = 0;
  private configLoader: RouterConfigLoader;

  /**
   * Error handler that is invoked when a navigation errors.
   *
   * See {@link ErrorHandler} for more information.
   */
  errorHandler: ErrorHandler = defaultErrorHandler;

  /**
   * Indicates if at least one navigation happened.
   */
  navigated: boolean = false;

  /**
   * Creates the router service.
   */
  // TODO: vsavkin make internal after the final is out.
  constructor(
      private rootComponentType: Type<any>, private urlSerializer: UrlSerializer,
      private outletMap: RouterOutletMap, private location: Location, private injector: Injector,
      loader: NgModuleFactoryLoader, compiler: Compiler, public config: Routes) {
    this.resetConfig(config);
    this.routerEvents = new Subject<Event>();
    this.currentUrlTree = createEmptyUrlTree();
    this.configLoader = new RouterConfigLoader(loader, compiler);
    this.currentRouterState = createEmptyState(this.currentUrlTree, this.rootComponentType);
  }

  /**
   * @internal
   * TODO: this should be removed once the constructor of the router made internal
   */
  resetRootComponentType(rootComponentType: Type<any>): void {
    this.rootComponentType = rootComponentType;
    // TODO: vsavkin router 4.0 should make the root component set to null
    // this will simplify the lifecycle of the router.
    this.currentRouterState.root.component = this.rootComponentType;
  }

  /**
   * Sets up the location change listener and performs the initial navigation.
   */
  initialNavigation(): void {
    this.setUpLocationChangeListener();
    this.navigateByUrl(this.location.path(true), {replaceUrl: true});
  }

  /**
   * Sets up the location change listener.
   */
  setUpLocationChangeListener(): void {
    // Zone.current.wrap is needed because of the issue with RxJS scheduler,
    // which does not work properly with zone.js in IE and Safari
    this.locationSubscription = <any>this.location.subscribe(Zone.current.wrap((change: any) => {
      const tree = this.urlSerializer.parse(change['url']);
      // we fire multiple events for a single URL change
      // we should navigate only once
      return this.currentUrlTree.toString() !== tree.toString() ?
          this.scheduleNavigation(tree, {skipLocationChange: change['pop'], replaceUrl: true}) :
          null;
    }));
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
   * @docsNotRequired
   */
  ngOnDestroy() { this.dispose(); }

  /**
   * Disposes of the router.
   */
  dispose(): void { this.locationSubscription.unsubscribe(); }

  /**
   * Applies an array of commands to the current url tree and creates a new url tree.
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
   * // you can collapse static segments like this (this works only with the first passed-in value):
   * router.createUrlTree(['/team/33/user', userId]);
   *
   * // If the first segment can contain slashes, and you do not want the router to split it, you
   * // can do the following:
   *
   * router.createUrlTree([{segmentPath: '/one/two'}]);
   *
   * // create /team/33/(user/11//right:chat)
   * router.createUrlTree(['/team', 33, {outlets: {primary: 'user/11', right: 'chat'}}]);
   *
   * // remove the right secondary node
   * router.createUrlTree(['/team', 33, {outlets: {primary: 'user/11', right: null}}]);
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
  createUrlTree(
      commands: any[], {relativeTo, queryParams, fragment, preserveQueryParams,
                        preserveFragment}: NavigationExtras = {}): UrlTree {
    const a = relativeTo ? relativeTo : this.routerState.root;
    const q = preserveQueryParams ? this.currentUrlTree.queryParams : queryParams;
    const f = preserveFragment ? this.currentUrlTree.fragment : fragment;
    return createUrlTree(a, this.currentUrlTree, commands, q, f);
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
   *
   * // Navigate without updating the URL
   * router.navigateByUrl("/team/33/user/11", { skipLocationChange: true });
   * ```
   *
   * In opposite to `navigate`, `navigateByUrl` takes a whole URL
   * and does not apply any delta to the current one.
   */
  navigateByUrl(url: string|UrlTree, extras: NavigationExtras = {skipLocationChange: false}):
      Promise<boolean> {
    if (url instanceof UrlTree) {
      return this.scheduleNavigation(url, extras);
    } else {
      const urlTree = this.urlSerializer.parse(url);
      return this.scheduleNavigation(urlTree, extras);
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
   * router.navigate(['team', 33, 'user', 11], {relativeTo: route});
   *
   * // Navigate without updating the URL
   * router.navigate(['team', 33, 'user', 11], {relativeTo: route, skipLocationChange: true });
   * ```
   *
   * In opposite to `navigateByUrl`, `navigate` always takes a delta
   * that is applied to the current URL.
   */
  navigate(commands: any[], extras: NavigationExtras = {skipLocationChange: false}):
      Promise<boolean> {
    return this.scheduleNavigation(this.createUrlTree(commands, extras), extras);
  }

  /**
   * Serializes a {@link UrlTree} into a string.
   */
  serializeUrl(url: UrlTree): string { return this.urlSerializer.serialize(url); }

  /**
   * Parses a string into a {@link UrlTree}.
   */
  parseUrl(url: string): UrlTree { return this.urlSerializer.parse(url); }

  /**
   * Returns if the url is activated or not.
   */
  isActive(url: string|UrlTree, exact: boolean): boolean {
    if (url instanceof UrlTree) {
      return containsTree(this.currentUrlTree, url, exact);
    } else {
      const urlTree = this.urlSerializer.parse(url);
      return containsTree(this.currentUrlTree, urlTree, exact);
    }
  }

  private scheduleNavigation(url: UrlTree, extras: NavigationExtras): Promise<boolean> {
    const id = ++this.navigationId;
    this.routerEvents.next(new NavigationStart(id, this.serializeUrl(url)));
    return Promise.resolve().then(
        (_) => this.runNavigate(url, extras.skipLocationChange, extras.replaceUrl, id));
  }

  private runNavigate(
      url: UrlTree, shouldPreventPushState: boolean, shouldReplaceUrl: boolean,
      id: number): Promise<boolean> {
    if (id !== this.navigationId) {
      this.location.go(this.urlSerializer.serialize(this.currentUrlTree));
      this.routerEvents.next(new NavigationCancel(
          id, this.serializeUrl(url),
          `Navigation ID ${id} is not equal to the current navigation id ${this.navigationId}`));
      return Promise.resolve(false);
    }

    return new Promise((resolvePromise, rejectPromise) => {
      let state: RouterState;
      let navigationIsSuccessful: boolean;
      let preActivation: PreActivation;

      let appliedUrl: UrlTree;

      const storedState = this.currentRouterState;
      const storedUrl = this.currentUrlTree;

      const redirectsApplied$ = applyRedirects(this.injector, this.configLoader, url, this.config);

      const snapshot$ = mergeMap.call(redirectsApplied$, (u: UrlTree) => {
        appliedUrl = u;
        return recognize(
            this.rootComponentType, this.config, appliedUrl, this.serializeUrl(appliedUrl));
      });

      const emitRecognzied$ = map.call(snapshot$, (newRouterStateSnapshot: RouterStateSnapshot) => {
        this.routerEvents.next(new RoutesRecognized(
            id, this.serializeUrl(url), this.serializeUrl(appliedUrl), newRouterStateSnapshot));
        return newRouterStateSnapshot;
      });

      const routerState$ = map.call(emitRecognzied$, (routerStateSnapshot: RouterStateSnapshot) => {
        return createRouterState(routerStateSnapshot, this.currentRouterState);
      });

      const preactivation$ = map.call(routerState$, (newState: RouterState) => {
        state = newState;
        preActivation =
            new PreActivation(state.snapshot, this.currentRouterState.snapshot, this.injector);
        preActivation.traverse(this.outletMap);
      });

      const preactivation2$ =
          mergeMap.call(preactivation$, () => { return preActivation.checkGuards(); });

      const resolveData$ = mergeMap.call(preactivation2$, (shouldActivate: boolean) => {
        if (shouldActivate) {
          return map.call(preActivation.resolveData(), () => shouldActivate);
        } else {
          return of (shouldActivate);
        }
      });

      resolveData$
          .forEach((shouldActivate: boolean) => {
            if (!shouldActivate || id !== this.navigationId) {
              navigationIsSuccessful = false;
              return;
            }

            this.currentUrlTree = appliedUrl;
            this.currentRouterState = state;

            if (!shouldPreventPushState) {
              let path = this.urlSerializer.serialize(appliedUrl);
              if (this.location.isCurrentPathEqualTo(path) || shouldReplaceUrl) {
                this.location.replaceState(path);
              } else {
                this.location.go(path);
              }
            }

            new ActivateRoutes(state, storedState).activate(this.outletMap);

            navigationIsSuccessful = true;
          })
          .then(
              () => {
                this.navigated = true;
                if (navigationIsSuccessful) {
                  this.routerEvents.next(
                      new NavigationEnd(id, this.serializeUrl(url), this.serializeUrl(appliedUrl)));
                  resolvePromise(true);
                } else {
                  this.routerEvents.next(new NavigationCancel(id, this.serializeUrl(url), ''));
                  resolvePromise(false);
                }
              },
              (e: any) => {
                if (e instanceof NavigationCancelingError) {
                  this.navigated = true;
                  this.routerEvents.next(
                      new NavigationCancel(id, this.serializeUrl(url), e.message));
                  resolvePromise(false);
                } else {
                  this.routerEvents.next(new NavigationError(id, this.serializeUrl(url), e));
                  try {
                    resolvePromise(this.errorHandler(e));
                  } catch (ee) {
                    rejectPromise(ee);
                  }
                }

                if (id === this.navigationId) {
                  this.currentRouterState = storedState;
                  this.currentUrlTree = storedUrl;
                  this.location.replaceState(this.serializeUrl(storedUrl));
                }
              });
    });
  }
}


class CanActivate {
  constructor(public path: ActivatedRouteSnapshot[]) {}
  get route(): ActivatedRouteSnapshot { return this.path[this.path.length - 1]; }
}

class CanDeactivate {
  constructor(public component: Object, public route: ActivatedRouteSnapshot) {}
}


export class PreActivation {
  private checks: Array<CanActivate|CanDeactivate> = [];
  constructor(
      private future: RouterStateSnapshot, private curr: RouterStateSnapshot,
      private injector: Injector) {}

  traverse(parentOutletMap: RouterOutletMap): void {
    const futureRoot = this.future._root;
    const currRoot = this.curr ? this.curr._root : null;
    this.traverseChildRoutes(futureRoot, currRoot, parentOutletMap, [futureRoot.value]);
  }

  checkGuards(): Observable<boolean> {
    if (this.checks.length === 0) return of (true);
    const checks$ = from(this.checks);
    const runningChecks$ = map.call(checks$, (s: any) => {
      if (s instanceof CanActivate) {
        return andObservables(
            from([this.runCanActivateChild(s.path), this.runCanActivate(s.route)]));
      } else if (s instanceof CanDeactivate) {
        // workaround https://github.com/Microsoft/TypeScript/issues/7271
        const s2 = s as CanDeactivate;
        return this.runCanDeactivate(s2.component, s2.route);
      } else {
        throw new Error('Cannot be reached');
      }
    });
    const mergedChecks$ = mergeAll.call(runningChecks$);
    return every.call(mergedChecks$, (result: any) => result === true);
  }

  resolveData(): Observable<any> {
    if (this.checks.length === 0) return of (null);
    const checks$ = from(this.checks);
    const runningChecks$ = mergeMap.call(checks$, (s: any) => {
      if (s instanceof CanActivate) {
        return this.runResolve(s.route);
      } else {
        return of (null);
      }
    });
    return reduce.call(runningChecks$, (_: any, __: any) => _);
  }

  private traverseChildRoutes(
      futureNode: TreeNode<ActivatedRouteSnapshot>, currNode: TreeNode<ActivatedRouteSnapshot>,
      outletMap: RouterOutletMap, futurePath: ActivatedRouteSnapshot[]): void {
    const prevChildren: {[key: string]: any} = nodeChildrenAsMap(currNode);

    futureNode.children.forEach(c => {
      this.traverseRoutes(c, prevChildren[c.value.outlet], outletMap, futurePath.concat([c.value]));
      delete prevChildren[c.value.outlet];
    });
    forEach(
        prevChildren,
        (v: any, k: string) => this.deactivateOutletAndItChildren(v, outletMap._outlets[k]));
  }

  traverseRoutes(
      futureNode: TreeNode<ActivatedRouteSnapshot>, currNode: TreeNode<ActivatedRouteSnapshot>,
      parentOutletMap: RouterOutletMap, futurePath: ActivatedRouteSnapshot[]): void {
    const future = futureNode.value;
    const curr = currNode ? currNode.value : null;
    const outlet = parentOutletMap ? parentOutletMap._outlets[futureNode.value.outlet] : null;

    // reusing the node
    if (curr && future._routeConfig === curr._routeConfig) {
      if (!shallowEqual(future.params, curr.params)) {
        this.checks.push(new CanDeactivate(outlet.component, curr), new CanActivate(futurePath));
      } else {
        // we need to set the data
        future.data = curr.data;
      }

      // If we have a component, we need to go through an outlet.
      if (future.component) {
        this.traverseChildRoutes(
            futureNode, currNode, outlet ? outlet.outletMap : null, futurePath);

        // if we have a componentless route, we recurse but keep the same outlet map.
      } else {
        this.traverseChildRoutes(futureNode, currNode, parentOutletMap, futurePath);
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

      this.checks.push(new CanActivate(futurePath));
      // If we have a component, we need to go through an outlet.
      if (future.component) {
        this.traverseChildRoutes(futureNode, null, outlet ? outlet.outletMap : null, futurePath);

        // if we have a componentless route, we recurse but keep the same outlet map.
      } else {
        this.traverseChildRoutes(futureNode, null, parentOutletMap, futurePath);
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
    if (!canActivate || canActivate.length === 0) return of (true);
    const obs = map.call(from(canActivate), (c: any) => {
      const guard = this.getToken(c, future);
      if (guard.canActivate) {
        return wrapIntoObservable(guard.canActivate(future, this.future));
      } else {
        return wrapIntoObservable(guard(future, this.future));
      }
    });
    return andObservables(obs);
  }

  private runCanActivateChild(path: ActivatedRouteSnapshot[]): Observable<boolean> {
    const future = path[path.length - 1];

    const canActivateChildGuards = path.slice(0, path.length - 1)
                                       .reverse()
                                       .map(p => this.extractCanActivateChild(p))
                                       .filter(_ => _ !== null);

    return andObservables(map.call(from(canActivateChildGuards), (d: any) => {
      const obs = map.call(from(d.guards), (c: any) => {
        const guard = this.getToken(c, c.node);
        if (guard.canActivateChild) {
          return wrapIntoObservable(guard.canActivateChild(future, this.future));
        } else {
          return wrapIntoObservable(guard(future, this.future));
        }
      });
      return andObservables(obs);
    }));
  }

  private extractCanActivateChild(p: ActivatedRouteSnapshot):
      {node: ActivatedRouteSnapshot, guards: any[]} {
    const canActivateChild = p._routeConfig ? p._routeConfig.canActivateChild : null;
    if (!canActivateChild || canActivateChild.length === 0) return null;
    return {node: p, guards: canActivateChild};
  }

  private runCanDeactivate(component: Object, curr: ActivatedRouteSnapshot): Observable<boolean> {
    const canDeactivate = curr && curr._routeConfig ? curr._routeConfig.canDeactivate : null;
    if (!canDeactivate || canDeactivate.length === 0) return of (true);
    const canDeactivate$ = map.call(from(canDeactivate), (c: any) => {
      const guard = this.getToken(c, curr);
      if (guard.canDeactivate) {
        return wrapIntoObservable(guard.canDeactivate(component, curr, this.curr));
      } else {
        return wrapIntoObservable(guard(component, curr, this.curr));
      }
    });
    const merged$ = mergeAll.call(canDeactivate$);
    return every.call(merged$, (result: any) => result === true);
  }

  private runResolve(future: ActivatedRouteSnapshot): Observable<any> {
    const resolve = future._resolve;
    return map.call(this.resolveNode(resolve.current, future), (resolvedData: any): any => {
      resolve.resolvedData = resolvedData;
      future.data = merge(future.data, resolve.flattenedResolvedData);
      return null;
    });
  }

  private resolveNode(resolve: ResolveData, future: ActivatedRouteSnapshot): Observable<any> {
    return waitForMap(resolve, (k, v) => {
      const resolver = this.getToken(v, future);
      return resolver.resolve ? wrapIntoObservable(resolver.resolve(future, this.future)) :
                                wrapIntoObservable(resolver(future, this.future));
    });
  }

  private getToken(token: any, snapshot: ActivatedRouteSnapshot): any {
    const config = closestLoadedConfig(snapshot);
    const injector = config ? config.injector : this.injector;
    return injector.get(token);
  }
}

class ActivateRoutes {
  constructor(private futureState: RouterState, private currState: RouterState) {}

  activate(parentOutletMap: RouterOutletMap): void {
    const futureRoot = this.futureState._root;
    const currRoot = this.currState ? this.currState._root : null;
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

    const config = parentLoadedConfig(future.snapshot);

    let loadedFactoryResolver: ComponentFactoryResolver = null;
    let loadedInjector: Injector = null;

    if (config) {
      loadedFactoryResolver = config.factoryResolver;
      loadedInjector = config.injector;
      resolved.push({provide: ComponentFactoryResolver, useValue: loadedFactoryResolver});
    }
    outlet.activate(
        future, loadedFactoryResolver, loadedInjector, ReflectiveInjector.resolve(resolved),
        outletMap);
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

function parentLoadedConfig(snapshot: ActivatedRouteSnapshot): LoadedRouterConfig {
  let s = snapshot.parent;
  while (s) {
    const c: any = s._routeConfig;
    if (c && c._loadedConfig) return c._loadedConfig;
    if (c && c.component) return null;
    s = s.parent;
  }
  return null;
}

function closestLoadedConfig(snapshot: ActivatedRouteSnapshot): LoadedRouterConfig {
  if (!snapshot) return null;

  let s = snapshot.parent;
  while (s) {
    const c: any = s._routeConfig;
    if (c && c._loadedConfig) return c._loadedConfig;
    s = s.parent;
  }
  return null;
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
