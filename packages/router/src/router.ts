/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location} from '@angular/common';
import {Compiler, Injector, NgModuleFactoryLoader, NgModuleRef, NgZone, Type, isDevMode, ɵConsole as Console} from '@angular/core';
import {BehaviorSubject, EMPTY, MonoTypeOperatorFunction, Observable, Subject, Subscription, of } from 'rxjs';
import {catchError, filter, finalize, map, mergeMap, switchMap, tap} from 'rxjs/operators';

import {LoadedRouterConfig, QueryParamsHandling, Route, Routes, standardizeConfig, validateConfig} from './config';
import {createRouterState} from './create_router_state';
import {createUrlTree} from './create_url_tree';
import {ActivationEnd, ChildActivationEnd, Event, GuardsCheckEnd, GuardsCheckStart, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, NavigationTrigger, ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, RoutesRecognized} from './events';
import {afterPreactivation} from './operators/after_preactivation';
import {applyRedirects} from './operators/apply_redirects';
import {beforePreactivation} from './operators/before_preactivation';
import {checkGuards} from './operators/check_guards';
import {mergeMapIf} from './operators/mergeMapIf';
import {recognize} from './operators/recognize';
import {resolveData} from './operators/resolve_data';
import {PreActivation} from './pre_activation';
import {DefaultRouteReuseStrategy, DetachedRouteHandleInternal, RouteReuseStrategy} from './route_reuse_strategy';
import {RouterConfigLoader} from './router_config_loader';
import {ChildrenOutletContexts} from './router_outlet_context';
import {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot, advanceActivatedRoute, createEmptyState} from './router_state';
import {Params, isNavigationCancelingError} from './shared';
import {DefaultUrlHandlingStrategy, UrlHandlingStrategy} from './url_handling_strategy';
import {UrlSerializer, UrlTree, containsTree, createEmptyUrlTree} from './url_tree';
import {assertDefined} from './utils/assert';
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

export type NavigationTransition = {
  id: number,
  currentUrlTree: UrlTree,
  currentRawUrl: UrlTree,
  extractedUrl: UrlTree,
  urlAfterRedirects: UrlTree,
  rawUrl: UrlTree,
  extras: NavigationExtras,
  resolve: any,
  reject: any,
  promise: Promise<boolean>,
  source: NavigationTrigger,
  state: {navigationId: number} | null,
  currentSnapshot: RouterStateSnapshot,
  targetSnapshot: RouterStateSnapshot | null,
  currentRouterState: RouterState,
  targetRouterState: RouterState | null,
  guardsResult: boolean | null,
  preActivation: PreActivation | null
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
  private navigations: Observable<NavigationTransition>;

  // TODO(issue/24571): remove '!'.
  private locationSubscription !: Subscription;
  private navigationId: number = 0;
  private configLoader: RouterConfigLoader;
  private ngModule: NgModuleRef<any>;
  private console: Console;
  private isNgZoneEnabled: boolean = false;

  public readonly transitions: BehaviorSubject<NavigationTransition>;
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

    this.transitions = new BehaviorSubject<NavigationTransition>({
      id: 0,
      currentUrlTree: this.currentUrlTree,
      currentRawUrl: this.currentUrlTree,
      extractedUrl: this.urlHandlingStrategy.extract(this.currentUrlTree),
      urlAfterRedirects: this.urlHandlingStrategy.extract(this.currentUrlTree),
      rawUrl: this.currentUrlTree,
      extras: {},
      resolve: null,
      reject: null,
      promise: Promise.resolve(true),
      source: 'imperative',
      state: null,
      currentSnapshot: this.routerState.snapshot,
      targetSnapshot: null,
      currentRouterState: this.routerState,
      targetRouterState: null,
      guardsResult: null,
      preActivation: null
    });
    this.navigations = this.setupNavigations(this.transitions);

    this.processNavigations();
  }

  private setupNavigations(transitions: Observable<NavigationTransition>): Observable<NavigationTransition> {
    return transitions.pipe(
        filter(t => t.id !== 0),
        // Extract URL
        map(t => ({...t, extractedUrl: this.urlHandlingStrategy.extract(t.rawUrl)}) as NavigationTransition),

        // Using switchMap so we cancel executing navigations when a new one comes in
        switchMap(t => {
          let completed = false;
          let errored = false;
          return of (t).pipe(
              mergeMap(t => {
                const urlTransition =
                    !this.navigated || t.extractedUrl.toString() !== this.currentUrlTree.toString();
                if ((this.onSameUrlNavigation === 'reload' ? true : urlTransition) &&
                    this.urlHandlingStrategy.shouldProcessUrl(t.rawUrl)) {
                  return of (t).pipe(
                      // Update URL if in `eager` update mode
                      tap(t => this.urlUpdateStrategy === 'eager' && !t.extras.skipLocationChange &&
                              this.setBrowserUrl(t.rawUrl, !!t.extras.replaceUrl, t.id)),
                      // Fire NavigationStart event
                      tap(t =>
                              (this.events as Subject<Event>)
                                  .next(new NavigationStart(
                                      t.id, this.serializeUrl(t.extractedUrl), t.source, t.state))),

                      // This delay is required to match old behavior that forced navigation to
                      // always be async
                      mergeMap(t => Promise.resolve(t)),

                      // ApplyRedirects
                      applyRedirects(
                          this.ngModule.injector, this.configLoader, this.urlSerializer,
                          this.config),
                      // Recognize
                      recognize(
                          this.rootComponentType, this.config, (url) => this.serializeUrl(url),
                          this.paramsInheritanceStrategy),
                      // Throw if there's no snapshot
                      tap(t => assertDefined(t.targetSnapshot, 'snapshot must be defined')),
                      // Fire RoutesRecognized
                      tap(t => (this.events as Subject<Event>)
                                   .next(new RoutesRecognized(
                                       t.id, this.serializeUrl(t.extractedUrl),
                                       this.serializeUrl(t.urlAfterRedirects),
                                       t.targetSnapshot !))), );
                } else if (
                    urlTransition && this.rawUrlTree &&
                    this.urlHandlingStrategy.shouldProcessUrl(this.rawUrlTree)) {
                  (this.events as Subject<Event>)
                      .next(new NavigationStart(
                          t.id, this.serializeUrl(t.extractedUrl), t.source, t.state));

                  return of ({
                    ...t,
                    urlAfterRedirects: t.extractedUrl,
                    extras: {...t.extras, skipLocationChange: false, replaceUrl: false},
                    targetSnapshot:
                        createEmptyState(t.extractedUrl, this.rootComponentType).snapshot
                  });
                } else {
                  this.rawUrlTree = t.rawUrl;
                  t.resolve(null);
                  return EMPTY;
                }
              }),

              // Before Preactivation
              beforePreactivation(this.hooks.beforePreactivation),
              // --- GUARDS ---
              tap(t => this.triggerEvent(new GuardsCheckStart(
                      t.id, this.serializeUrl(t.extractedUrl),
                      this.serializeUrl(t.urlAfterRedirects), t.targetSnapshot !))),
              map(t => {
                const preActivation = new PreActivation(
                    t.targetSnapshot !, t.currentSnapshot, this.ngModule.injector,
                    (evt: Event) => this.triggerEvent(evt));
                preActivation.initialize(this.rootContexts);
                return {...t, preActivation};
              }),
              checkGuards(),
              tap(t => this.triggerEvent(new GuardsCheckEnd(
                      t.id, this.serializeUrl(t.extractedUrl),
                      this.serializeUrl(t.urlAfterRedirects), t.targetSnapshot !,
                      !!t.guardsResult))),

              mergeMapIf(
                  t => !t.guardsResult,
                  t => {
                    this.resetUrlToCurrentUrlTree();
                    (this.events as Subject<Event>)
                        .next(new NavigationCancel(t.id, this.serializeUrl(t.extractedUrl), ''));
                    t.resolve(false);
                  }),

              // --- RESOLVE ---
              mergeMap(t => {
                if (t.preActivation !.isActivating()) {
                  return of (t).pipe(
                      tap(t => this.triggerEvent(new ResolveStart(
                              t.id, this.serializeUrl(t.extractedUrl),
                              this.serializeUrl(t.urlAfterRedirects), t.targetSnapshot !))),
                      resolveData(this.paramsInheritanceStrategy),
                      tap(t => this.triggerEvent(new ResolveEnd(
                              t.id, this.serializeUrl(t.extractedUrl),
                              this.serializeUrl(t.urlAfterRedirects), t.targetSnapshot !))), );
                }
                return of (t);
              }),

              // --- AFTER PREACTIVATION ---
              afterPreactivation(this.hooks.afterPreactivation), map(t => {
                const targetRouterState = createRouterState(
                    this.routeReuseStrategy, t.targetSnapshot !, t.currentRouterState);
                return ({...t, targetRouterState});
              }),

              // Side effects of resetting Router instance
              tap(t => {
                this.currentUrlTree = t.urlAfterRedirects;
                this.rawUrlTree = this.urlHandlingStrategy.merge(this.currentUrlTree, t.rawUrl);

                (this as{routerState: RouterState}).routerState = t.targetRouterState !;

                if (this.urlUpdateStrategy === 'deferred' && !t.extras.skipLocationChange) {
                  this.setBrowserUrl(this.rawUrlTree, !!t.extras.replaceUrl, t.id);
                }
              }),

              activate(
                  this.rootContexts, this.routeReuseStrategy,
                  (evt: Event) => this.triggerEvent(evt)),

              tap({next: () => completed = true, complete: () => completed = true}),
              finalize(() => {
                if (!completed && !errored) {
                  (this.events as Subject<Event>)
                      .next(new NavigationCancel(
                          t.id, this.serializeUrl(t.extractedUrl),
                          `Navigation ID ${t.id} is not equal to the current navigation id ${this.navigationId}`));
                  t.resolve(false);
                }
              }),
              catchError((e) => {
                errored = true;
                if (isNavigationCancelingError(e)) {
                  this.navigated = true;
                  this.resetStateAndUrl(t.currentRouterState, t.currentUrlTree, t.rawUrl);
                  (this.events as Subject<Event>)
                      .next(
                          new NavigationCancel(t.id, this.serializeUrl(t.extractedUrl), e.message));
                } else {
                  this.resetStateAndUrl(t.currentRouterState, t.currentUrlTree, t.rawUrl);
                  (this.events as Subject<Event>)
                      .next(new NavigationError(t.id, this.serializeUrl(t.extractedUrl), e));
                  try {
                    t.resolve(this.errorHandler(e));
                  } catch (ee) {
                    t.reject(ee);
                  }
                }
                return EMPTY;
              }), );
            })) as any as Observable<NavigationTransition>;

    function activate(
        rootContexts: ChildrenOutletContexts, routeReuseStrategy: RouteReuseStrategy,
        forwardEvent: (evt: Event) => void): MonoTypeOperatorFunction<NavigationTransition> {
      return function(source: Observable<NavigationTransition>) {
        return source.pipe(map(t => {
          new ActivateRoutes(
              routeReuseStrategy, t.targetRouterState !, t.currentRouterState, forwardEvent)
              .activate(rootContexts);
          return t;
        }));
      };
    }
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

  private getTransition(): NavigationTransition { return this.transitions.value; }

  private setTransition(t: Partial<NavigationTransition>): void {
    this.transitions.next({...this.getTransition(), ...t});
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
    this.navigations.subscribe(
        t => {
          this.navigated = true;
          this.lastSuccessfulId = t.id;
          (this.events as Subject<Event>)
              .next(new NavigationEnd(
                  t.id, this.serializeUrl(t.extractedUrl), this.serializeUrl(this.currentUrlTree)));
          t.resolve(true);
        },
        e => { throw 'never get here!'; });
  }

  private scheduleNavigation(
      rawUrl: UrlTree, source: NavigationTrigger, state: {navigationId: number}|null,
      extras: NavigationExtras): Promise<boolean> {
    const lastNavigation = this.getTransition();
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
    this.setTransition({
      id,
      source,
      state,
      currentUrlTree: this.currentUrlTree,
      currentRawUrl: this.rawUrlTree, rawUrl, extras, resolve, reject, promise,
      currentSnapshot: this.routerState.snapshot,
      currentRouterState: this.routerState
    });

    // Make sure that the error is propagated even though `processNavigations` catch
    // handler does not rethrow
    return promise.catch((e: any) => { return Promise.reject(e); });
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
