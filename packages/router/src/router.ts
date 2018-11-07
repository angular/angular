/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location} from '@angular/common';
import {Compiler, Injector, NgModuleFactoryLoader, NgModuleRef, NgZone, Type, isDevMode, ɵConsole as Console} from '@angular/core';
import {BehaviorSubject, EMPTY, Observable, Subject, Subscription, defer, of } from 'rxjs';
import {catchError, filter, finalize, map, switchMap, tap} from 'rxjs/operators';

import {QueryParamsHandling, Route, Routes, standardizeConfig, validateConfig} from './config';
import {createRouterState} from './create_router_state';
import {createUrlTree} from './create_url_tree';
import {Event, GuardsCheckEnd, GuardsCheckStart, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, NavigationTrigger, ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, RoutesRecognized} from './events';
import {activateRoutes} from './operators/activate_routes';
import {applyRedirects} from './operators/apply_redirects';
import {checkGuards} from './operators/check_guards';
import {recognize} from './operators/recognize';
import {resolveData} from './operators/resolve_data';
import {switchTap} from './operators/switch_tap';
import {DefaultRouteReuseStrategy, RouteReuseStrategy} from './route_reuse_strategy';
import {RouterConfigLoader} from './router_config_loader';
import {ChildrenOutletContexts} from './router_outlet_context';
import {ActivatedRoute, RouterState, RouterStateSnapshot, createEmptyState} from './router_state';
import {Params, isNavigationCancelingError, navigationCancelingError} from './shared';
import {DefaultUrlHandlingStrategy, UrlHandlingStrategy} from './url_handling_strategy';
import {UrlSerializer, UrlTree, containsTree, createEmptyUrlTree} from './url_tree';
import {Checks, getAllRouteGuards} from './utils/preactivation';
import {isUrlTree} from './utils/type_guards';



/**
 * @description
 *
 * Represents the extra options used during navigation.
 *
 * @publicApi
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
 * @publicApi
 */
export type ErrorHandler = (error: any) => any;

function defaultErrorHandler(error: any): any {
  throw error;
}

function defaultMalformedUriErrorHandler(
    error: URIError, urlSerializer: UrlSerializer, url: string): UrlTree {
  return urlSerializer.parse('/');
}

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
  guards: Checks,
  guardsResult: boolean | UrlTree | null,
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
 * @publicApi
 */
export class Router {
  private currentUrlTree: UrlTree;
  private rawUrlTree: UrlTree;
  private readonly transitions: BehaviorSubject<NavigationTransition>;
  private navigations: Observable<NavigationTransition>;

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
      guards: {canActivateChecks: [], canDeactivateChecks: []},
      guardsResult: null,
    });
    this.navigations = this.setupNavigations(this.transitions);

    this.processNavigations();
  }

  private setupNavigations(transitions: Observable<NavigationTransition>):
      Observable<NavigationTransition> {
    const eventsSubject = (this.events as Subject<Event>);
    return transitions.pipe(
        filter(t => t.id !== 0),

        // Extract URL
        map(t => ({
              ...t, extractedUrl: this.urlHandlingStrategy.extract(t.rawUrl)
            } as NavigationTransition)),

        // Using switchMap so we cancel executing navigations when a new one comes in
        switchMap(t => {
          let completed = false;
          let errored = false;
          return of (t).pipe(
              switchMap(t => {
                const urlTransition =
                    !this.navigated || t.extractedUrl.toString() !== this.currentUrlTree.toString();
                const processCurrentUrl =
                    (this.onSameUrlNavigation === 'reload' ? true : urlTransition) &&
                    this.urlHandlingStrategy.shouldProcessUrl(t.rawUrl);

                if (processCurrentUrl) {
                  return of (t).pipe(
                      // Update URL if in `eager` update mode
                      tap(t => this.urlUpdateStrategy === 'eager' && !t.extras.skipLocationChange &&
                              this.setBrowserUrl(t.rawUrl, !!t.extras.replaceUrl, t.id)),
                      // Fire NavigationStart event
                      switchMap(t => {
                        const transition = this.transitions.getValue();
                        eventsSubject.next(new NavigationStart(
                            t.id, this.serializeUrl(t.extractedUrl), t.source, t.state));
                        if (transition !== this.transitions.getValue()) {
                          return EMPTY;
                        }
                        return [t];
                      }),

                      // This delay is required to match old behavior that forced navigation to
                      // always be async
                      switchMap(t => Promise.resolve(t)),

                      // ApplyRedirects
                      applyRedirects(
                          this.ngModule.injector, this.configLoader, this.urlSerializer,
                          this.config),
                      // Recognize
                      recognize(
                          this.rootComponentType, this.config, (url) => this.serializeUrl(url),
                          this.paramsInheritanceStrategy, this.relativeLinkResolution),

                      // Fire RoutesRecognized
                      tap(t => {
                        const routesRecognized = new RoutesRecognized(
                            t.id, this.serializeUrl(t.extractedUrl),
                            this.serializeUrl(t.urlAfterRedirects), t.targetSnapshot !);
                        eventsSubject.next(routesRecognized);
                      }), );
                } else {
                  const processPreviousUrl = urlTransition && this.rawUrlTree &&
                      this.urlHandlingStrategy.shouldProcessUrl(this.rawUrlTree);
                  /* When the current URL shouldn't be processed, but the previous one was, we
                   * handle this "error condition" by navigating to the previously successful URL,
                   * but leaving the URL intact.*/
                  if (processPreviousUrl) {
                    const {id, extractedUrl, source, state, extras} = t;
                    const navStart =
                        new NavigationStart(id, this.serializeUrl(extractedUrl), source, state);
                    eventsSubject.next(navStart);
                    const targetSnapshot =
                        createEmptyState(extractedUrl, this.rootComponentType).snapshot;

                    return of ({
                      ...t,
                      targetSnapshot,
                      urlAfterRedirects: extractedUrl,
                      extras: {...extras, skipLocationChange: false, replaceUrl: false},
                    });
                  } else {
                    /* When neither the current or previous URL can be processed, do nothing other
                     * than update router's internal reference to the current "settled" URL. This
                     * way the next navigation will be coming from the current URL in the browser.
                     */
                    this.rawUrlTree = t.rawUrl;
                    t.resolve(null);
                    return EMPTY;
                  }
                }
              }),

              // Before Preactivation
              switchTap(t => {
                const {
                  targetSnapshot,
                  id: navigationId,
                  extractedUrl: appliedUrlTree,
                  rawUrl: rawUrlTree,
                  extras: {skipLocationChange, replaceUrl}
                } = t;
                return this.hooks.beforePreactivation(targetSnapshot !, {
                  navigationId,
                  appliedUrlTree,
                  rawUrlTree,
                  skipLocationChange: !!skipLocationChange,
                  replaceUrl: !!replaceUrl,
                });
              }),

              // --- GUARDS ---
              tap(t => {
                const guardsStart = new GuardsCheckStart(
                    t.id, this.serializeUrl(t.extractedUrl), this.serializeUrl(t.urlAfterRedirects),
                    t.targetSnapshot !);
                this.triggerEvent(guardsStart);
              }),

              map(t => ({
                    ...t,
                    guards:
                        getAllRouteGuards(t.targetSnapshot !, t.currentSnapshot, this.rootContexts)
                  })),

              checkGuards(this.ngModule.injector, (evt: Event) => this.triggerEvent(evt)),
              tap(t => {
                if (isUrlTree(t.guardsResult)) {
                  const error: Error&{url?: UrlTree} = navigationCancelingError(
                      `Redirecting to "${this.serializeUrl(t.guardsResult)}"`);
                  error.url = t.guardsResult;
                  throw error;
                }
              }),

              tap(t => {
                const guardsEnd = new GuardsCheckEnd(
                    t.id, this.serializeUrl(t.extractedUrl), this.serializeUrl(t.urlAfterRedirects),
                    t.targetSnapshot !, !!t.guardsResult);
                this.triggerEvent(guardsEnd);
              }),

              filter(t => {
                if (!t.guardsResult) {
                  this.resetUrlToCurrentUrlTree();
                  const navCancel =
                      new NavigationCancel(t.id, this.serializeUrl(t.extractedUrl), '');
                  eventsSubject.next(navCancel);
                  t.resolve(false);
                  return false;
                }
                return true;
              }),

              // --- RESOLVE ---
              switchTap(t => {
                if (t.guards.canActivateChecks.length) {
                  return of (t).pipe(
                      tap(t => {
                        const resolveStart = new ResolveStart(
                            t.id, this.serializeUrl(t.extractedUrl),
                            this.serializeUrl(t.urlAfterRedirects), t.targetSnapshot !);
                        this.triggerEvent(resolveStart);
                      }),
                      resolveData(
                          this.paramsInheritanceStrategy,
                          this.ngModule.injector),  //
                      tap(t => {
                        const resolveEnd = new ResolveEnd(
                            t.id, this.serializeUrl(t.extractedUrl),
                            this.serializeUrl(t.urlAfterRedirects), t.targetSnapshot !);
                        this.triggerEvent(resolveEnd);
                      }), );
                }
                return undefined;
              }),

              // --- AFTER PREACTIVATION ---
              switchTap(t => {
                const {
                  targetSnapshot,
                  id: navigationId,
                  extractedUrl: appliedUrlTree,
                  rawUrl: rawUrlTree,
                  extras: {skipLocationChange, replaceUrl}
                } = t;
                return this.hooks.afterPreactivation(targetSnapshot !, {
                  navigationId,
                  appliedUrlTree,
                  rawUrlTree,
                  skipLocationChange: !!skipLocationChange,
                  replaceUrl: !!replaceUrl,
                });
              }),

              map(t => {
                const targetRouterState = createRouterState(
                    this.routeReuseStrategy, t.targetSnapshot !, t.currentRouterState);
                return ({...t, targetRouterState});
              }),

              /* Once here, we are about to activate syncronously. The assumption is this will
                 succeed, and user code may read from the Router service. Therefore before
                 activation, we need to update router properties storing the current URL and the
                 RouterState, as well as updated the browser URL. All this should happen *before*
                 activating. */
              tap(t => {
                this.currentUrlTree = t.urlAfterRedirects;
                this.rawUrlTree = this.urlHandlingStrategy.merge(this.currentUrlTree, t.rawUrl);

                (this as{routerState: RouterState}).routerState = t.targetRouterState !;

                if (this.urlUpdateStrategy === 'deferred' && !t.extras.skipLocationChange) {
                  this.setBrowserUrl(this.rawUrlTree, !!t.extras.replaceUrl, t.id);
                }
              }),

              activateRoutes(
                  this.rootContexts, this.routeReuseStrategy,
                  (evt: Event) => this.triggerEvent(evt)),

              tap({next() { completed = true; }, complete() { completed = true; }}),
              finalize(() => {
                /* When the navigation stream finishes either through error or success, we set the
                 * `completed` or `errored` flag. However, there are some situations where we could
                 * get here without either of those being set. For instance, a redirect during
                 * NavigationStart. Therefore, this is a catch-all to make sure the NavigationCancel
                 * event is fired when a navigation gets cancelled but not caught by other means. */
                if (!completed && !errored) {
                  // Must reset to current URL tree here to ensure history.state is set. On a fresh
                  // page load, if a new navigation comes in before a successful navigation
                  // completes, there will be nothing in history.state.navigationId. This can cause
                  // sync problems with AngularJS sync code which looks for a value here in order
                  // to determine whether or not to handle a given popstate event or to leave it
                  // to the Angualr router.
                  this.resetUrlToCurrentUrlTree();
                  const navCancel = new NavigationCancel(
                      t.id, this.serializeUrl(t.extractedUrl),
                      `Navigation ID ${t.id} is not equal to the current navigation id ${this.navigationId}`);
                  eventsSubject.next(navCancel);
                  t.resolve(false);
                }
              }),
              catchError((e) => {
                errored = true;
                /* This error type is issued during Redirect, and is handled as a cancellation
                 * rather than an error. */
                if (isNavigationCancelingError(e)) {
                  this.navigated = true;
                  const redirecting = isUrlTree(e.url);
                  if (!redirecting) {
                    this.resetStateAndUrl(t.currentRouterState, t.currentUrlTree, t.rawUrl);
                  }
                  const navCancel =
                      new NavigationCancel(t.id, this.serializeUrl(t.extractedUrl), e.message);
                  eventsSubject.next(navCancel);
                  t.resolve(false);

                  if (redirecting) {
                    this.navigateByUrl(e.url);
                  }

                  /* All other errors should reset to the router's internal URL reference to the
                   * pre-error state. */
                } else {
                  this.resetStateAndUrl(t.currentRouterState, t.currentUrlTree, t.rawUrl);
                  const navError = new NavigationError(t.id, this.serializeUrl(t.extractedUrl), e);
                  eventsSubject.next(navError);
                  try {
                    t.resolve(this.errorHandler(e));
                  } catch (ee) {
                    t.reject(ee);
                  }
                }
                return EMPTY;
              }), );
          // TODO(jasonaden): remove cast once g3 is on updated TypeScript
        })) as any as Observable<NavigationTransition>;
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
  triggerEvent(event: Event): void { (this.events as Subject<Event>).next(event); }

  /**
   * Resets the configuration used for navigation and generating links.
   *
   * @usageNotes
   *
   * ### Example
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
   * @usageNotes
   *
   * ### Example
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
   * @usageNotes
   *
   * ### Example
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

    const urlTree = isUrlTree(url) ? url : this.parseUrl(url);
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
   * @usageNotes
   *
   * ### Example
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
    if (isUrlTree(url)) {
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
        e => { this.console.warn(`Unhandled Navigation Error: `); });
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

function validateCommands(commands: string[]): void {
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    if (cmd == null) {
      throw new Error(`The requested path contains ${cmd} segment at index ${i}`);
    }
  }
}
