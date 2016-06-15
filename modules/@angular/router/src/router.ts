import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/every';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/observable/from';

import {Location} from '@angular/common';
import {ComponentResolver, Injector, ReflectiveInjector, Type} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {of } from 'rxjs/observable/of';

import {applyRedirects} from './apply_redirects';
import {RouterConfig} from './config';
import {createRouterState} from './create_router_state';
import {createUrlTree} from './create_url_tree';
import {RouterOutlet} from './directives/router_outlet';
import {recognize} from './recognize';
import {resolve} from './resolve';
import {RouterOutletMap} from './router_outlet_map';
import {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot, advanceActivatedRoute, createEmptyState} from './router_state';
import {PRIMARY_OUTLET, Params} from './shared';
import {UrlSerializer} from './url_serializer';
import {UrlTree, createEmptyUrlTree} from './url_tree';
import {forEach, shallowEqual} from './utils/collection';
import {TreeNode} from './utils/tree';

export interface NavigationExtras {
  relativeTo?: ActivatedRoute;
  queryParams?: Params;
  fragment?: string;
}

/**
 * An event triggered when a navigation starts
 */
export class NavigationStart {
  constructor(public id: number, public url: string) {}

  toString(): string { return `NavigationStart(id: ${this.id}, url: '${this.url}')`; }
}

/**
 * An event triggered when a navigation ends successfully
 */
export class NavigationEnd {
  constructor(public id: number, public url: string, public urlAfterRedirects: string) {}

  toString(): string {
    return `NavigationEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}')`;
  }
}

/**
 * An event triggered when a navigation is canceled
 */
export class NavigationCancel {
  constructor(public id: number, public url: string) {}

  toString(): string { return `NavigationCancel(id: ${this.id}, url: '${this.url}')`; }
}

/**
 * An event triggered when a navigation fails due to unexpected error
 */
export class NavigationError {
  constructor(public id: number, public url: string, public error: any) {}

  toString(): string {
    return `NavigationError(id: ${this.id}, url: '${this.url}', error: ${this.error})`;
  }
}

/**
 * An event triggered when routes are recognized
 */
export class RoutesRecognized {
  constructor(
      public id: number, public url: string, public urlAfterRedirects: string,
      public state: RouterStateSnapshot) {}

  toString(): string {
    return `RoutesRecognized(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
}

export type Event = NavigationStart | NavigationEnd | NavigationCancel | NavigationError;

/**
 * The `Router` is responsible for mapping URLs to components.
 */
export class Router {
  private currentUrlTree: UrlTree;
  private currentRouterState: RouterState;
  private locationSubscription: Subscription;
  private routerEvents: Subject<Event>;
  private navigationId: number = 0;

  /**
   * @internal
   */
  constructor(
      private rootComponentType: Type, private resolver: ComponentResolver,
      private urlSerializer: UrlSerializer, private outletMap: RouterOutletMap,
      private location: Location, private injector: Injector, private config: RouterConfig) {
    this.routerEvents = new Subject<Event>();
    this.currentUrlTree = createEmptyUrlTree();
    this.currentRouterState = createEmptyState(this.currentUrlTree, this.rootComponentType);
  }

  /**
   * @internal
   */
  initialNavigation(): void {
    this.setUpLocationChangeListener();
    this.navigateByUrl(this.location.path());
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
  resetConfig(config: RouterConfig): void { this.config = config; }

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
  createUrlTree(commands: any[], {relativeTo, queryParams, fragment}: NavigationExtras = {}):
      UrlTree {
    const a = relativeTo ? relativeTo : this.routerState.root;
    return createUrlTree(a, this.currentUrlTree, commands, queryParams, fragment);
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
      let updatedUrl;
      let state;
      applyRedirects(url, this.config)
          .mergeMap(u => {
            updatedUrl = u;
            return recognize(
                this.rootComponentType, this.config, updatedUrl, this.serializeUrl(updatedUrl));
          })

          .mergeMap((newRouterStateSnapshot) => {
            this.routerEvents.next(new RoutesRecognized(
                id, this.serializeUrl(url), this.serializeUrl(updatedUrl), newRouterStateSnapshot));
            return resolve(this.resolver, newRouterStateSnapshot);

          })
          .map((routerStateSnapshot) => {
            return createRouterState(routerStateSnapshot, this.currentRouterState);

          })
          .map((newState: RouterState) => {
            state = newState;

          })
          .mergeMap(_ => {
            return new GuardChecks(state.snapshot, this.currentRouterState.snapshot, this.injector)
                .check(this.outletMap);

          })
          .forEach((shouldActivate) => {
            if (!shouldActivate || id !== this.navigationId) {
              this.routerEvents.next(new NavigationCancel(id, this.serializeUrl(url)));
              return Promise.resolve(false);
            }

            new ActivateRoutes(state, this.currentRouterState).activate(this.outletMap);

            this.currentUrlTree = updatedUrl;
            this.currentRouterState = state;
            if (!preventPushState) {
              let path = this.urlSerializer.serialize(updatedUrl);
              if (this.location.isCurrentPathEqualTo(path)) {
                this.location.replaceState(path);
              } else {
                this.location.go(path);
              }
            }
          })
          .then(
              () => {
                this.routerEvents.next(
                    new NavigationEnd(id, this.serializeUrl(url), this.serializeUrl(updatedUrl)));
                resolvePromise(true);

              },
              e => {
                this.routerEvents.next(new NavigationError(id, this.serializeUrl(url), e));
                rejectPromise(e);
              });
    });
  }
}

class CanActivate {
  constructor(public route: ActivatedRouteSnapshot) {}
}
class CanDeactivate {
  constructor(public component: Object, public route: ActivatedRouteSnapshot) {}
}

class GuardChecks {
  private checks = [];
  constructor(
      private future: RouterStateSnapshot, private curr: RouterStateSnapshot,
      private injector: Injector) {}

  check(parentOutletMap: RouterOutletMap): Observable<boolean> {
    const futureRoot = this.future._root;
    const currRoot = this.curr ? this.curr._root : null;
    this.traverseChildRoutes(futureRoot, currRoot, parentOutletMap);
    if (this.checks.length === 0) return of (true);

    return Observable.from(this.checks)
        .map(s => {
          if (s instanceof CanActivate) {
            return this.runCanActivate(s.route);
          } else if (s instanceof CanDeactivate) {
            return this.runCanDeactivate(s.component, s.route);
          } else {
            throw new Error('Cannot be reached');
          }
        })
        .mergeAll()
        .every(result => result === true);
  }

  private traverseChildRoutes(
      futureNode: TreeNode<ActivatedRouteSnapshot>, currNode: TreeNode<ActivatedRouteSnapshot>,
      outletMap: RouterOutletMap): void {
    const prevChildren: {[key: string]: any} = nodeChildrenAsMap(currNode);
    futureNode.children.forEach(c => {
      this.traverseRoutes(c, prevChildren[c.value.outlet], outletMap);
      delete prevChildren[c.value.outlet];
    });
    forEach(prevChildren, (v, k) => this.deactivateOutletAndItChildren(v, outletMap._outlets[k]));
  }

  traverseRoutes(
      futureNode: TreeNode<ActivatedRouteSnapshot>, currNode: TreeNode<ActivatedRouteSnapshot>,
      parentOutletMap: RouterOutletMap): void {
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
      forEach(outlet.outletMap._outlets, (v, k) => {
        if (v.isActivated) {
          this.deactivateOutletAndItChildren(v.activatedRoute.snapshot, v);
        }
      });
      this.checks.push(new CanDeactivate(outlet.component, route));
    }
  }

  private runCanActivate(future: ActivatedRouteSnapshot): Observable<boolean> {
    const canActivate = future._routeConfig ? future._routeConfig.canActivate : null;
    if (!canActivate || canActivate.length === 0) return of (true);
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
    const canDeactivate = curr._routeConfig ? curr._routeConfig.canDeactivate : null;
    if (!canDeactivate || canDeactivate.length === 0) return of (true);
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
}

function wrapIntoObservable<T>(value: T | Observable<T>): Observable<T> {
  if (value instanceof Observable) {
    return value;
  } else {
    return of (value);
  }
}

class ActivateRoutes {
  constructor(private futureState: RouterState, private currState: RouterState) {}

  activate(parentOutletMap: RouterOutletMap): void {
    const futureRoot = this.futureState._root;
    const currRoot = this.currState ? this.currState._root : null;

    pushQueryParamsAndFragment(this.futureState);
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
    forEach(prevChildren, (v, k) => this.deactivateOutletAndItChildren(outletMap._outlets[k]));
  }

  activateRoutes(
      futureNode: TreeNode<ActivatedRoute>, currNode: TreeNode<ActivatedRoute>,
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

  private activateNewRoutes(
      outletMap: RouterOutletMap, future: ActivatedRoute, outlet: RouterOutlet): void {
    const resolved = ReflectiveInjector.resolve([
      {provide: ActivatedRoute, useValue: future},
      {provide: RouterOutletMap, useValue: outletMap}
    ]);
    advanceActivatedRoute(future);
    outlet.activate(future._futureSnapshot._resolvedComponentFactory, future, resolved, outletMap);
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

function nodeChildrenAsMap(node: TreeNode<any>) {
  return node ? node.children.reduce((m, c) => {
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
