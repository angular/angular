/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location} from '@angular/common';
import {Compiler, Injector, NgModuleFactoryLoader, NgModuleRef, NgZone, Optional, Type, isDevMode, ɵConsole as Console} from '@angular/core';
import {BehaviorSubject, Observable, Subject, Subscription, of } from 'rxjs';
import {concatMap, map, mergeMap, tap} from 'rxjs/operators';

import {applyRedirects} from './apply_redirects';
import {LoadedRouterConfig, QueryParamsHandling, Route, Routes, standardizeConfig, validateConfig} from './config';
import {createRouterState} from './create_router_state';
import {createUrlTree} from './create_url_tree';
import {ActivationEnd, ChildActivationEnd, Event, GuardsCheckEnd, GuardsCheckStart, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, NavigationTrigger, ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, RoutesRecognized} from './events';
import {recognize} from './operators/recognize';
import {PreActivation} from './pre_activation';
import {DefaultRouteReuseStrategy, DetachedRouteHandleInternal, RouteReuseStrategy} from './route_reuse_strategy';
import {RouterConfigLoader} from './router_config_loader';
import {ChildrenOutletContexts} from './router_outlet_context';
import {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot, advanceActivatedRoute, createEmptyState, inheritedParamsDataResolve} from './router_state';
import {Params, isNavigationCancelingError} from './shared';
import {DefaultUrlHandlingStrategy, UrlHandlingStrategy} from './url_handling_strategy';
import {UrlSerializer, UrlTree, containsTree, createEmptyUrlTree} from './url_tree';
import {forEach} from './utils/collection';
import {TreeNode, nodeChildrenAsMap} from './utils/tree';


/**
 * @description
 *
 * Represents the extra options used during navigation.
 *
 *
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
 * @description
 *
 * Error handler that is invoked when a navigation errors.
 *
 * If the handler returns a value, the navigation promise will be resolved with this value.
 * If the handler throws an exception, the navigation promise will be rejected with
 * the exception.
 *
 *
 */
export type ErrorHandler = (error: any) => any;

function defaultErrorHandler(error: any): any {
  throw error;
}

function defaultMalformedUriErrorHandler(
    error: URIError, urlSerializer: UrlSerializer, url: string): UrlTree {
  return urlSerializer.parse('/');
}

type NavStreamValue =
    boolean | {appliedUrl: UrlTree, snapshot: RouterStateSnapshot, shouldActivate?: boolean};

type NavigationParams = {
  id: number,
  rawUrl: UrlTree,
  extras: NavigationExtras,
  resolve: any,
  reject: any,
  promise: Promise<boolean>,
  source: NavigationTrigger,
  state: {navigationId: number} | null
};

/**
 * @internal
 */
export type RouterHook = (snapshot: RouterStateSnapshot, runExtras: {
  appliedUrlTree: UrlTree,
  rawUrlTree: UrlTree,
  skipLocationChange: boolean,
  replaceUrl: boolean,
  navigationId: number
}) => Observable<void>;

/**
 * @internal
 */
function defaultRouterHook(snapshot: RouterStateSnapshot, runExtras: {
  appliedUrlTree: UrlTree,
  rawUrlTree: UrlTree,
  skipLocationChange: boolean,
  replaceUrl: boolean,
  navigationId: number
}): Observable<void> {
  return of (null) as any;
}

/**
 * @description
 *
 * Provides the navigation and url manipulation capabilities.
 *
 * See `Routes` for more details and examples.
 *
 * @ngModule RouterModule
 *
 *
 */
export class Router {
  private currentUrlTree: UrlTree;
  private rawUrlTree: UrlTree;
  private navigations = new BehaviorSubject<NavigationParams>(null !);

  // TODO(issue/24571): remove '!'.
  private locationSubscription !: Subscription;
  private navigationId: number = 0;
  private configLoader: RouterConfigLoader;
  private ngModule: NgModuleRef<any>;
  private console: Console;
  private isNgZoneEnabled: boolean = false;

  public readonly events: Observable<Event> = new Subject<Event>();
  public readonly routerState: RouterState;

  /**
   * Error handler that is invoked when a navigation errors.
   *
   * See `ErrorHandler` for more information.
   */
  errorHandler: ErrorHandler = defaultErrorHandler;

  /**
   * Malformed uri error handler is invoked when `Router.parseUrl(url)` throws an
   * error due to containing an invalid character. The most common case would be a `%` sign
   * that's not encoded and is not part of a percent encoded sequence.
   */
  malformedUriErrorHandler:
      (error: URIError, urlSerializer: UrlSerializer,
       url: string) => UrlTree = defaultMalformedUriErrorHandler;

  /**
   * Indicates if at least one navigation happened.
   */
  navigated: boolean = false;
  private lastSuccessfulId: number = -1;

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
   * Define what the router should do if it receives a navigation request to the current URL.
   * By default, the router will ignore this navigation. However, this prevents features such
   * as a "refresh" button. Use this option to configure the behavior when navigating to the
   * current URL. Default is 'ignore'.
   */
  onSameUrlNavigation: 'reload'|'ignore' = 'ignore';

  /**
   * Defines how the router merges params, data and resolved data from parent to child
   * routes. Available options are:
   *
   * - `'emptyOnly'`, the default, only inherits parent params for path-less or component-less
   *   routes.
   * - `'always'`, enables unconditional inheritance of parent params.
   */
  paramsInheritanceStrategy: 'emptyOnly'|'always' = 'emptyOnly';

  /**
   * Defines when the router updates the browser URL. The default behavior is to update after
   * successful navigation. However, some applications may prefer a mode where the URL gets
   * updated at the beginning of navigation. The most common use case would be updating the
   * URL early so if navigation fails, you can show an error message with the URL that failed.
   * Available options are:
   *
   * - `'deferred'`, the default, updates the browser URL after navigation has finished.
   * - `'eager'`, updates browser URL at the beginning of navigation.
   */
  urlUpdateStrategy: 'deferred'|'eager' = 'deferred';

  /**
   * See {@link RouterModule} for more information.
   */
  relativeLinkResolution: 'legacy'|'corrected' = 'legacy';

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
    this.console = injector.get(Console);
    const ngZone = injector.get(NgZone);
    this.isNgZoneEnabled = ngZone instanceof NgZone;

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
    // Don't need to use Zone.wrap any more, because zone.js
    // already patch onPopState, so location change callback will
    // run into ngZone
    if (!this.locationSubscription) {
      this.locationSubscription = <any>this.location.subscribe((change: any) => {
        let rawUrlTree = this.parseUrl(change['url']);
        const source: NavigationTrigger = change['type'] === 'popstate' ? 'popstate' : 'hashchange';
        const state = change.state && change.state.navigationId ?
            {navigationId: change.state.navigationId} :
            null;
        setTimeout(
            () => { this.scheduleNavigation(rawUrlTree, source, state, {replaceUrl: true}); }, 0);
      });
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
    this.config = config.map(standardizeConfig);
    this.navigated = false;
    this.lastSuccessfulId = -1;
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
    if (q !== null) {
      q = this.removeEmptyProps(q);
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
   * Since `navigateByUrl()` takes an absolute URL as the first parameter,
   * it will not apply any delta to the current URL and ignores any properties
   * in the second parameter (the `NavigationExtras`) that would change the
   * provided URL.
   */
  navigateByUrl(url: string|UrlTree, extras: NavigationExtras = {skipLocationChange: false}):
      Promise<boolean> {
    if (isDevMode() && this.isNgZoneEnabled && !NgZone.isInAngularZone()) {
      this.console.warn(
          `Navigation triggered outside Angular zone, did you forget to call 'ngZone.run()'?`);
    }

    const urlTree = url instanceof UrlTree ? url : this.parseUrl(url);
    const mergedTree = this.urlHandlingStrategy.merge(urlTree, this.rawUrlTree);

    return this.scheduleNavigation(mergedTree, 'imperative', null, extras);
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
   * The first parameter of `navigate()` is a delta to be applied to the current URL
   * or the one provided in the `relativeTo` property of the second parameter (the
   * `NavigationExtras`).
   */
  navigate(commands: any[], extras: NavigationExtras = {skipLocationChange: false}):
      Promise<boolean> {
    validateCommands(commands);
    return this.navigateByUrl(this.createUrlTree(commands, extras), extras);
  }

  /** Serializes a `UrlTree` into a string */
  serializeUrl(url: UrlTree): string { return this.urlSerializer.serialize(url); }

  /** Parses a string into a `UrlTree` */
  parseUrl(url: string): UrlTree {
    let urlTree: UrlTree;
    try {
      urlTree = this.urlSerializer.parse(url);
    } catch (e) {
      urlTree = this.malformedUriErrorHandler(e, this.urlSerializer, url);
    }
    return urlTree;
  }

  /** Returns whether the url is activated */
  isActive(url: string|UrlTree, exact: boolean): boolean {
    if (url instanceof UrlTree) {
      return containsTree(this.currentUrlTree, url, exact);
    }

    const urlTree = this.parseUrl(url);
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
    this.navigations
        .pipe(concatMap((nav: NavigationParams) => {
          if (nav) {
            this.executeScheduledNavigation(nav);
            // a failed navigation should not stop the router from processing
            // further navigations => the catch
            return nav.promise.catch(() => {});
          } else {
            return <any>of (null);
          }
        }))
        .subscribe(() => {});
  }

  private scheduleNavigation(
      rawUrl: UrlTree, source: NavigationTrigger, state: {navigationId: number}|null,
      extras: NavigationExtras): Promise<boolean> {
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
    // flicker. Handles the case when a popstate was emitted first.
    if (lastNavigation && source == 'hashchange' && lastNavigation.source === 'popstate' &&
        lastNavigation.rawUrl.toString() === rawUrl.toString()) {
      return Promise.resolve(true);  // return value is not used
    }
    // Because of a bug in IE and Edge, the location class fires two events (popstate and
    // hashchange) every single time. The second one should be ignored. Otherwise, the URL will
    // flicker. Handles the case when a hashchange was emitted first.
    if (lastNavigation && source == 'popstate' && lastNavigation.source === 'hashchange' &&
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
    this.navigations.next({id, source, state, rawUrl, extras, resolve, reject, promise});

    // Make sure that the error is propagated even though `processNavigations` catch
    // handler does not rethrow
    return promise.catch((e: any) => Promise.reject(e));
  }

  private executeScheduledNavigation({id, rawUrl, extras, resolve, reject, source,
                                      state}: NavigationParams): void {
    const url = this.urlHandlingStrategy.extract(rawUrl);
    const urlTransition = !this.navigated || url.toString() !== this.currentUrlTree.toString();

    if ((this.onSameUrlNavigation === 'reload' ? true : urlTransition) &&
        this.urlHandlingStrategy.shouldProcessUrl(rawUrl)) {
      if (this.urlUpdateStrategy === 'eager' && !extras.skipLocationChange) {
        this.setBrowserUrl(rawUrl, !!extras.replaceUrl, id);
      }
      (this.events as Subject<Event>)
          .next(new NavigationStart(id, this.serializeUrl(url), source, state));
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
      (this.events as Subject<Event>)
          .next(new NavigationStart(id, this.serializeUrl(url), source, state));
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
      url: UrlTree, rawUrl: UrlTree, skipLocationChange: boolean, replaceUrl: boolean, id: number,
      precreatedState: RouterStateSnapshot|null): Promise<boolean> {
    if (id !== this.navigationId) {
      (this.events as Subject<Event>)
          .next(new NavigationCancel(
              id, this.serializeUrl(url),
              `Navigation ID ${id} is not equal to the current navigation id ${this.navigationId}`));
      return Promise.resolve(false);
    }

    return new Promise((resolvePromise, rejectPromise) => {
      // create an observable of the url and route state snapshot
      // this operation do not result in any side effects
      let urlAndSnapshot$: Observable<NavStreamValue>;
      if (!precreatedState) {
        const moduleInjector = this.ngModule.injector;
        const redirectsApplied$ =
            applyRedirects(moduleInjector, this.configLoader, this.urlSerializer, url, this.config);

        urlAndSnapshot$ = redirectsApplied$.pipe(mergeMap(
            (appliedUrl: UrlTree) =>
                recognize(
                    this.rootComponentType, this.config, (url) => this.serializeUrl(url),
                    this.paramsInheritanceStrategy)(of (appliedUrl))
                    .pipe(
                        map((snapshot: RouterStateSnapshot) => ({appliedUrl, snapshot})),
                        tap(({appliedUrl,
                              snapshot}: {appliedUrl: UrlTree, snapshot: RouterStateSnapshot}) =>
                                (this.events as Subject<Event>)
                                    .next(new RoutesRecognized(
                                        id, this.serializeUrl(url), this.serializeUrl(appliedUrl),
                                        snapshot))))));

      } else {
        urlAndSnapshot$ = of ({appliedUrl: url, snapshot: precreatedState});
      }

      const beforePreactivationDone$ =
          urlAndSnapshot$.pipe(mergeMap((p): Observable<NavStreamValue> => {
            if (typeof p === 'boolean') return of (p);
            return this.hooks
                .beforePreactivation(p.snapshot, {
                  navigationId: id,
                  appliedUrlTree: url,
                  rawUrlTree: rawUrl, skipLocationChange, replaceUrl,
                })
                .pipe(map(() => p));
          }));

      // run preactivation: guards and data resolvers
      let preActivation: PreActivation;

      const preactivationSetup$ = beforePreactivationDone$.pipe(map((p): NavStreamValue => {
        if (typeof p === 'boolean') return p;
        const {appliedUrl, snapshot} = p;
        const moduleInjector = this.ngModule.injector;
        preActivation = new PreActivation(
            snapshot, this.routerState.snapshot, moduleInjector,
            (evt: Event) => this.triggerEvent(evt));
        preActivation.initialize(this.rootContexts);
        return {appliedUrl, snapshot};
      }));

      const preactivationCheckGuards$ =
          preactivationSetup$.pipe(mergeMap((p): Observable<NavStreamValue> => {
            if (typeof p === 'boolean' || this.navigationId !== id) return of (false);
            const {appliedUrl, snapshot} = p;

            this.triggerEvent(new GuardsCheckStart(
                id, this.serializeUrl(url), this.serializeUrl(appliedUrl), snapshot));

            return preActivation.checkGuards().pipe(map((shouldActivate: boolean) => {
              this.triggerEvent(new GuardsCheckEnd(
                  id, this.serializeUrl(url), this.serializeUrl(appliedUrl), snapshot,
                  shouldActivate));
              return {appliedUrl: appliedUrl, snapshot: snapshot, shouldActivate: shouldActivate};
            }));
          }));

      const preactivationResolveData$ =
          preactivationCheckGuards$.pipe(mergeMap((p): Observable<NavStreamValue> => {
            if (typeof p === 'boolean' || this.navigationId !== id) return of (false);

            if (p.shouldActivate && preActivation.isActivating()) {
              this.triggerEvent(new ResolveStart(
                  id, this.serializeUrl(url), this.serializeUrl(p.appliedUrl), p.snapshot));
              return preActivation.resolveData(this.paramsInheritanceStrategy).pipe(map(() => {
                this.triggerEvent(new ResolveEnd(
                    id, this.serializeUrl(url), this.serializeUrl(p.appliedUrl), p.snapshot));
                return p;
              }));
            } else {
              return of (p);
            }
          }));

      const preactivationDone$ =
          preactivationResolveData$.pipe(mergeMap((p): Observable<NavStreamValue> => {
            if (typeof p === 'boolean' || this.navigationId !== id) return of (false);
            return this.hooks
                .afterPreactivation(p.snapshot, {
                  navigationId: id,
                  appliedUrlTree: url,
                  rawUrlTree: rawUrl, skipLocationChange, replaceUrl,
                })
                .pipe(map(() => p));
          }));


      // create router state
      // this operation has side effects => route state is being affected
      const routerState$ = preactivationDone$.pipe(map((p) => {
        if (typeof p === 'boolean' || this.navigationId !== id) return false;
        const {appliedUrl, snapshot, shouldActivate} = p;
        if (shouldActivate) {
          const state = createRouterState(this.routeReuseStrategy, snapshot, this.routerState);
          return {appliedUrl, state, shouldActivate};
        } else {
          return {appliedUrl, state: null, shouldActivate};
        }
      }));


      this.activateRoutes(
          routerState$, this.routerState, this.currentUrlTree, id, url, rawUrl, skipLocationChange,
          replaceUrl, resolvePromise, rejectPromise);
    });
  }

  /**
   * Performs the logic of activating routes. This is a synchronous process by default. While this
   * is a private method, it could be overridden to make activation asynchronous.
   */
  private activateRoutes(
      state: Observable<false|
                        {appliedUrl: UrlTree, state: RouterState|null, shouldActivate?: boolean}>,
      storedState: RouterState, storedUrl: UrlTree, id: number, url: UrlTree, rawUrl: UrlTree,
      skipLocationChange: boolean, replaceUrl: boolean, resolvePromise: any, rejectPromise: any) {
    // applied the new router state
    // this operation has side effects
    let navigationIsSuccessful: boolean;

    state
        .forEach((p) => {
          if (typeof p === 'boolean' || !p.shouldActivate || id !== this.navigationId || !p.state) {
            navigationIsSuccessful = false;
            return;
          }
          const {appliedUrl, state} = p;
          this.currentUrlTree = appliedUrl;
          this.rawUrlTree = this.urlHandlingStrategy.merge(this.currentUrlTree, rawUrl);

          (this as{routerState: RouterState}).routerState = state;

          if (this.urlUpdateStrategy === 'deferred' && !skipLocationChange) {
            this.setBrowserUrl(this.rawUrlTree, replaceUrl, id);
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
                this.lastSuccessfulId = id;
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
                this.navigated = true;
                this.resetStateAndUrl(storedState, storedUrl, rawUrl);
                (this.events as Subject<Event>)
                    .next(new NavigationCancel(id, this.serializeUrl(url), e.message));

                resolvePromise(false);
              } else {
                this.resetStateAndUrl(storedState, storedUrl, rawUrl);
                (this.events as Subject<Event>)
                    .next(new NavigationError(id, this.serializeUrl(url), e));
                try {
                  resolvePromise(this.errorHandler(e));
                } catch (ee) {
                  rejectPromise(ee);
                }
              }
            });
  }

  private setBrowserUrl(url: UrlTree, replaceUrl: boolean, id: number) {
    const path = this.urlSerializer.serialize(url);
    if (this.location.isCurrentPathEqualTo(path) || replaceUrl) {
      this.location.replaceState(path, '', {navigationId: id});
    } else {
      this.location.go(path, '', {navigationId: id});
    }
  }

  private resetStateAndUrl(storedState: RouterState, storedUrl: UrlTree, rawUrl: UrlTree): void {
    (this as{routerState: RouterState}).routerState = storedState;
    this.currentUrlTree = storedUrl;
    this.rawUrlTree = this.urlHandlingStrategy.merge(this.currentUrlTree, rawUrl);
    this.resetUrlToCurrentUrlTree();
  }

  private resetUrlToCurrentUrlTree(): void {
    this.location.replaceState(
        this.urlSerializer.serialize(this.rawUrlTree), '', {navigationId: this.lastSuccessfulId});
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

          context.attachRef = null;
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
