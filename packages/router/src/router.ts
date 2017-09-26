/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location} from '@angular/common';
import {Compiler, Injector, NgModuleFactoryLoader, NgModuleRef, Type, isDevMode} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {of } from 'rxjs/observable/of';
import {concatMap} from 'rxjs/operator/concatMap';
import {map} from 'rxjs/operator/map';
import {mergeMap} from 'rxjs/operator/mergeMap';

import {applyRedirects} from './apply_redirects';
import {LoadedRouterConfig, QueryParamsHandling, Route, Routes, validateConfig} from './config';
import {createRouterState} from './create_router_state';
import {createUrlTree} from './create_url_tree';
import {ActivationEnd, ChildActivationEnd, Event, GuardsCheckEnd, GuardsCheckStart, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, RoutesRecognized} from './events';
import {PreActivation} from './pre_activation';
import {recognize} from './recognize';
import {DefaultRouteReuseStrategy, DetachedRouteHandleInternal, RouteReuseStrategy} from './route_reuse_strategy';
import {RouterConfigLoader} from './router_config_loader';
import {ChildrenOutletContexts} from './router_outlet_context';
import {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot, advanceActivatedRoute, createEmptyState} from './router_state';
import {Params, isNavigationCancelingError} from './shared';
import {DefaultUrlHandlingStrategy, UrlHandlingStrategy} from './url_handling_strategy';
import {UrlSerializer, UrlTree, containsTree, createEmptyUrlTree} from './url_tree';
import {forEach} from './utils/collection';
import {TreeNode, nodeChildrenAsMap} from './utils/tree';

declare let Zone: any;

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
  *   children: [{
  *     path: 'list',
  *     component: ListComponent
  *   },{
  *     path: 'child',
  *     component: ChildComponent
  *   }]
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
  relativeTo?: ActivatedRoute|null;

  /**
  * Sets query parameters to the URL.
  *
  * ```
  * // Navigate to /results?page=1
  * this.router.navigate(['/results'], { queryParams: { page: 1 } });
  * ```
  */
  queryParams?: Params|null;

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
  * deprecated, use `queryParamsHandling` instead
  *
  * ```
  * // Preserve query params from /results?page=1 to /view?page=1
  * this.router.navigate(['/view'], { preserveQueryParams: true });
  * ```
  *
  * @deprecated since v4
  */
  preserveQueryParams?: boolean;

  /**
  *  config strategy to handle the query parameters for the next navigation.
  *
  * ```
  * // from /results?page=1 to /view?page=1&page=2
  * this.router.navigate(['/view'], { queryParams: { page: 2 },  queryParamsHandling: "merge" });
  * ```
  */
  queryParamsHandling?: QueryParamsHandling|null;
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

type NavigationSource = 'imperative' | 'popstate' | 'hashchange';

type NavigationParams = {
  id: number,
  rawUrl: UrlTree,
  extras: NavigationExtras,
  resolve: any,
  reject: any,
  promise: Promise<boolean>,
  source: NavigationSource,
};

/**
 * @internal
 */
export type RouterHook = (snapshot: RouterStateSnapshot) => Observable<void>;

/**
 * @internal
 */
function defaultRouterHook(snapshot: RouterStateSnapshot): Observable<void> {
  return of (null) as any;
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
  private rawUrlTree: UrlTree;
  private navigations = new BehaviorSubject<NavigationParams>(null !);

  private locationSubscription: Subscription;
  private navigationId: number = 0;
  private configLoader: RouterConfigLoader;
  private ngModule: NgModuleRef<any>;

  public readonly events: Observable<Event> = new Subject<Event>();
  public readonly routerState: RouterState;

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
   * Used by RouterModule. This allows us to
   * pause the navigation either before preactivation or after it.
   * @internal
   */
  hooks: {beforePreactivation: RouterHook, afterPreactivation: RouterHook} = {
    beforePreactivation: defaultRouterHook,
    afterPreactivation: defaultRouterHook
  };

  /**
   * Extracts and merges URLs. Used for AngularJS to Angular migrations.
   */
  urlHandlingStrategy: UrlHandlingStrategy = new DefaultUrlHandlingStrategy();

  routeReuseStrategy: RouteReuseStrategy = new DefaultRouteReuseStrategy();

  /**
   * Creates the router service.
   */
  // TODO: vsavkin make internal after the final is out.
  constructor(
      private rootComponentType: Type<any>|null, private urlSerializer: UrlSerializer,
      private rootContexts: ChildrenOutletContexts, private location: Location, injector: Injector,
      loader: NgModuleFactoryLoader, compiler: Compiler, public config: Routes) {
    const onLoadStart = (r: Route) => this.triggerEvent(new RouteConfigLoadStart(r));
    const onLoadEnd = (r: Route) => this.triggerEvent(new RouteConfigLoadEnd(r));

    this.ngModule = injector.get(NgModuleRef);

    this.resetConfig(config);
    this.currentUrlTree = createEmptyUrlTree();
    this.rawUrlTree = this.currentUrlTree;

    this.configLoader = new RouterConfigLoader(loader, compiler, onLoadStart, onLoadEnd);
    this.routerState = createEmptyState(this.currentUrlTree, this.rootComponentType);
    this.processNavigations();
  }

  /**
   * @internal
   * TODO: this should be removed once the constructor of the router made internal
   */
  resetRootComponentType(rootComponentType: Type<any>): void {
    this.rootComponentType = rootComponentType;
    // TODO: vsavkin router 4.0 should make the root component set to null
    // this will simplify the lifecycle of the router.
    this.routerState.root.component = this.rootComponentType;
  }

  /**
   * Sets up the location change listener and performs the initial navigation.
   */
  initialNavigation(): void {
    this.setUpLocationChangeListener();
    if (this.navigationId === 0) {
      this.navigateByUrl(this.location.path(true), {replaceUrl: true});
    }
  }

  /**
   * Sets up the location change listener.
   */
  setUpLocationChangeListener(): void {
    // Zone.current.wrap is needed because of the issue with RxJS scheduler,
    // which does not work properly with zone.js in IE and Safari
    if (!this.locationSubscription) {
      this.locationSubscription = <any>this.location.subscribe(Zone.current.wrap((change: any) => {
        const rawUrlTree = this.urlSerializer.parse(change['url']);
        const source: NavigationSource = change['type'] === 'popstate' ? 'popstate' : 'hashchange';
        setTimeout(() => { this.scheduleNavigation(rawUrlTree, source, {replaceUrl: true}); }, 0);
      }));
    }
  }

  /** The current url */
  get url(): string { return this.serializeUrl(this.currentUrlTree); }

  /** @internal */
  triggerEvent(e: Event): void { (this.events as Subject<Event>).next(e); }

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
   *  ]}
   * ]);
   * ```
   */
  resetConfig(config: Routes): void {
    validateConfig(config);
    this.config = config;
    this.navigated = false;
  }

  /** @docsNotRequired */
  ngOnDestroy(): void { this.dispose(); }

  /** Disposes of the router */
  dispose(): void {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
      this.locationSubscription = null !;
    }
  }

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
  createUrlTree(commands: any[], navigationExtras: NavigationExtras = {}): UrlTree {
    const {relativeTo,          queryParams,         fragment,
           preserveQueryParams, queryParamsHandling, preserveFragment} = navigationExtras;
    if (isDevMode() && preserveQueryParams && <any>console && <any>console.warn) {
      console.warn('preserveQueryParams is deprecated, use queryParamsHandling instead.');
    }
    const a = relativeTo || this.routerState.root;
    const f = preserveFragment ? this.currentUrlTree.fragment : fragment;
    let q: Params|null = null;
    if (queryParamsHandling) {
      switch (queryParamsHandling) {
        case 'merge':
          q = {...this.currentUrlTree.queryParams, ...queryParams};
          break;
        case 'preserve':
          q = this.currentUrlTree.queryParams;
          break;
        default:
          q = queryParams || null;
      }
    } else {
      q = preserveQueryParams ? this.currentUrlTree.queryParams : queryParams || null;
    }
    return createUrlTree(a, this.currentUrlTree, commands, q !, f !);
  }

  /**
   * Navigate based on the provided url. This navigation is always absolute.
   *
   * Returns a promise that:
   * - resolves to 'true' when navigation succeeds,
   * - resolves to 'false' when navigation fails,
   * - is rejected when an error happens.
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
    const urlTree = url instanceof UrlTree ? url : this.parseUrl(url);
    const mergedTree = this.urlHandlingStrategy.merge(urlTree, this.rawUrlTree);

    return this.scheduleNavigation(mergedTree, 'imperative', extras);
  }

  /**
   * Navigate based on the provided array of commands and a starting point.
   * If no starting route is provided, the navigation is absolute.
   *
   * Returns a promise that:
   * - resolves to 'true' when navigation succeeds,
   * - resolves to 'false' when navigation fails,
   * - is rejected when an error happens.
   *
   * ### Usage
   *
   * ```
   * router.navigate(['team', 33, 'user', 11], {relativeTo: route});
   *
   * // Navigate without updating the URL
   * router.navigate(['team', 33, 'user', 11], {relativeTo: route, skipLocationChange: true});
   * ```
   *
   * In opposite to `navigateByUrl`, `navigate` always takes a delta that is applied to the current
   * URL.
   */
  navigate(commands: any[], extras: NavigationExtras = {skipLocationChange: false}):
      Promise<boolean> {
    validateCommands(commands);
    if (typeof extras.queryParams === 'object' && extras.queryParams !== null) {
      extras.queryParams = this.removeEmptyProps(extras.queryParams);
    }
    return this.navigateByUrl(this.createUrlTree(commands, extras), extras);
  }

  /** Serializes a {@link UrlTree} into a string */
  serializeUrl(url: UrlTree): string { return this.urlSerializer.serialize(url); }

  /** Parses a string into a {@link UrlTree} */
  parseUrl(url: string): UrlTree { return this.urlSerializer.parse(url); }

  /** Returns whether the url is activated */
  isActive(url: string|UrlTree, exact: boolean): boolean {
    if (url instanceof UrlTree) {
      return containsTree(this.currentUrlTree, url, exact);
    }

    const urlTree = this.urlSerializer.parse(url);
    return containsTree(this.currentUrlTree, urlTree, exact);
  }

  private removeEmptyProps(params: Params): Params {
    return Object.keys(params).reduce((result: Params, key: string) => {
      const value: any = params[key];
      if (value !== null && value !== undefined) {
        result[key] = value;
      }
      return result;
    }, {});
  }

  private processNavigations(): void {
    concatMap
        .call(
            this.navigations,
            (nav: NavigationParams) => {
              if (nav) {
                this.executeScheduledNavigation(nav);
                // a failed navigation should not stop the router from processing
                // further navigations => the catch
                return nav.promise.catch(() => {});
              } else {
                return <any>of (null);
              }
            })
        .subscribe(() => {});
  }

  private scheduleNavigation(rawUrl: UrlTree, source: NavigationSource, extras: NavigationExtras):
      Promise<boolean> {
    const lastNavigation = this.navigations.value;

    // If the user triggers a navigation imperatively (e.g., by using navigateByUrl),
    // and that navigation results in 'replaceState' that leads to the same URL,
    // we should skip those.
    if (lastNavigation && source !== 'imperative' && lastNavigation.source === 'imperative' &&
        lastNavigation.rawUrl.toString() === rawUrl.toString()) {
      return Promise.resolve(true);  // return value is not used
    }

    // Because of a bug in IE and Edge, the location class fires two events (popstate and
    // hashchange) every single time. The second one should be ignored. Otherwise, the URL will
    // flicker.
    if (lastNavigation && source == 'hashchange' && lastNavigation.source === 'popstate' &&
        lastNavigation.rawUrl.toString() === rawUrl.toString()) {
      return Promise.resolve(true);  // return value is not used
    }

    let resolve: any = null;
    let reject: any = null;

    const promise = new Promise<boolean>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const id = ++this.navigationId;
    this.navigations.next({id, source, rawUrl, extras, resolve, reject, promise});

    // Make sure that the error is propagated even though `processNavigations` catch
    // handler does not rethrow
    return promise.catch((e: any) => Promise.reject(e));
  }

  private executeScheduledNavigation({id, rawUrl, extras, resolve, reject}: NavigationParams):
      void {
    const url = this.urlHandlingStrategy.extract(rawUrl);
    const urlTransition = !this.navigated || url.toString() !== this.currentUrlTree.toString();

    if (urlTransition && this.urlHandlingStrategy.shouldProcessUrl(rawUrl)) {
      (this.events as Subject<Event>).next(new NavigationStart(id, this.serializeUrl(url)));
      Promise.resolve()
          .then(
              (_) => this.runNavigate(
                  url, rawUrl, !!extras.skipLocationChange, !!extras.replaceUrl, id, null))
          .then(resolve, reject);

      // we cannot process the current URL, but we could process the previous one =>
      // we need to do some cleanup
    } else if (
        urlTransition && this.rawUrlTree &&
        this.urlHandlingStrategy.shouldProcessUrl(this.rawUrlTree)) {
      (this.events as Subject<Event>).next(new NavigationStart(id, this.serializeUrl(url)));
      Promise.resolve()
          .then(
              (_) => this.runNavigate(
                  url, rawUrl, false, false, id,
                  createEmptyState(url, this.rootComponentType).snapshot))
          .then(resolve, reject);

    } else {
      this.rawUrlTree = rawUrl;
      resolve(null);
    }
  }

  private runNavigate(
      url: UrlTree, rawUrl: UrlTree, shouldPreventPushState: boolean, shouldReplaceUrl: boolean,
      id: number, precreatedState: RouterStateSnapshot|null): Promise<boolean> {
    if (id !== this.navigationId) {
      this.location.go(this.urlSerializer.serialize(this.currentUrlTree));
      (this.events as Subject<Event>)
          .next(new NavigationCancel(
              id, this.serializeUrl(url),
              `Navigation ID ${id} is not equal to the current navigation id ${this.navigationId}`));
      return Promise.resolve(false);
    }

    return new Promise((resolvePromise, rejectPromise) => {
      // create an observable of the url and route state snapshot
      // this operation do not result in any side effects
      let urlAndSnapshot$: Observable<{appliedUrl: UrlTree, snapshot: RouterStateSnapshot}>;
      if (!precreatedState) {
        const moduleInjector = this.ngModule.injector;
        const redirectsApplied$ =
            applyRedirects(moduleInjector, this.configLoader, this.urlSerializer, url, this.config);

        urlAndSnapshot$ = mergeMap.call(redirectsApplied$, (appliedUrl: UrlTree) => {
          return map.call(
              recognize(
                  this.rootComponentType, this.config, appliedUrl, this.serializeUrl(appliedUrl)),
              (snapshot: any) => {

                (this.events as Subject<Event>)
                    .next(new RoutesRecognized(
                        id, this.serializeUrl(url), this.serializeUrl(appliedUrl), snapshot));

                return {appliedUrl, snapshot};
              });
        });
      } else {
        urlAndSnapshot$ = of ({appliedUrl: url, snapshot: precreatedState});
      }

      const beforePreactivationDone$ = mergeMap.call(
          urlAndSnapshot$, (p: {appliedUrl: string, snapshot: RouterStateSnapshot}) => {
            return map.call(this.hooks.beforePreactivation(p.snapshot), () => p);
          });

      // run preactivation: guards and data resolvers
      let preActivation: PreActivation;

      const preactivationSetup$ = map.call(
          beforePreactivationDone$,
          ({appliedUrl, snapshot}: {appliedUrl: string, snapshot: RouterStateSnapshot}) => {
            const moduleInjector = this.ngModule.injector;
            preActivation = new PreActivation(
                snapshot, this.routerState.snapshot, moduleInjector,
                (evt: Event) => this.triggerEvent(evt));
            preActivation.initialize(this.rootContexts);
            return {appliedUrl, snapshot};
          });

      const preactivationCheckGuards$ = mergeMap.call(
          preactivationSetup$,
          ({appliedUrl, snapshot}: {appliedUrl: string, snapshot: RouterStateSnapshot}) => {
            if (this.navigationId !== id) return of (false);

            this.triggerEvent(
                new GuardsCheckStart(id, this.serializeUrl(url), appliedUrl, snapshot));

            return map.call(preActivation.checkGuards(), (shouldActivate: boolean) => {
              this.triggerEvent(new GuardsCheckEnd(
                  id, this.serializeUrl(url), appliedUrl, snapshot, shouldActivate));
              return {appliedUrl: appliedUrl, snapshot: snapshot, shouldActivate: shouldActivate};
            });
          });

      const preactivationResolveData$ = mergeMap.call(
          preactivationCheckGuards$,
          (p: {appliedUrl: string, snapshot: RouterStateSnapshot, shouldActivate: boolean}) => {
            if (this.navigationId !== id) return of (false);

            if (p.shouldActivate && preActivation.isActivating()) {
              this.triggerEvent(
                  new ResolveStart(id, this.serializeUrl(url), p.appliedUrl, p.snapshot));
              return map.call(preActivation.resolveData(), () => {
                this.triggerEvent(
                    new ResolveEnd(id, this.serializeUrl(url), p.appliedUrl, p.snapshot));
                return p;
              });
            } else {
              return of (p);
            }
          });

      const preactivationDone$ = mergeMap.call(preactivationResolveData$, (p: any) => {
        return map.call(this.hooks.afterPreactivation(p.snapshot), () => p);
      });


      // create router state
      // this operation has side effects => route state is being affected
      const routerState$ =
          map.call(preactivationDone$, ({appliedUrl, snapshot, shouldActivate}: any) => {
            if (shouldActivate) {
              const state = createRouterState(this.routeReuseStrategy, snapshot, this.routerState);
              return {appliedUrl, state, shouldActivate};
            } else {
              return {appliedUrl, state: null, shouldActivate};
            }
          });


      // applied the new router state
      // this operation has side effects
      let navigationIsSuccessful: boolean;
      const storedState = this.routerState;
      const storedUrl = this.currentUrlTree;

      routerState$
          .forEach(({appliedUrl, state, shouldActivate}: any) => {
            if (!shouldActivate || id !== this.navigationId) {
              navigationIsSuccessful = false;
              return;
            }

            this.currentUrlTree = appliedUrl;
            this.rawUrlTree = this.urlHandlingStrategy.merge(this.currentUrlTree, rawUrl);

            (this as{routerState: RouterState}).routerState = state;

            if (!shouldPreventPushState) {
              const path = this.urlSerializer.serialize(this.rawUrlTree);
              if (this.location.isCurrentPathEqualTo(path) || shouldReplaceUrl) {
                this.location.replaceState(path);
              } else {
                this.location.go(path);
              }
            }

            new ActivateRoutes(
                this.routeReuseStrategy, state, storedState, (evt: Event) => this.triggerEvent(evt))
                .activate(this.rootContexts);

            navigationIsSuccessful = true;
          })
          .then(
              () => {
                if (navigationIsSuccessful) {
                  this.navigated = true;
                  (this.events as Subject<Event>)
                      .next(new NavigationEnd(
                          id, this.serializeUrl(url), this.serializeUrl(this.currentUrlTree)));
                  resolvePromise(true);
                } else {
                  this.resetUrlToCurrentUrlTree();
                  (this.events as Subject<Event>)
                      .next(new NavigationCancel(id, this.serializeUrl(url), ''));
                  resolvePromise(false);
                }
              },
              (e: any) => {
                if (isNavigationCancelingError(e)) {
                  this.resetUrlToCurrentUrlTree();
                  this.navigated = true;
                  (this.events as Subject<Event>)
                      .next(new NavigationCancel(id, this.serializeUrl(url), e.message));
                  resolvePromise(false);
                } else {
                  (this.events as Subject<Event>)
                      .next(new NavigationError(id, this.serializeUrl(url), e));
                  try {
                    resolvePromise(this.errorHandler(e));
                  } catch (ee) {
                    rejectPromise(ee);
                  }
                }

                (this as{routerState: RouterState}).routerState = storedState;
                this.currentUrlTree = storedUrl;
                this.rawUrlTree = this.urlHandlingStrategy.merge(this.currentUrlTree, rawUrl);
                this.location.replaceState(this.serializeUrl(this.rawUrlTree));
              });
    });
  }

  private resetUrlToCurrentUrlTree(): void {
    const path = this.urlSerializer.serialize(this.rawUrlTree);
    this.location.replaceState(path);
  }
}

class ActivateRoutes {
  constructor(
      private routeReuseStrategy: RouteReuseStrategy, private futureState: RouterState,
      private currState: RouterState, private forwardEvent: (evt: Event) => void) {}

  activate(parentContexts: ChildrenOutletContexts): void {
    const futureRoot = this.futureState._root;
    const currRoot = this.currState ? this.currState._root : null;

    this.deactivateChildRoutes(futureRoot, currRoot, parentContexts);
    advanceActivatedRoute(this.futureState.root);
    this.activateChildRoutes(futureRoot, currRoot, parentContexts);
  }

  // De-activate the child route that are not re-used for the future state
  private deactivateChildRoutes(
      futureNode: TreeNode<ActivatedRoute>, currNode: TreeNode<ActivatedRoute>|null,
      contexts: ChildrenOutletContexts): void {
    const children: {[outletName: string]: TreeNode<ActivatedRoute>} = nodeChildrenAsMap(currNode);

    // Recurse on the routes active in the future state to de-activate deeper children
    futureNode.children.forEach(futureChild => {
      const childOutletName = futureChild.value.outlet;
      this.deactivateRoutes(futureChild, children[childOutletName], contexts);
      delete children[childOutletName];
    });

    // De-activate the routes that will not be re-used
    forEach(children, (v: TreeNode<ActivatedRoute>, childName: string) => {
      this.deactivateRouteAndItsChildren(v, contexts);
    });
  }

  private deactivateRoutes(
      futureNode: TreeNode<ActivatedRoute>, currNode: TreeNode<ActivatedRoute>,
      parentContext: ChildrenOutletContexts): void {
    const future = futureNode.value;
    const curr = currNode ? currNode.value : null;

    if (future === curr) {
      // Reusing the node, check to see if the children need to be de-activated
      if (future.component) {
        // If we have a normal route, we need to go through an outlet.
        const context = parentContext.getContext(future.outlet);
        if (context) {
          this.deactivateChildRoutes(futureNode, currNode, context.children);
        }
      } else {
        // if we have a componentless route, we recurse but keep the same outlet map.
        this.deactivateChildRoutes(futureNode, currNode, parentContext);
      }
    } else {
      if (curr) {
        // Deactivate the current route which will not be re-used
        this.deactivateRouteAndItsChildren(currNode, parentContext);
      }
    }
  }

  private deactivateRouteAndItsChildren(
      route: TreeNode<ActivatedRoute>, parentContexts: ChildrenOutletContexts): void {
    if (this.routeReuseStrategy.shouldDetach(route.value.snapshot)) {
      this.detachAndStoreRouteSubtree(route, parentContexts);
    } else {
      this.deactivateRouteAndOutlet(route, parentContexts);
    }
  }

  private detachAndStoreRouteSubtree(
      route: TreeNode<ActivatedRoute>, parentContexts: ChildrenOutletContexts): void {
    const context = parentContexts.getContext(route.value.outlet);
    if (context && context.outlet) {
      const componentRef = context.outlet.detach();
      const contexts = context.children.onOutletDeactivated();
      this.routeReuseStrategy.store(route.value.snapshot, {componentRef, route, contexts});
    }
  }

  private deactivateRouteAndOutlet(
      route: TreeNode<ActivatedRoute>, parentContexts: ChildrenOutletContexts): void {
    const context = parentContexts.getContext(route.value.outlet);

    if (context) {
      const children: {[outletName: string]: any} = nodeChildrenAsMap(route);
      const contexts = route.value.component ? context.children : parentContexts;

      forEach(children, (v: any, k: string) => this.deactivateRouteAndItsChildren(v, contexts));

      if (context.outlet) {
        // Destroy the component
        context.outlet.deactivate();
        // Destroy the contexts for all the outlets that were in the component
        context.children.onOutletDeactivated();
      }
    }
  }

  private activateChildRoutes(
      futureNode: TreeNode<ActivatedRoute>, currNode: TreeNode<ActivatedRoute>|null,
      contexts: ChildrenOutletContexts): void {
    const children: {[outlet: string]: any} = nodeChildrenAsMap(currNode);
    futureNode.children.forEach(c => {
      this.activateRoutes(c, children[c.value.outlet], contexts);
      this.forwardEvent(new ActivationEnd(c.value.snapshot));
    });
    if (futureNode.children.length) {
      this.forwardEvent(new ChildActivationEnd(futureNode.value.snapshot));
    }
  }

  private activateRoutes(
      futureNode: TreeNode<ActivatedRoute>, currNode: TreeNode<ActivatedRoute>,
      parentContexts: ChildrenOutletContexts): void {
    const future = futureNode.value;
    const curr = currNode ? currNode.value : null;

    advanceActivatedRoute(future);

    // reusing the node
    if (future === curr) {
      if (future.component) {
        // If we have a normal route, we need to go through an outlet.
        const context = parentContexts.getOrCreateContext(future.outlet);
        this.activateChildRoutes(futureNode, currNode, context.children);
      } else {
        // if we have a componentless route, we recurse but keep the same outlet map.
        this.activateChildRoutes(futureNode, currNode, parentContexts);
      }
    } else {
      if (future.component) {
        // if we have a normal route, we need to place the component into the outlet and recurse.
        const context = parentContexts.getOrCreateContext(future.outlet);

        if (this.routeReuseStrategy.shouldAttach(future.snapshot)) {
          const stored =
              (<DetachedRouteHandleInternal>this.routeReuseStrategy.retrieve(future.snapshot));
          this.routeReuseStrategy.store(future.snapshot, null);
          context.children.onOutletReAttached(stored.contexts);
          context.attachRef = stored.componentRef;
          context.route = stored.route.value;
          if (context.outlet) {
            // Attach right away when the outlet has already been instantiated
            // Otherwise attach from `RouterOutlet.ngOnInit` when it is instantiated
            context.outlet.attach(stored.componentRef, stored.route.value);
          }
          advanceActivatedRouteNodeAndItsChildren(stored.route);
        } else {
          const config = parentLoadedConfig(future.snapshot);
          const cmpFactoryResolver = config ? config.module.componentFactoryResolver : null;

          context.route = future;
          context.resolver = cmpFactoryResolver;
          if (context.outlet) {
            // Activate the outlet when it has already been instantiated
            // Otherwise it will get activated from its `ngOnInit` when instantiated
            context.outlet.activateWith(future, cmpFactoryResolver);
          }

          this.activateChildRoutes(futureNode, null, context.children);
        }
      } else {
        // if we have a componentless route, we recurse but keep the same outlet map.
        this.activateChildRoutes(futureNode, null, parentContexts);
      }
    }
  }
}

function advanceActivatedRouteNodeAndItsChildren(node: TreeNode<ActivatedRoute>): void {
  advanceActivatedRoute(node.value);
  node.children.forEach(advanceActivatedRouteNodeAndItsChildren);
}

function parentLoadedConfig(snapshot: ActivatedRouteSnapshot): LoadedRouterConfig|null {
  for (let s = snapshot.parent; s; s = s.parent) {
    const route = s.routeConfig;
    if (route && route._loadedConfig) return route._loadedConfig;
    if (route && route.component) return null;
  }

  return null;
}

function validateCommands(commands: string[]): void {
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    if (cmd == null) {
      throw new Error(`The requested path contains ${cmd} segment at index ${i}`);
    }
  }
}
