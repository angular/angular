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
 * Options that modify the navigation strategy.
 *
 * @publicApi
 */
export interface NavigationExtras {
  /**
   * Specifies a root URI to use for relative navigation.
   *
   * For example, consider the following route configuration where the parent route
   * has two children.
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
   * The following `go()` function navigates to the `list` route by
   * interpreting the destination URI as relative to the activated `child`  route
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
   * **DEPRECATED**: Use `queryParamsHandling: "preserve"` instead to preserve
   * query parameters for the next navigation.
   *
   * @deprecated since v4
   */
  preserveQueryParams?: boolean;

  /**
   * How to handle query parameters in the router link for the next navigation.
   * One of:
   * * `merge` : Merge new with current parameters.
   * * `preserve` : Preserve current parameters.
   *
   * ```
   * // from /results?page=1 to /view?page=1&page=2
   * this.router.navigate(['/view'], { queryParams: { page: 2 },  queryParamsHandling: "merge" });
   * ```
   */
  queryParamsHandling?: QueryParamsHandling|null;
  /**
   * When true, preserves the URL fragment for the next navigation
   *
   * ```
   * // Preserve fragment from /results#top to /view#top
   * this.router.navigate(['/view'], { preserveFragment: true });
   * ```
   */
  preserveFragment?: boolean;
  /**
   * When true, navigates without pushing a new state into history.
   *
   * ```
   * // Navigate silently to /view
   * this.router.navigate(['/view'], { skipLocationChange: true });
   * ```
   */
  skipLocationChange?: boolean;
  /**
   * When true, navigates while replacing the current state in history.
   *
   * ```
   * // Navigate to /view
   * this.router.navigate(['/view'], { replaceUrl: true });
   * ```
   */
  replaceUrl?: boolean;
  /**
   * Developer-defined state that can be passed to any navigation.
   * Access this value through the `Navigation.extras` object
   * returned from `router.getCurrentNavigation()` while a navigation is executing.
   *
   * After a navigation completes, the router writes an object containing this
   * value together with a `navigationId` to `history.state`.
   * The value is written when `location.go()` or `location.replaceState()`
   * is called before activating this route.
   *
   * Note that `history.state` does not pass an object equality test because
   * the router adds the `navigationId` on each navigation.
   */
  state?: {[k: string]: any};
}

/**
 * Error handler that is invoked when a navigation error occurs.
 *
 * If the handler returns a value, the navigation promise is resolved with this value.
 * If the handler throws an exception, the navigation promise is rejected with
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

export type RestoredState = {
  [k: string]: any; navigationId: number;
};

/**
 * Information about a navigation operation. Retrieve the most recent
 * navigation object with the `router.getCurrentNavigation()` method.
 *
 * @publicApi
 */
export type Navigation = {
  /**
   * The ID of the current navigation.
   */
  id: number;
  /**
   * The target URL passed into the `Router#navigateByUrl()` call before navigation. This is
   * the value before the router has parsed or applied redirects to it.
   */
  initialUrl: string | UrlTree;
  /**
   * The initial target URL after being parsed with `UrlSerializer.extract()`.
   */
  extractedUrl: UrlTree;
  /**
   * The extracted URL after redirects have been applied.
   * This URL may not be available immediately, therefore this property can be `undefined`.
   * It is guaranteed to be set after the `RoutesRecognized` event fires.
   */
  finalUrl?: UrlTree;
  /**
   * Identifies how this navigation was triggered.
   *
   * * 'imperative'--Triggered by `router.navigateByUrl` or `router.navigate`.
   * * 'popstate'--Triggered by a popstate event.
   * * 'hashchange'--Triggered by a hashchange event.
   */
  trigger: 'imperative' | 'popstate' | 'hashchange';
  /**
   * Options that controlled the strategy used for this navigation.
   * See `NavigationExtras`.
   */
  extras: NavigationExtras;
  /**
   * The previously successful `Navigation` object. Only one previous navigation
   * is available, therefore this previous `Navigation` object has a `null` value
   * for its own `previousNavigation`.
   */
  previousNavigation: Navigation | null;
};

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
  restoredState: RestoredState | null,
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
 * An NgModule that provides navigation and URL manipulation capabilities.
 *
 * @see `Route`.
 * @see [Routing and Navigation Guide](guide/router).
 *
 * @ngModule RouterModule
 *
 * @publicApi
 */
export class Router {
  private currentUrlTree: UrlTree;
  private rawUrlTree: UrlTree;
  private browserUrlTree: UrlTree;
  private readonly transitions: BehaviorSubject<NavigationTransition>;
  private navigations: Observable<NavigationTransition>;
  private lastSuccessfulNavigation: Navigation|null = null;
  private currentNavigation: Navigation|null = null;

  // TODO(issue/24571): remove '!'.
  private locationSubscription !: Subscription;
  private navigationId: number = 0;
  private configLoader: RouterConfigLoader;
  private ngModule: NgModuleRef<any>;
  private console: Console;
  private isNgZoneEnabled: boolean = false;

  /**
   * An event stream for routing events in this NgModule.
   */
  public readonly events: Observable<Event> = new Subject<Event>();
  /**
   * The current state of routing in this NgModule.
   */
  public readonly routerState: RouterState;

  /**
   * A handler for navigation errors in this NgModule.
   */
  errorHandler: ErrorHandler = defaultErrorHandler;

  /**
   * A handler for errors thrown by `Router.parseUrl(url)`
   * when `url` contains an invalid character.
   * The most common case is a `%` sign
   * that's not encoded and is not part of a percent encoded sequence.
   */
  malformedUriErrorHandler:
      (error: URIError, urlSerializer: UrlSerializer,
       url: string) => UrlTree = defaultMalformedUriErrorHandler;

  /**
   * True if at least one navigation event has occurred,
   * false otherwise.
   */
  navigated: boolean = false;
  private lastSuccessfulId: number = -1;

  /**
   * Hooks that enable you to pause navigation,
   * either before or after the preactivation phase.
   * Used by `RouterModule`.
   *
   * @internal
   */
  hooks: {beforePreactivation: RouterHook, afterPreactivation: RouterHook} = {
    beforePreactivation: defaultRouterHook,
    afterPreactivation: defaultRouterHook
  };

  /**
   * A strategy for extracting and merging URLs.
   * Used for AngularJS to Angular migrations.
   */
  urlHandlingStrategy: UrlHandlingStrategy = new DefaultUrlHandlingStrategy();

  /**
   * A strategy for re-using routes.
   */
  routeReuseStrategy: RouteReuseStrategy = new DefaultRouteReuseStrategy();

  /**
   * How to handle a navigation request to the current URL. One of:
   * - `'ignore'` :  The router ignores the request.
   * - `'reload'` : The router reloads the URL. Use to implement a "refresh" feature.
   */
  onSameUrlNavigation: 'reload'|'ignore' = 'ignore';

  /**
   * How to merge parameters, data, and resolved data from parent to child
   * routes. One of:
   *
   * - `'emptyOnly'` : Inherit parent parameters, data, and resolved data
   * for path-less or component-less routes.
   * - `'always'` : Inherit parent parameters, data, and resolved data
   * for all child routes.
   */
  paramsInheritanceStrategy: 'emptyOnly'|'always' = 'emptyOnly';

  /**
   * Determines when the router updates the browser URL.
   * By default (`"deferred"`), udates the browser URL after navigation has finished.
   * Set to `'eager'` to update the browser URL at the beginning of navigation.
   * You can choose to update early so that, if navigation fails,
   * you can show an error message with the URL that failed.
   */
  urlUpdateStrategy: 'deferred'|'eager' = 'deferred';

  /**
   * Enables a bug fix that corrects relative link resolution in components with empty paths.
   * @see `RouterModule`
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
    this.browserUrlTree = this.currentUrlTree;

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
      restoredState: null,
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
              // Store the Navigation object
              tap(t => {
                this.currentNavigation = {
                  id: t.id,
                  initialUrl: t.currentRawUrl,
                  extractedUrl: t.extractedUrl,
                  trigger: t.source,
                  extras: t.extras,
                  previousNavigation: this.lastSuccessfulNavigation ?
                      {...this.lastSuccessfulNavigation, previousNavigation: null} :
                      null
                };
              }),
              switchMap(t => {
                const urlTransition =
                    !this.navigated || t.extractedUrl.toString() !== this.browserUrlTree.toString();
                const processCurrentUrl =
                    (this.onSameUrlNavigation === 'reload' ? true : urlTransition) &&
                    this.urlHandlingStrategy.shouldProcessUrl(t.rawUrl);

                if (processCurrentUrl) {
                  return of (t).pipe(
                      // Fire NavigationStart event
                      switchMap(t => {
                        const transition = this.transitions.getValue();
                        eventsSubject.next(new NavigationStart(
                            t.id, this.serializeUrl(t.extractedUrl), t.source, t.restoredState));
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

                      // Update the currentNavigation
                      tap(t => {
                        this.currentNavigation = {
                          ...this.currentNavigation !,
                          finalUrl: t.urlAfterRedirects
                        };
                      }),

                      // Recognize
                      recognize(
                          this.rootComponentType, this.config, (url) => this.serializeUrl(url),
                          this.paramsInheritanceStrategy, this.relativeLinkResolution),

                      // Update URL if in `eager` update mode
                      tap(t => {
                        if (this.urlUpdateStrategy === 'eager') {
                          if (!t.extras.skipLocationChange) {
                            this.setBrowserUrl(
                                t.urlAfterRedirects, !!t.extras.replaceUrl, t.id, t.extras.state);
                          }
                          this.browserUrlTree = t.urlAfterRedirects;
                        }
                      }),

                      // Fire RoutesRecognized
                      tap(t => {
                        const routesRecognized = new RoutesRecognized(
                            t.id, this.serializeUrl(t.extractedUrl),
                            this.serializeUrl(t.urlAfterRedirects), t.targetSnapshot !);
                        eventsSubject.next(routesRecognized);
                      }));
                } else {
                  const processPreviousUrl = urlTransition && this.rawUrlTree &&
                      this.urlHandlingStrategy.shouldProcessUrl(this.rawUrlTree);
                  /* When the current URL shouldn't be processed, but the previous one was, we
                   * handle this "error condition" by navigating to the previously successful URL,
                   * but leaving the URL intact.*/
                  if (processPreviousUrl) {
                    const {id, extractedUrl, source, restoredState, extras} = t;
                    const navStart = new NavigationStart(
                        id, this.serializeUrl(extractedUrl), source, restoredState);
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
                    this.browserUrlTree = t.urlAfterRedirects;
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
                      }));
                }
                return undefined;
              }),

              // --- AFTER PREACTIVATION ---
              switchTap((t: NavigationTransition) => {
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

              map((t: NavigationTransition) => {
                const targetRouterState = createRouterState(
                    this.routeReuseStrategy, t.targetSnapshot !, t.currentRouterState);
                return ({...t, targetRouterState});
              }),

              /* Once here, we are about to activate syncronously. The assumption is this will
                 succeed, and user code may read from the Router service. Therefore before
                 activation, we need to update router properties storing the current URL and the
                 RouterState, as well as updated the browser URL. All this should happen *before*
                 activating. */
              tap((t: NavigationTransition) => {
                this.currentUrlTree = t.urlAfterRedirects;
                this.rawUrlTree = this.urlHandlingStrategy.merge(this.currentUrlTree, t.rawUrl);

                (this as{routerState: RouterState}).routerState = t.targetRouterState !;

                if (this.urlUpdateStrategy === 'deferred') {
                  if (!t.extras.skipLocationChange) {
                    this.setBrowserUrl(
                        this.rawUrlTree, !!t.extras.replaceUrl, t.id, t.extras.state);
                  }
                  this.browserUrlTree = t.urlAfterRedirects;
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
                // currentNavigation should always be reset to null here. If navigation was
                // successful, lastSuccessfulTransition will have already been set. Therefore we
                // can safely set currentNavigation to null here.
                this.currentNavigation = null;
              }),
              catchError((e) => {
                errored = true;
                /* This error type is issued during Redirect, and is handled as a cancellation
                 * rather than an error. */
                if (isNavigationCancelingError(e)) {
                  const redirecting = isUrlTree(e.url);
                  if (!redirecting) {
                    // Set property only if we're not redirecting. If we landed on a page and
                    // redirect to `/` route, the new navigation is going to see the `/` isn't
                    // a change from the default currentUrlTree and won't navigate. This is
                    // only applicable with initial navigation, so setting `navigated` only when
                    // not redirecting resolves this scenario.
                    this.navigated = true;
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
              }));
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

  private getTransition(): NavigationTransition {
    const transition = this.transitions.value;
    // This value needs to be set. Other values such as extractedUrl are set on initial navigation
    // but the urlAfterRedirects may not get set if we aren't processing the new URL *and* not
    // processing the previous URL.
    transition.urlAfterRedirects = this.browserUrlTree;
    return transition;
  }

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
        // Navigations coming from Angular router have a navigationId state property. When this
        // exists, restore the state.
        const state = change.state && change.state.navigationId ? change.state : null;
        setTimeout(
            () => { this.scheduleNavigation(rawUrlTree, source, state, {replaceUrl: true}); }, 0);
      });
    }
  }

  /** The current URL. */
  get url(): string { return this.serializeUrl(this.currentUrlTree); }

  /** The current Navigation object if one exists */
  getCurrentNavigation(): Navigation|null { return this.currentNavigation; }

  /** @internal */
  triggerEvent(event: Event): void { (this.events as Subject<Event>).next(event); }

  /**
   * Resets the configuration used for navigation and generating links.
   *
   * @param config The route array for the new configuration.
   *
   * @usageNotes
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

  /** Disposes of the router. */
  dispose(): void {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
      this.locationSubscription = null !;
    }
  }

  /**
   * Applies an array of commands to the current URL tree and creates a new URL tree.
   *
   * When given an activate route, applies the given commands starting from the route.
   * Otherwise, applies the given command starting from the root.
   *
   * @param commands An array of commands to apply.
   * @param navigationExtras Options that control the navigation strategy.
   * @returns The new URL tree.
   *
   * @usageNotes
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
   * // If the first segment can contain slashes, and you do not want the router to split it,
   * // you can do the following:
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
   * Navigate based on the provided URL, which must be absolute.
   *
   * @param url An absolute URL. The function does not apply any delta to the current URL.
   * @param extras An object containing properties that modify the navigation strategy.
   * The function ignores any properties in the `NavigationExtras` that would change the
   * provided URL.
   *
   * @returns A Promise that resolves to 'true' when navigation succeeds,
   * to 'false' when navigation fails, or is rejected on error.
   *
   * @usageNotes
   *
   * ```
   * router.navigateByUrl("/team/33/user/11");
   *
   * // Navigate without updating the URL
   * router.navigateByUrl("/team/33/user/11", { skipLocationChange: true });
   * ```
   *
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
   *
   * In order to affect this browser's `history.state` entry, the `state`
   * parameter can be passed. This must be an object because the router
   * will add the `navigationId` property to this object before creating
   * the new history item.
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
          this.lastSuccessfulNavigation = this.currentNavigation;
          this.currentNavigation = null;
          t.resolve(true);
        },
        e => { this.console.warn(`Unhandled Navigation Error: `); });
  }

  private scheduleNavigation(
      rawUrl: UrlTree, source: NavigationTrigger, restoredState: RestoredState|null,
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
      restoredState,
      currentUrlTree: this.currentUrlTree,
      currentRawUrl: this.rawUrlTree, rawUrl, extras, resolve, reject, promise,
      currentSnapshot: this.routerState.snapshot,
      currentRouterState: this.routerState
    });

    // Make sure that the error is propagated even though `processNavigations` catch
    // handler does not rethrow
    return promise.catch((e: any) => { return Promise.reject(e); });
  }

  private setBrowserUrl(
      url: UrlTree, replaceUrl: boolean, id: number, state?: {[key: string]: any}) {
    const path = this.urlSerializer.serialize(url);
    state = state || {};
    if (this.location.isCurrentPathEqualTo(path) || replaceUrl) {
      // TODO(jasonaden): Remove first `navigationId` and rely on `ng` namespace.
      this.location.replaceState(path, '', {...state, navigationId: id});
    } else {
      this.location.go(path, '', {...state, navigationId: id});
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
