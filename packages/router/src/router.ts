/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location} from '@angular/common';
import {Compiler, Injectable, Injector, NgModuleRef, NgZone, Type, ɵConsole as Console, ɵRuntimeError as RuntimeError} from '@angular/core';
import {BehaviorSubject, combineLatest, EMPTY, Observable, of, Subject, SubscriptionLike} from 'rxjs';
import {catchError, defaultIfEmpty, filter, finalize, map, switchMap, take, tap} from 'rxjs/operators';

import {createRouterState} from './create_router_state';
import {createUrlTree} from './create_url_tree';
import {RuntimeErrorCode} from './errors';
import {Event, GuardsCheckEnd, GuardsCheckStart, NavigationCancel, NavigationCancellationCode, NavigationEnd, NavigationError, NavigationStart, NavigationTrigger, ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, RoutesRecognized} from './events';
import {QueryParamsHandling, Route, Routes} from './models';
import {activateRoutes} from './operators/activate_routes';
import {applyRedirects} from './operators/apply_redirects';
import {checkGuards} from './operators/check_guards';
import {recognize} from './operators/recognize';
import {resolveData} from './operators/resolve_data';
import {switchTap} from './operators/switch_tap';
import {TitleStrategy} from './page_title_strategy';
import {DefaultRouteReuseStrategy, RouteReuseStrategy} from './route_reuse_strategy';
import {RouterConfigLoader} from './router_config_loader';
import {ChildrenOutletContexts} from './router_outlet_context';
import {ActivatedRoute, ActivatedRouteSnapshot, createEmptyState, RouterState, RouterStateSnapshot} from './router_state';
import {isNavigationCancelingError, navigationCancelingError, Params, REDIRECTING_CANCELLATION_REASON} from './shared';
import {DefaultUrlHandlingStrategy, UrlHandlingStrategy} from './url_handling_strategy';
import {containsTree, createEmptyUrlTree, IsActiveMatchOptions, UrlSerializer, UrlTree} from './url_tree';
import {standardizeConfig, validateConfig} from './utils/config';
import {Checks, getAllRouteGuards} from './utils/preactivation';
import {isUrlTree} from './utils/type_guards';


const NG_DEV_MODE = typeof ngDevMode === 'undefined' || !!ngDevMode;

/**
 * @description
 *
 * Options that modify the `Router` URL.
 * Supply an object containing any of these properties to a `Router` navigation function to
 * control how the target URL should be constructed.
 *
 * @see [Router.navigate() method](api/router/Router#navigate)
 * @see [Router.createUrlTree() method](api/router/Router#createurltree)
 * @see [Routing and Navigation guide](guide/router)
 *
 * @publicApi
 */
export interface UrlCreationOptions {
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
   *
   * A value of `null` or `undefined` indicates that the navigation commands should be applied
   * relative to the root.
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
   * How to handle query parameters in the router link for the next navigation.
   * One of:
   * * `preserve` : Preserve current parameters.
   * * `merge` : Merge new with current parameters.
   *
   * The "preserve" option discards any new query params:
   * ```
   * // from /view1?page=1 to/view2?page=1
   * this.router.navigate(['/view2'], { queryParams: { page: 2 },  queryParamsHandling: "preserve"
   * });
   * ```
   * The "merge" option appends new query params to the params from the current URL:
   * ```
   * // from /view1?page=1 to/view2?page=1&otherKey=2
   * this.router.navigate(['/view2'], { queryParams: { otherKey: 2 },  queryParamsHandling: "merge"
   * });
   * ```
   * In case of a key collision between current parameters and those in the `queryParams` object,
   * the new value is used.
   *
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
}

/**
 * @description
 *
 * Options that modify the `Router` navigation strategy.
 * Supply an object containing any of these properties to a `Router` navigation function to
 * control how the navigation should be handled.
 *
 * @see [Router.navigate() method](api/router/Router#navigate)
 * @see [Router.navigateByUrl() method](api/router/Router#navigatebyurl)
 * @see [Routing and Navigation guide](guide/router)
 *
 * @publicApi
 */
export interface NavigationBehaviorOptions {
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
   * returned from the [Router.getCurrentNavigation()
   * method](api/router/Router#getcurrentnavigation) while a navigation is executing.
   *
   * After a navigation completes, the router writes an object containing this
   * value together with a `navigationId` to `history.state`.
   * The value is written when `location.go()` or `location.replaceState()`
   * is called before activating this route.
   *
   * Note that `history.state` does not pass an object equality test because
   * the router adds the `navigationId` on each navigation.
   *
   */
  state?: {[k: string]: any};
}

/**
 * @description
 *
 * Options that modify the `Router` navigation strategy.
 * Supply an object containing any of these properties to a `Router` navigation function to
 * control how the target URL should be constructed or interpreted.
 *
 * @see [Router.navigate() method](api/router/Router#navigate)
 * @see [Router.navigateByUrl() method](api/router/Router#navigatebyurl)
 * @see [Router.createUrlTree() method](api/router/Router#createurltree)
 * @see [Routing and Navigation guide](guide/router)
 * @see UrlCreationOptions
 * @see NavigationBehaviorOptions
 *
 * @publicApi
 */
export interface NavigationExtras extends UrlCreationOptions, NavigationBehaviorOptions {}

/**
 * Error handler that is invoked when a navigation error occurs.
 *
 * If the handler returns a value, the navigation Promise is resolved with this value.
 * If the handler throws an exception, the navigation Promise is rejected with
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
  [k: string]: any,
  // TODO(#27607): Remove `navigationId` and `ɵrouterPageId` and move to `ng` or `ɵ` namespace.
  navigationId: number,
  // The `ɵ` prefix is there to reduce the chance of colliding with any existing user properties on
  // the history state.
  ɵrouterPageId?: number,
};

/**
 * Information about a navigation operation.
 * Retrieve the most recent navigation object with the
 * [Router.getCurrentNavigation() method](api/router/Router#getcurrentnavigation) .
 *
 * * *id* : The unique identifier of the current navigation.
 * * *initialUrl* : The target URL passed into the `Router#navigateByUrl()` call before navigation.
 * This is the value before the router has parsed or applied redirects to it.
 * * *extractedUrl* : The initial target URL after being parsed with `UrlSerializer.extract()`.
 * * *finalUrl* : The extracted URL after redirects have been applied.
 * This URL may not be available immediately, therefore this property can be `undefined`.
 * It is guaranteed to be set after the `RoutesRecognized` event fires.
 * * *trigger* : Identifies how this navigation was triggered.
 * -- 'imperative'--Triggered by `router.navigateByUrl` or `router.navigate`.
 * -- 'popstate'--Triggered by a popstate event.
 * -- 'hashchange'--Triggered by a hashchange event.
 * * *extras* : A `NavigationExtras` options object that controlled the strategy used for this
 * navigation.
 * * *previousNavigation* : The previously successful `Navigation` object. Only one previous
 * navigation is available, therefore this previous `Navigation` object has a `null` value for its
 * own `previousNavigation`.
 *
 * @publicApi
 */
export interface Navigation {
  /**
   * The unique identifier of the current navigation.
   */
  id: number;
  /**
   * The target URL passed into the `Router#navigateByUrl()` call before navigation. This is
   * the value before the router has parsed or applied redirects to it.
   */
  initialUrl: UrlTree;
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
  trigger: 'imperative'|'popstate'|'hashchange';
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
  previousNavigation: Navigation|null;
}

export interface NavigationTransition {
  id: number;
  targetPageId: number;
  currentUrlTree: UrlTree;
  currentRawUrl: UrlTree;
  extractedUrl: UrlTree;
  urlAfterRedirects?: UrlTree;
  rawUrl: UrlTree;
  extras: NavigationExtras;
  resolve: any;
  reject: any;
  promise: Promise<boolean>;
  source: NavigationTrigger;
  restoredState: RestoredState|null;
  currentSnapshot: RouterStateSnapshot;
  targetSnapshot: RouterStateSnapshot|null;
  currentRouterState: RouterState;
  targetRouterState: RouterState|null;
  guards: Checks;
  guardsResult: boolean|UrlTree|null;
}

/**
 * The equivalent `IsActiveMatchOptions` options for `Router.isActive` is called with `true`
 * (exact = true).
 */
export const exactMatchOptions: IsActiveMatchOptions = {
  paths: 'exact',
  fragment: 'ignored',
  matrixParams: 'ignored',
  queryParams: 'exact'
};

/**
 * The equivalent `IsActiveMatchOptions` options for `Router.isActive` is called with `false`
 * (exact = false).
 */
export const subsetMatchOptions: IsActiveMatchOptions = {
  paths: 'subset',
  fragment: 'ignored',
  matrixParams: 'ignored',
  queryParams: 'subset'
};

/**
 * @description
 *
 * A service that provides navigation among views and URL manipulation capabilities.
 *
 * @see `Route`.
 * @see [Routing and Navigation Guide](guide/router).
 *
 * @ngModule RouterModule
 *
 * @publicApi
 */
@Injectable()
export class Router {
  /**
   * Represents the activated `UrlTree` that the `Router` is configured to handle (through
   * `UrlHandlingStrategy`). That is, after we find the route config tree that we're going to
   * activate, run guards, and are just about to activate the route, we set the currentUrlTree.
   *
   * This should match the `browserUrlTree` when a navigation succeeds. If the
   * `UrlHandlingStrategy.shouldProcessUrl` is `false`, only the `browserUrlTree` is updated.
   */
  private currentUrlTree: UrlTree;
  /**
   * Meant to represent the entire browser url after a successful navigation. In the life of a
   * navigation transition:
   * 1. The rawUrl represents the full URL that's being navigated to
   * 2. We apply redirects, which might only apply to _part_ of the URL (due to
   * `UrlHandlingStrategy`).
   * 3. Right before activation (because we assume activation will succeed), we update the
   * rawUrlTree to be a combination of the urlAfterRedirects (again, this might only apply to part
   * of the initial url) and the rawUrl of the transition (which was the original navigation url in
   * its full form).
   */
  private rawUrlTree: UrlTree;
  /**
   * Meant to represent the part of the browser url that the `Router` is set up to handle (via the
   * `UrlHandlingStrategy`). This value is updated immediately after the browser url is updated (or
   * the browser url update is skipped via `skipLocationChange`). With that, note that
   * `browserUrlTree` _may not_ reflect the actual browser URL for two reasons:
   *
   * 1. `UrlHandlingStrategy` only handles part of the URL
   * 2. `skipLocationChange` does not update the browser url.
   *
   * So to reiterate, `browserUrlTree` only represents the Router's internal understanding of the
   * current route, either before guards with `urlUpdateStrategy === 'eager'` or right before
   * activation with `'deferred'`.
   *
   * This should match the `currentUrlTree` when the navigation succeeds.
   */
  private browserUrlTree: UrlTree;
  private readonly transitions: BehaviorSubject<NavigationTransition>;
  private navigations: Observable<NavigationTransition>;
  private lastSuccessfulNavigation: Navigation|null = null;
  private currentNavigation: Navigation|null = null;
  private disposed = false;

  private locationSubscription?: SubscriptionLike;
  private navigationId: number = 0;

  /**
   * The id of the currently active page in the router.
   * Updated to the transition's target id on a successful navigation.
   *
   * This is used to track what page the router last activated. When an attempted navigation fails,
   * the router can then use this to compute how to restore the state back to the previously active
   * page.
   */
  private currentPageId: number = 0;
  /**
   * The ɵrouterPageId of whatever page is currently active in the browser history. This is
   * important for computing the target page id for new navigations because we need to ensure each
   * page id in the browser history is 1 more than the previous entry.
   */
  private get browserPageId(): number|undefined {
    return (this.location.getState() as RestoredState | null)?.ɵrouterPageId;
  }
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
   * Hook that enables you to pause navigation after the preactivation phase.
   * Used by `RouterModule`.
   *
   * @internal
   */
  afterPreactivation: () => Observable<void> = () => of(void 0);

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
   * A strategy for setting the title based on the `routerState`.
   */
  titleStrategy?: TitleStrategy;

  /**
   * How to handle a navigation request to the current URL. One of:
   *
   * - `'ignore'` :  The router ignores the request.
   * - `'reload'` : The router reloads the URL. Use to implement a "refresh" feature.
   *
   * Note that this only configures whether the Route reprocesses the URL and triggers related
   * action and events like redirects, guards, and resolvers. By default, the router re-uses a
   * component instance when it re-navigates to the same component type without visiting a different
   * component first. This behavior is configured by the `RouteReuseStrategy`. In order to reload
   * routed components on same url navigation, you need to set `onSameUrlNavigation` to `'reload'`
   * _and_ provide a `RouteReuseStrategy` which returns `false` for `shouldReuseRoute`.
   */
  onSameUrlNavigation: 'reload'|'ignore' = 'ignore';

  /**
   * How to merge parameters, data, resolved data, and title from parent to child
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
   * By default (`"deferred"`), updates the browser URL after navigation has finished.
   * Set to `'eager'` to update the browser URL at the beginning of navigation.
   * You can choose to update early so that, if navigation fails,
   * you can show an error message with the URL that failed.
   */
  urlUpdateStrategy: 'deferred'|'eager' = 'deferred';

  /**
   * Enables a bug fix that corrects relative link resolution in components with empty paths.
   * @see `RouterModule`
   *
   * @deprecated
   */
  relativeLinkResolution: 'legacy'|'corrected' = 'corrected';

  /**
   * Configures how the Router attempts to restore state when a navigation is cancelled.
   *
   * 'replace' - Always uses `location.replaceState` to set the browser state to the state of the
   * router before the navigation started. This means that if the URL of the browser is updated
   * _before_ the navigation is canceled, the Router will simply replace the item in history rather
   * than trying to restore to the previous location in the session history. This happens most
   * frequently with `urlUpdateStrategy: 'eager'` and navigations with the browser back/forward
   * buttons.
   *
   * 'computed' - Will attempt to return to the same index in the session history that corresponds
   * to the Angular route when the navigation gets cancelled. For example, if the browser back
   * button is clicked and the navigation is cancelled, the Router will trigger a forward navigation
   * and vice versa.
   *
   * Note: the 'computed' option is incompatible with any `UrlHandlingStrategy` which only
   * handles a portion of the URL because the history restoration navigates to the previous place in
   * the browser history rather than simply resetting a portion of the URL.
   *
   * The default value is `replace`.
   *
   */
  canceledNavigationResolution: 'replace'|'computed' = 'replace';

  /**
   * Creates the router service.
   */
  // TODO: vsavkin make internal after the final is out.
  constructor(
      private rootComponentType: Type<any>|null, private urlSerializer: UrlSerializer,
      private rootContexts: ChildrenOutletContexts, private location: Location, injector: Injector,
      compiler: Compiler, public config: Routes) {
    const onLoadStart = (r: Route) => this.triggerEvent(new RouteConfigLoadStart(r));
    const onLoadEnd = (r: Route) => this.triggerEvent(new RouteConfigLoadEnd(r));
    this.configLoader = injector.get(RouterConfigLoader);
    this.configLoader.onLoadEndListener = onLoadEnd;
    this.configLoader.onLoadStartListener = onLoadStart;

    this.ngModule = injector.get(NgModuleRef);
    this.console = injector.get(Console);
    const ngZone = injector.get(NgZone);
    this.isNgZoneEnabled = ngZone instanceof NgZone && NgZone.isInAngularZone();

    this.resetConfig(config);
    this.currentUrlTree = createEmptyUrlTree();
    this.rawUrlTree = this.currentUrlTree;
    this.browserUrlTree = this.currentUrlTree;

    this.routerState = createEmptyState(this.currentUrlTree, this.rootComponentType);

    this.transitions = new BehaviorSubject<NavigationTransition>({
      id: 0,
      targetPageId: 0,
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
               map(t =>
                       ({...t, extractedUrl: this.urlHandlingStrategy.extract(t.rawUrl)} as
                        NavigationTransition)),

               // Using switchMap so we cancel executing navigations when a new one comes in
               switchMap(t => {
                 let completed = false;
                 let errored = false;
                 return of(t).pipe(
                     // Store the Navigation object
                     tap(t => {
                       this.currentNavigation = {
                         id: t.id,
                         initialUrl: t.rawUrl,
                         extractedUrl: t.extractedUrl,
                         trigger: t.source,
                         extras: t.extras,
                         previousNavigation: this.lastSuccessfulNavigation ?
                             {...this.lastSuccessfulNavigation, previousNavigation: null} :
                             null
                       };
                     }),
                     switchMap(t => {
                       const browserUrlTree = this.browserUrlTree.toString();
                       const urlTransition = !this.navigated ||
                           t.extractedUrl.toString() !== browserUrlTree ||
                           // Navigations which succeed or ones which fail and are cleaned up
                           // correctly should result in `browserUrlTree` and `currentUrlTree`
                           // matching. If this is not the case, assume something went wrong and try
                           // processing the URL again.
                           browserUrlTree !== this.currentUrlTree.toString();
                       const processCurrentUrl =
                           (this.onSameUrlNavigation === 'reload' ? true : urlTransition) &&
                           this.urlHandlingStrategy.shouldProcessUrl(t.rawUrl);


                       if (processCurrentUrl) {
                         // If the source of the navigation is from a browser event, the URL is
                         // already updated. We already need to sync the internal state.
                         if (isBrowserTriggeredNavigation(t.source)) {
                           this.browserUrlTree = t.extractedUrl;
                         }
                         return of(t).pipe(
                             // Fire NavigationStart event
                             switchMap(t => {
                               const transition = this.transitions.getValue();
                               eventsSubject.next(new NavigationStart(
                                   t.id, this.serializeUrl(t.extractedUrl), t.source,
                                   t.restoredState));
                               if (transition !== this.transitions.getValue()) {
                                 return EMPTY;
                               }

                               // This delay is required to match old behavior that forced
                               // navigation to always be async
                               return Promise.resolve(t);
                             }),

                             // ApplyRedirects
                             applyRedirects(
                                 this.ngModule.injector, this.configLoader, this.urlSerializer,
                                 this.config),

                             // Update the currentNavigation
                             // `urlAfterRedirects` is guaranteed to be set after this point
                             tap(t => {
                               this.currentNavigation = {
                                 ...this.currentNavigation!,
                                 finalUrl: t.urlAfterRedirects
                               };
                             }),

                             // Recognize
                             recognize(
                                 this.ngModule.injector, this.rootComponentType, this.config,
                                 this.urlSerializer, this.paramsInheritanceStrategy,
                                 this.relativeLinkResolution),

                             // Update URL if in `eager` update mode
                             tap(t => {
                               if (this.urlUpdateStrategy === 'eager') {
                                 if (!t.extras.skipLocationChange) {
                                   const rawUrl = this.urlHandlingStrategy.merge(
                                       t.urlAfterRedirects!, t.rawUrl);
                                   this.setBrowserUrl(rawUrl, t);
                                 }
                                 this.browserUrlTree = t.urlAfterRedirects!;
                               }

                               // Fire RoutesRecognized
                               const routesRecognized = new RoutesRecognized(
                                   t.id, this.serializeUrl(t.extractedUrl),
                                   this.serializeUrl(t.urlAfterRedirects!), t.targetSnapshot!);
                               eventsSubject.next(routesRecognized);
                             }));
                       } else {
                         const processPreviousUrl = urlTransition && this.rawUrlTree &&
                             this.urlHandlingStrategy.shouldProcessUrl(this.rawUrlTree);
                         /* When the current URL shouldn't be processed, but the previous one was,
                          * we handle this "error condition" by navigating to the previously
                          * successful URL, but leaving the URL intact.*/
                         if (processPreviousUrl) {
                           const {id, extractedUrl, source, restoredState, extras} = t;
                           const navStart = new NavigationStart(
                               id, this.serializeUrl(extractedUrl), source, restoredState);
                           eventsSubject.next(navStart);
                           const targetSnapshot =
                               createEmptyState(extractedUrl, this.rootComponentType).snapshot;

                           return of({
                             ...t,
                             targetSnapshot,
                             urlAfterRedirects: extractedUrl,
                             extras: {...extras, skipLocationChange: false, replaceUrl: false},
                           });
                         } else {
                           /* When neither the current or previous URL can be processed, do nothing
                            * other than update router's internal reference to the current "settled"
                            * URL. This way the next navigation will be coming from the current URL
                            * in the browser.
                            */
                           this.rawUrlTree = t.rawUrl;
                           t.resolve(null);
                           return EMPTY;
                         }
                       }
                     }),

                     // --- GUARDS ---
                     tap(t => {
                       const guardsStart = new GuardsCheckStart(
                           t.id, this.serializeUrl(t.extractedUrl),
                           this.serializeUrl(t.urlAfterRedirects!), t.targetSnapshot!);
                       this.triggerEvent(guardsStart);
                     }),

                     map(t => ({
                           ...t,
                           guards: getAllRouteGuards(
                               t.targetSnapshot!, t.currentSnapshot, this.rootContexts)
                         })),

                     checkGuards(this.ngModule.injector, (evt: Event) => this.triggerEvent(evt)),
                     tap(t => {
                       if (isUrlTree(t.guardsResult)) {
                         const error: Error&{url?: UrlTree} = navigationCancelingError(
                             REDIRECTING_CANCELLATION_REASON +
                             `"${this.serializeUrl(t.guardsResult)}"`);
                         error.url = t.guardsResult;
                         throw error;
                       }

                       const guardsEnd = new GuardsCheckEnd(
                           t.id, this.serializeUrl(t.extractedUrl),
                           this.serializeUrl(t.urlAfterRedirects!), t.targetSnapshot!,
                           !!t.guardsResult);
                       this.triggerEvent(guardsEnd);
                     }),

                     filter(t => {
                       if (!t.guardsResult) {
                         this.restoreHistory(t);
                         this.cancelNavigationTransition(
                             t, '', NavigationCancellationCode.GuardRejected);
                         return false;
                       }
                       return true;
                     }),

                     // --- RESOLVE ---
                     switchTap(t => {
                       if (t.guards.canActivateChecks.length) {
                         return of(t).pipe(
                             tap(t => {
                               const resolveStart = new ResolveStart(
                                   t.id, this.serializeUrl(t.extractedUrl),
                                   this.serializeUrl(t.urlAfterRedirects!), t.targetSnapshot!);
                               this.triggerEvent(resolveStart);
                             }),
                             switchMap(t => {
                               let dataResolved = false;
                               return of(t).pipe(
                                   resolveData(
                                       this.paramsInheritanceStrategy, this.ngModule.injector),
                                   tap({
                                     next: () => dataResolved = true,
                                     complete: () => {
                                       if (!dataResolved) {
                                         this.restoreHistory(t);
                                         this.cancelNavigationTransition(
                                             t,
                                             NG_DEV_MODE ?
                                                 `At least one route resolver didn't emit any value.` :
                                                 '',
                                             NavigationCancellationCode.NoDataFromResolver);
                                       }
                                     }
                                   }),
                               );
                             }),
                             tap(t => {
                               const resolveEnd = new ResolveEnd(
                                   t.id, this.serializeUrl(t.extractedUrl),
                                   this.serializeUrl(t.urlAfterRedirects!), t.targetSnapshot!);
                               this.triggerEvent(resolveEnd);
                             }));
                       }
                       return undefined;
                     }),

                     // --- LOAD COMPONENTS ---
                     switchTap((t: NavigationTransition) => {
                       const loadComponents =
                           (route: ActivatedRouteSnapshot): Array<Observable<void>> => {
                             const loaders: Array<Observable<void>> = [];
                             if (route.routeConfig?.loadComponent &&
                                 !route.routeConfig._loadedComponent) {
                               loaders.push(this.configLoader.loadComponent(route.routeConfig)
                                                .pipe(
                                                    tap(loadedComponent => {
                                                      route.component = loadedComponent;
                                                    }),
                                                    map(() => void 0),
                                                    ));
                             }
                             for (const child of route.children) {
                               loaders.push(...loadComponents(child));
                             }
                             return loaders;
                           };
                       return combineLatest(loadComponents(t.targetSnapshot!.root))
                           .pipe(defaultIfEmpty(), take(1));
                     }),

                     switchTap(() => this.afterPreactivation()),

                     map((t: NavigationTransition) => {
                       const targetRouterState = createRouterState(
                           this.routeReuseStrategy, t.targetSnapshot!, t.currentRouterState);
                       return ({...t, targetRouterState});
                     }),

                     /* Once here, we are about to activate synchronously. The assumption is this
                        will succeed, and user code may read from the Router service. Therefore
                        before activation, we need to update router properties storing the current
                        URL and the RouterState, as well as updated the browser URL. All this should
                        happen *before* activating. */
                     tap((t: NavigationTransition) => {
                       this.currentUrlTree = t.urlAfterRedirects!;
                       this.rawUrlTree =
                           this.urlHandlingStrategy.merge(t.urlAfterRedirects!, t.rawUrl);

                       (this as {routerState: RouterState}).routerState = t.targetRouterState!;

                       if (this.urlUpdateStrategy === 'deferred') {
                         if (!t.extras.skipLocationChange) {
                           this.setBrowserUrl(this.rawUrlTree, t);
                         }
                         this.browserUrlTree = t.urlAfterRedirects!;
                       }
                     }),

                     activateRoutes(
                         this.rootContexts, this.routeReuseStrategy,
                         (evt: Event) => this.triggerEvent(evt)),

                     tap({
                       next() {
                         completed = true;
                       },
                       complete() {
                         completed = true;
                       }
                     }),
                     finalize(() => {
                       /* When the navigation stream finishes either through error or success, we
                        * set the `completed` or `errored` flag. However, there are some situations
                        * where we could get here without either of those being set. For instance, a
                        * redirect during NavigationStart. Therefore, this is a catch-all to make
                        * sure the NavigationCancel
                        * event is fired when a navigation gets cancelled but not caught by other
                        * means. */
                       if (!completed && !errored) {
                         const cancelationReason = NG_DEV_MODE ?
                             `Navigation ID ${t.id} is not equal to the current navigation id ${
                                 this.navigationId}` :
                             '';
                         this.cancelNavigationTransition(
                             t, cancelationReason,
                             NavigationCancellationCode.SupersededByNewNavigation);
                       }
                       // Only clear current navigation if it is still set to the one that
                       // finalized.
                       if (this.currentNavigation?.id === t.id) {
                         this.currentNavigation = null;
                       }
                     }),
                     catchError((e) => {
                       // TODO(atscott): The NavigationTransition `t` used here does not accurately
                       // reflect the current state of the whole transition because some operations
                       // return a new object rather than modifying the one in the outermost
                       // `switchMap`.
                       //  The fix can likely be to:
                       //  1. Rename the outer `t` variable so it's not shadowed all the time and
                       //  confusing
                       //  2. Keep reassigning to the outer variable after each stage to ensure it
                       //  gets updated. Or change the implementations to not return a copy.
                       // Not changed yet because it affects existing code and would need to be
                       // tested more thoroughly.
                       errored = true;
                       /* This error type is issued during Redirect, and is handled as a
                        * cancellation rather than an error. */
                       if (isNavigationCancelingError(e)) {
                         const redirecting = isUrlTree(e.url);
                         if (!redirecting) {
                           // Set property only if we're not redirecting. If we landed on a page and
                           // redirect to `/` route, the new navigation is going to see the `/`
                           // isn't a change from the default currentUrlTree and won't navigate.
                           // This is only applicable with initial navigation, so setting
                           // `navigated` only when not redirecting resolves this scenario.
                           this.navigated = true;
                           this.restoreHistory(t, true);
                         }
                         const navCancel = new NavigationCancel(
                             t.id, this.serializeUrl(t.extractedUrl), e.message,
                             NavigationCancellationCode.Redirect);
                         eventsSubject.next(navCancel);

                         // When redirecting, we need to delay resolving the navigation
                         // promise and push it to the redirect navigation
                         if (!redirecting) {
                           t.resolve(false);
                         } else {
                           const mergedTree =
                               this.urlHandlingStrategy.merge(e.url, this.rawUrlTree);
                           const extras = {
                             skipLocationChange: t.extras.skipLocationChange,
                             // The URL is already updated at this point if we have 'eager' URL
                             // updates or if the navigation was triggered by the browser (back
                             // button, URL bar, etc). We want to replace that item in history if
                             // the navigation is rejected.
                             replaceUrl: this.urlUpdateStrategy === 'eager' ||
                                 isBrowserTriggeredNavigation(t.source)
                           };

                           this.scheduleNavigation(
                               mergedTree, 'imperative', null, extras,
                               {resolve: t.resolve, reject: t.reject, promise: t.promise});
                         }

                         /* All other errors should reset to the router's internal URL reference to
                          * the pre-error state. */
                       } else {
                         this.restoreHistory(t, true);
                         const navError = new NavigationError(
                             t.id, this.serializeUrl(t.extractedUrl), e,
                             t.targetSnapshot ?? undefined);
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

  private setTransition(t: Partial<NavigationTransition>): void {
    this.transitions.next({...this.transitions.value, ...t});
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
   * Sets up the location change listener. This listener detects navigations triggered from outside
   * the Router (the browser back/forward buttons, for example) and schedules a corresponding Router
   * navigation so that the correct events, guards, etc. are triggered.
   */
  setUpLocationChangeListener(): void {
    // Don't need to use Zone.wrap any more, because zone.js
    // already patch onPopState, so location change callback will
    // run into ngZone
    if (!this.locationSubscription) {
      this.locationSubscription = this.location.subscribe(event => {
        const source = event['type'] === 'popstate' ? 'popstate' : 'hashchange';
        if (source === 'popstate') {
          // The `setTimeout` was added in #12160 and is likely to support Angular/AngularJS
          // hybrid apps.
          setTimeout(() => {
            const extras: NavigationExtras = {replaceUrl: true};
            // Navigations coming from Angular router have a navigationId state
            // property. When this exists, restore the state.
            const state = event.state?.navigationId ? event.state : null;
            if (state) {
              const stateCopy = {...state} as Partial<RestoredState>;
              delete stateCopy.navigationId;
              delete stateCopy.ɵrouterPageId;
              if (Object.keys(stateCopy).length !== 0) {
                extras.state = stateCopy;
              }
            }
            const urlTree = this.parseUrl(event['url']!);
            this.scheduleNavigation(urlTree, source, state, extras);
          }, 0);
        }
      });
    }
  }

  /** The current URL. */
  get url(): string {
    return this.serializeUrl(this.currentUrlTree);
  }

  /**
   * Returns the current `Navigation` object when the router is navigating,
   * and `null` when idle.
   */
  getCurrentNavigation(): Navigation|null {
    return this.currentNavigation;
  }

  /** @internal */
  triggerEvent(event: Event): void {
    (this.events as Subject<Event>).next(event);
  }

  /**
   * Resets the route configuration used for navigation and generating links.
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
    NG_DEV_MODE && validateConfig(config);
    this.config = config.map(standardizeConfig);
    this.navigated = false;
    this.lastSuccessfulId = -1;
  }

  /** @nodoc */
  ngOnDestroy(): void {
    this.dispose();
  }

  /** Disposes of the router. */
  dispose(): void {
    this.transitions.complete();
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
      this.locationSubscription = undefined;
    }
    this.disposed = true;
  }

  /**
   * Appends URL segments to the current URL tree to create a new URL tree.
   *
   * @param commands An array of URL fragments with which to construct the new URL tree.
   * If the path is static, can be the literal URL string. For a dynamic path, pass an array of path
   * segments, followed by the parameters for each segment.
   * The fragments are applied to the current URL tree or the one provided  in the `relativeTo`
   * property of the options object, if supplied.
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
   *
   * Note that a value of `null` or `undefined` for `relativeTo` indicates that the
   * tree should be created relative to the root.
   * ```
   */
  createUrlTree(commands: any[], navigationExtras: UrlCreationOptions = {}): UrlTree {
    const {relativeTo, queryParams, fragment, queryParamsHandling, preserveFragment} =
        navigationExtras;
    const a = relativeTo || this.routerState.root;
    const f = preserveFragment ? this.currentUrlTree.fragment : fragment;
    let q: Params|null = null;
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
    if (q !== null) {
      q = this.removeEmptyProps(q);
    }
    return createUrlTree(a, this.currentUrlTree, commands, q, f ?? null);
  }

  /**
   * Navigates to a view using an absolute route path.
   *
   * @param url An absolute path for a defined route. The function does not apply any delta to the
   *     current URL.
   * @param extras An object containing properties that modify the navigation strategy.
   *
   * @returns A Promise that resolves to 'true' when navigation succeeds,
   * to 'false' when navigation fails, or is rejected on error.
   *
   * @usageNotes
   *
   * The following calls request navigation to an absolute path.
   *
   * ```
   * router.navigateByUrl("/team/33/user/11");
   *
   * // Navigate without updating the URL
   * router.navigateByUrl("/team/33/user/11", { skipLocationChange: true });
   * ```
   *
   * @see [Routing and Navigation guide](guide/router)
   *
   */
  navigateByUrl(url: string|UrlTree, extras: NavigationBehaviorOptions = {
    skipLocationChange: false
  }): Promise<boolean> {
    if (typeof ngDevMode === 'undefined' ||
        ngDevMode && this.isNgZoneEnabled && !NgZone.isInAngularZone()) {
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
   * @param commands An array of URL fragments with which to construct the target URL.
   * If the path is static, can be the literal URL string. For a dynamic path, pass an array of path
   * segments, followed by the parameters for each segment.
   * The fragments are applied to the current URL or the one provided  in the `relativeTo` property
   * of the options object, if supplied.
   * @param extras An options object that determines how the URL should be constructed or
   *     interpreted.
   *
   * @returns A Promise that resolves to `true` when navigation succeeds, to `false` when navigation
   *     fails,
   * or is rejected on error.
   *
   * @usageNotes
   *
   * The following calls request navigation to a dynamic route path relative to the current URL.
   *
   * ```
   * router.navigate(['team', 33, 'user', 11], {relativeTo: route});
   *
   * // Navigate without updating the URL, overriding the default behavior
   * router.navigate(['team', 33, 'user', 11], {relativeTo: route, skipLocationChange: true});
   * ```
   *
   * @see [Routing and Navigation guide](guide/router)
   *
   */
  navigate(commands: any[], extras: NavigationExtras = {skipLocationChange: false}):
      Promise<boolean> {
    validateCommands(commands);
    return this.navigateByUrl(this.createUrlTree(commands, extras), extras);
  }

  /** Serializes a `UrlTree` into a string */
  serializeUrl(url: UrlTree): string {
    return this.urlSerializer.serialize(url);
  }

  /** Parses a string into a `UrlTree` */
  parseUrl(url: string): UrlTree {
    let urlTree: UrlTree;
    try {
      urlTree = this.urlSerializer.parse(url);
    } catch (e) {
      urlTree = this.malformedUriErrorHandler(e as URIError, this.urlSerializer, url);
    }
    return urlTree;
  }

  /**
   * Returns whether the url is activated.
   *
   * @deprecated
   * Use `IsActiveMatchOptions` instead.
   *
   * - The equivalent `IsActiveMatchOptions` for `true` is
   * `{paths: 'exact', queryParams: 'exact', fragment: 'ignored', matrixParams: 'ignored'}`.
   * - The equivalent for `false` is
   * `{paths: 'subset', queryParams: 'subset', fragment: 'ignored', matrixParams: 'ignored'}`.
   */
  isActive(url: string|UrlTree, exact: boolean): boolean;
  /**
   * Returns whether the url is activated.
   */
  isActive(url: string|UrlTree, matchOptions: IsActiveMatchOptions): boolean;
  /** @internal */
  isActive(url: string|UrlTree, matchOptions: boolean|IsActiveMatchOptions): boolean;
  isActive(url: string|UrlTree, matchOptions: boolean|IsActiveMatchOptions): boolean {
    let options: IsActiveMatchOptions;
    if (matchOptions === true) {
      options = {...exactMatchOptions};
    } else if (matchOptions === false) {
      options = {...subsetMatchOptions};
    } else {
      options = matchOptions;
    }
    if (isUrlTree(url)) {
      return containsTree(this.currentUrlTree, url, options);
    }

    const urlTree = this.parseUrl(url);
    return containsTree(this.currentUrlTree, urlTree, options);
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
          this.currentPageId = t.targetPageId;
          (this.events as Subject<Event>)
              .next(new NavigationEnd(
                  t.id, this.serializeUrl(t.extractedUrl), this.serializeUrl(this.currentUrlTree)));
          this.lastSuccessfulNavigation = this.currentNavigation;
          this.titleStrategy?.updateTitle(this.routerState.snapshot);
          t.resolve(true);
        },
        e => {
          this.console.warn(`Unhandled Navigation Error: ${e}`);
        });
  }

  private scheduleNavigation(
      rawUrl: UrlTree, source: NavigationTrigger, restoredState: RestoredState|null,
      extras: NavigationExtras,
      priorPromise?: {resolve: any, reject: any, promise: Promise<boolean>}): Promise<boolean> {
    if (this.disposed) {
      return Promise.resolve(false);
    }

    let resolve: any;
    let reject: any;
    let promise: Promise<boolean>;
    if (priorPromise) {
      resolve = priorPromise.resolve;
      reject = priorPromise.reject;
      promise = priorPromise.promise;

    } else {
      promise = new Promise<boolean>((res, rej) => {
        resolve = res;
        reject = rej;
      });
    }

    const id = ++this.navigationId;
    let targetPageId: number;
    if (this.canceledNavigationResolution === 'computed') {
      const isInitialPage = this.currentPageId === 0;
      if (isInitialPage) {
        restoredState = this.location.getState() as RestoredState | null;
      }
      // If the `ɵrouterPageId` exist in the state then `targetpageId` should have the value of
      // `ɵrouterPageId`. This is the case for something like a page refresh where we assign the
      // target id to the previously set value for that page.
      if (restoredState && restoredState.ɵrouterPageId) {
        targetPageId = restoredState.ɵrouterPageId;
      } else {
        // If we're replacing the URL or doing a silent navigation, we do not want to increment the
        // page id because we aren't pushing a new entry to history.
        if (extras.replaceUrl || extras.skipLocationChange) {
          targetPageId = this.browserPageId ?? 0;
        } else {
          targetPageId = (this.browserPageId ?? 0) + 1;
        }
      }
    } else {
      // This is unused when `canceledNavigationResolution` is not computed.
      targetPageId = 0;
    }

    this.setTransition({
      id,
      targetPageId,
      source,
      restoredState,
      currentUrlTree: this.currentUrlTree,
      currentRawUrl: this.rawUrlTree,
      rawUrl,
      extras,
      resolve,
      reject,
      promise,
      currentSnapshot: this.routerState.snapshot,
      currentRouterState: this.routerState
    });

    // Make sure that the error is propagated even though `processNavigations` catch
    // handler does not rethrow
    return promise.catch((e: any) => {
      return Promise.reject(e);
    });
  }

  private setBrowserUrl(url: UrlTree, t: NavigationTransition) {
    const path = this.urlSerializer.serialize(url);
    const state = {...t.extras.state, ...this.generateNgRouterState(t.id, t.targetPageId)};
    if (this.location.isCurrentPathEqualTo(path) || !!t.extras.replaceUrl) {
      this.location.replaceState(path, '', state);
    } else {
      this.location.go(path, '', state);
    }
  }

  /**
   * Performs the necessary rollback action to restore the browser URL to the
   * state before the transition.
   */
  private restoreHistory(t: NavigationTransition, restoringFromCaughtError = false) {
    if (this.canceledNavigationResolution === 'computed') {
      const targetPagePosition = this.currentPageId - t.targetPageId;
      // The navigator change the location before triggered the browser event,
      // so we need to go back to the current url if the navigation is canceled.
      // Also, when navigation gets cancelled while using url update strategy eager, then we need to
      // go back. Because, when `urlUpdateStrategy` is `eager`; `setBrowserUrl` method is called
      // before any verification.
      const browserUrlUpdateOccurred =
          (t.source === 'popstate' || this.urlUpdateStrategy === 'eager' ||
           this.currentUrlTree === this.currentNavigation?.finalUrl);
      if (browserUrlUpdateOccurred && targetPagePosition !== 0) {
        this.location.historyGo(targetPagePosition);
      } else if (
          this.currentUrlTree === this.currentNavigation?.finalUrl && targetPagePosition === 0) {
        // We got to the activation stage (where currentUrlTree is set to the navigation's
        // finalUrl), but we weren't moving anywhere in history (skipLocationChange or replaceUrl).
        // We still need to reset the router state back to what it was when the navigation started.
        this.resetState(t);
        // TODO(atscott): resetting the `browserUrlTree` should really be done in `resetState`.
        // Investigate if this can be done by running TGP.
        this.browserUrlTree = t.currentUrlTree;
        this.resetUrlToCurrentUrlTree();
      } else {
        // The browser URL and router state was not updated before the navigation cancelled so
        // there's no restoration needed.
      }
    } else if (this.canceledNavigationResolution === 'replace') {
      // TODO(atscott): It seems like we should _always_ reset the state here. It would be a no-op
      // for `deferred` navigations that haven't change the internal state yet because guards
      // reject. For 'eager' navigations, it seems like we also really should reset the state
      // because the navigation was cancelled. Investigate if this can be done by running TGP.
      if (restoringFromCaughtError) {
        this.resetState(t);
      }
      this.resetUrlToCurrentUrlTree();
    }
  }

  private resetState(t: NavigationTransition): void {
    (this as {routerState: RouterState}).routerState = t.currentRouterState;
    this.currentUrlTree = t.currentUrlTree;
    // Note here that we use the urlHandlingStrategy to get the reset `rawUrlTree` because it may be
    // configured to handle only part of the navigation URL. This means we would only want to reset
    // the part of the navigation handled by the Angular router rather than the whole URL. In
    // addition, the URLHandlingStrategy may be configured to specifically preserve parts of the URL
    // when merging, such as the query params so they are not lost on a refresh.
    this.rawUrlTree = this.urlHandlingStrategy.merge(this.currentUrlTree, t.rawUrl);
  }

  private resetUrlToCurrentUrlTree(): void {
    this.location.replaceState(
        this.urlSerializer.serialize(this.rawUrlTree), '',
        this.generateNgRouterState(this.lastSuccessfulId, this.currentPageId));
  }

  private cancelNavigationTransition(
      t: NavigationTransition, reason: string, code: NavigationCancellationCode) {
    const navCancel = new NavigationCancel(t.id, this.serializeUrl(t.extractedUrl), reason, code);
    this.triggerEvent(navCancel);
    t.resolve(false);
  }

  private generateNgRouterState(navigationId: number, routerPageId?: number) {
    if (this.canceledNavigationResolution === 'computed') {
      return {navigationId, ɵrouterPageId: routerPageId};
    }
    return {navigationId};
  }
}

function validateCommands(commands: string[]): void {
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    if (cmd == null) {
      throw new RuntimeError(
          RuntimeErrorCode.NULLISH_COMMAND,
          NG_DEV_MODE && `The requested path contains ${cmd} segment at index ${i}`);
    }
  }
}

function isBrowserTriggeredNavigation(source: 'imperative'|'popstate'|'hashchange') {
  return source !== 'imperative';
}
