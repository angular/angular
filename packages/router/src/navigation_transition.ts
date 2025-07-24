/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location} from '@angular/common';
import {
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injectable,
  InjectionToken,
  runInInjectionContext,
  Type,
} from '@angular/core';
import {BehaviorSubject, combineLatest, EMPTY, from, Observable, of, Subject} from 'rxjs';
import {
  catchError,
  defaultIfEmpty,
  filter,
  finalize,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import {createRouterState} from './create_router_state';
import {INPUT_BINDER} from './directives/router_outlet';
import {
  BeforeActivateRoutes,
  Event,
  GuardsCheckEnd,
  GuardsCheckStart,
  IMPERATIVE_NAVIGATION,
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationSkippedCode,
  NavigationStart,
  NavigationTrigger,
  RedirectRequest,
  ResolveEnd,
  ResolveStart,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  RoutesRecognized,
} from './events';
import {
  GuardResult,
  NavigationBehaviorOptions,
  QueryParamsHandling,
  RedirectCommand,
  Route,
  Routes,
} from './models';
import {
  isNavigationCancelingError,
  isRedirectingNavigationCancelingError,
  redirectingNavigationError,
} from './navigation_canceling_error';
import {activateRoutes} from './operators/activate_routes';
import {checkGuards} from './operators/check_guards';
import {recognize} from './operators/recognize';
import {resolveData} from './operators/resolve_data';
import {switchTap} from './operators/switch_tap';
import {TitleStrategy} from './page_title_strategy';
import {RouteReuseStrategy} from './route_reuse_strategy';
import {ROUTER_CONFIGURATION} from './router_config';
import {RouterConfigLoader} from './router_config_loader';
import {ChildrenOutletContexts} from './router_outlet_context';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  createEmptyState,
  RouterState,
  RouterStateSnapshot,
} from './router_state';
import type {Params} from './shared';
import {UrlHandlingStrategy} from './url_handling_strategy';
import {isUrlTree, UrlSerializer, UrlTree} from './url_tree';
import {Checks, getAllRouteGuards} from './utils/preactivation';
import {CREATE_VIEW_TRANSITION} from './utils/view_transition';
import {getClosestRouteInjector} from './utils/config';

/**
 * @description
 *
 * Options that modify the `Router` URL.
 * Supply an object containing any of these properties to a `Router` navigation function to
 * control how the target URL should be constructed.
 *
 * @see {@link Router#navigate}
 * @see {@link Router#createUrlTree}
 * @see [Routing and Navigation guide](guide/routing/common-router-tasks)
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
   * ```ts
   *  @Component({...})
   *  class ChildComponent {
   *    constructor(private router: Router, private route: ActivatedRoute) {}
   *
   *    go() {
   *      router.navigate(['../list'], { relativeTo: this.route });
   *    }
   *  }
   * ```
   *
   * A value of `null` or `undefined` indicates that the navigation commands should be applied
   * relative to the root.
   */
  relativeTo?: ActivatedRoute | null;

  /**
   * Sets query parameters to the URL.
   *
   * ```
   * // Navigate to /results?page=1
   * router.navigate(['/results'], { queryParams: { page: 1 } });
   * ```
   */
  queryParams?: Params | null;

  /**
   * Sets the hash fragment for the URL.
   *
   * ```
   * // Navigate to /results#top
   * router.navigate(['/results'], { fragment: 'top' });
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
   * router.navigate(['/view2'], { queryParams: { page: 2 },  queryParamsHandling: "preserve"
   * });
   * ```
   * The "merge" option appends new query params to the params from the current URL:
   * ```
   * // from /view1?page=1 to/view2?page=1&otherKey=2
   * router.navigate(['/view2'], { queryParams: { otherKey: 2 },  queryParamsHandling: "merge"
   * });
   * ```
   * In case of a key collision between current parameters and those in the `queryParams` object,
   * the new value is used.
   *
   */
  queryParamsHandling?: QueryParamsHandling | null;

  /**
   * When true, preserves the URL fragment for the next navigation
   *
   * ```
   * // Preserve fragment from /results#top to /view#top
   * router.navigate(['/view'], { preserveFragment: true });
   * ```
   */
  preserveFragment?: boolean;
}

/**
 * @description
 *
 * Options that modify the `Router` navigation strategy.
 * Supply an object containing any of these properties to a `Router` navigation function to
 * control how the target URL should be constructed or interpreted.
 *
 * @see {@link Router#navigate}
 * @see {@link Router#navigateByUrl}
 * @see {@link Router#createurltree}
 * @see [Routing and Navigation guide](guide/routing/common-router-tasks)
 * @see {@link UrlCreationOptions}
 * @see {@link NavigationBehaviorOptions}
 *
 * @publicApi
 */
export interface NavigationExtras extends UrlCreationOptions, NavigationBehaviorOptions {}

export type RestoredState = {
  [k: string]: any;
  // TODO(#27607): Remove `navigationId` and `ɵrouterPageId` and move to `ng` or `ɵ` namespace.
  navigationId: number;
  // The `ɵ` prefix is there to reduce the chance of colliding with any existing user properties on
  // the history state.
  ɵrouterPageId?: number;
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
   * The initial target URL after being parsed with `UrlHandlingStrategy.extract()`.
   */
  extractedUrl: UrlTree;
  /**
   * The extracted URL after redirects have been applied.
   * This URL may not be available immediately, therefore this property can be `undefined`.
   * It is guaranteed to be set after the `RoutesRecognized` event fires.
   */
  finalUrl?: UrlTree;
  /**
   * `UrlTree` to use when updating the browser URL for the navigation when `extras.browserUrl` is
   * defined.
   * @internal
   */
  readonly targetBrowserUrl?: UrlTree | string;
  /**
   * TODO(atscott): If we want to make StateManager public, they will need access to this. Note that
   * it's already eventually exposed through router.routerState.
   * @internal
   */
  targetRouterState?: RouterState;
  /**
   * Identifies how this navigation was triggered.
   */
  trigger: NavigationTrigger;
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

  /**
   * Aborts the navigation if it has not yet been completed or reached the point where routes are being activated.
   * This function is a no-op if the navigation is beyond the point where it can be aborted.
   */
  readonly abort: () => void;
}

export interface NavigationTransition {
  id: number;
  currentUrlTree: UrlTree;
  extractedUrl: UrlTree;
  currentRawUrl: UrlTree;
  urlAfterRedirects?: UrlTree;
  rawUrl: UrlTree;
  extras: NavigationExtras;
  resolve: (value: boolean | PromiseLike<boolean>) => void;
  reject: (reason?: any) => void;
  promise: Promise<boolean>;
  source: NavigationTrigger;
  restoredState: RestoredState | null;
  currentSnapshot: RouterStateSnapshot;
  targetSnapshot: RouterStateSnapshot | null;
  currentRouterState: RouterState;
  targetRouterState: RouterState | null;
  guards: Checks;
  guardsResult: GuardResult | null;
  abortController: AbortController;
}

/**
 * The interface from the Router needed by the transitions. Used to avoid a circular dependency on
 * Router. This interface should be whittled down with future refactors. For example, we do not need
 * to get `UrlSerializer` from the Router. We can instead inject it in `NavigationTransitions`
 * directly.
 */
interface InternalRouterInterface {
  config: Routes;
  navigated: boolean;
  routeReuseStrategy: RouteReuseStrategy;
  onSameUrlNavigation: 'reload' | 'ignore';
}

export const NAVIGATION_ERROR_HANDLER = new InjectionToken<
  (error: NavigationError) => unknown | RedirectCommand
>(typeof ngDevMode === 'undefined' || ngDevMode ? 'navigation error handler' : '');

@Injectable({providedIn: 'root'})
export class NavigationTransitions {
  currentNavigation: Navigation | null = null;
  currentTransition: NavigationTransition | null = null;
  lastSuccessfulNavigation: Navigation | null = null;
  /**
   * These events are used to communicate back to the Router about the state of the transition. The
   * Router wants to respond to these events in various ways. Because the `NavigationTransition`
   * class is not public, this event subject is not publicly exposed.
   */
  readonly events = new Subject<Event | BeforeActivateRoutes | RedirectRequest>();
  /**
   * Used to abort the current transition with an error.
   */
  readonly transitionAbortWithErrorSubject = new Subject<Error>();
  private readonly configLoader = inject(RouterConfigLoader);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly urlSerializer = inject(UrlSerializer);
  private readonly rootContexts = inject(ChildrenOutletContexts);
  private readonly location = inject(Location);
  private readonly inputBindingEnabled = inject(INPUT_BINDER, {optional: true}) !== null;
  private readonly titleStrategy?: TitleStrategy = inject(TitleStrategy);
  private readonly options = inject(ROUTER_CONFIGURATION, {optional: true}) || {};
  private readonly paramsInheritanceStrategy =
    this.options.paramsInheritanceStrategy || 'emptyOnly';
  private readonly urlHandlingStrategy = inject(UrlHandlingStrategy);
  private readonly createViewTransition = inject(CREATE_VIEW_TRANSITION, {optional: true});
  private readonly navigationErrorHandler = inject(NAVIGATION_ERROR_HANDLER, {optional: true});

  navigationId = 0;
  get hasRequestedNavigation() {
    return this.navigationId !== 0;
  }
  private transitions?: BehaviorSubject<NavigationTransition | null>;
  /**
   * Hook that enables you to pause navigation after the preactivation phase.
   * Used by `RouterModule`.
   *
   * @internal
   */
  afterPreactivation: () => Observable<void> = () => of(void 0);
  /** @internal */
  rootComponentType: Type<any> | null = null;

  private destroyed = false;

  constructor() {
    const onLoadStart = (r: Route) => this.events.next(new RouteConfigLoadStart(r));
    const onLoadEnd = (r: Route) => this.events.next(new RouteConfigLoadEnd(r));
    this.configLoader.onLoadEndListener = onLoadEnd;
    this.configLoader.onLoadStartListener = onLoadStart;
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
    });
  }

  complete() {
    this.transitions?.complete();
  }

  handleNavigationRequest(
    request: Pick<
      NavigationTransition,
      | 'source'
      | 'restoredState'
      | 'currentUrlTree'
      | 'currentRawUrl'
      | 'rawUrl'
      | 'extras'
      | 'resolve'
      | 'reject'
      | 'promise'
      | 'currentSnapshot'
      | 'currentRouterState'
    >,
  ) {
    const id = ++this.navigationId;
    this.transitions?.next({
      ...request,
      extractedUrl: this.urlHandlingStrategy.extract(request.rawUrl),
      targetSnapshot: null,
      targetRouterState: null,
      guards: {canActivateChecks: [], canDeactivateChecks: []},
      guardsResult: null,
      abortController: new AbortController(),
      id,
    });
  }

  setupNavigations(router: InternalRouterInterface): Observable<NavigationTransition> {
    this.transitions = new BehaviorSubject<NavigationTransition | null>(null);
    return this.transitions.pipe(
      filter((t): t is NavigationTransition => t !== null),

      // Using switchMap so we cancel executing navigations when a new one comes in
      switchMap((overallTransitionState) => {
        let completedOrAborted = false;
        return of(overallTransitionState).pipe(
          switchMap((t) => {
            // It is possible that `switchMap` fails to cancel previous navigations if a new one happens synchronously while the operator
            // is processing the `next` notification of that previous navigation. This can happen when a new navigation (say 2) cancels a
            // previous one (1) and yet another navigation (3) happens synchronously in response to the `NavigationCancel` event for (1).
            // https://github.com/ReactiveX/rxjs/issues/7455
            if (this.navigationId > overallTransitionState.id) {
              const cancellationReason =
                typeof ngDevMode === 'undefined' || ngDevMode
                  ? `Navigation ID ${overallTransitionState.id} is not equal to the current navigation id ${this.navigationId}`
                  : '';
              this.cancelNavigationTransition(
                overallTransitionState,
                cancellationReason,
                NavigationCancellationCode.SupersededByNewNavigation,
              );
              return EMPTY;
            }
            this.currentTransition = overallTransitionState;
            // Store the Navigation object
            this.currentNavigation = {
              id: t.id,
              initialUrl: t.rawUrl,
              extractedUrl: t.extractedUrl,
              targetBrowserUrl:
                typeof t.extras.browserUrl === 'string'
                  ? this.urlSerializer.parse(t.extras.browserUrl)
                  : t.extras.browserUrl,
              trigger: t.source,
              extras: t.extras,
              previousNavigation: !this.lastSuccessfulNavigation
                ? null
                : {
                    ...this.lastSuccessfulNavigation,
                    previousNavigation: null,
                  },
              abort: () => t.abortController.abort(),
            };
            const urlTransition =
              !router.navigated || this.isUpdatingInternalState() || this.isUpdatedBrowserUrl();

            const onSameUrlNavigation = t.extras.onSameUrlNavigation ?? router.onSameUrlNavigation;
            if (!urlTransition && onSameUrlNavigation !== 'reload') {
              const reason =
                typeof ngDevMode === 'undefined' || ngDevMode
                  ? `Navigation to ${t.rawUrl} was ignored because it is the same as the current Router URL.`
                  : '';
              this.events.next(
                new NavigationSkipped(
                  t.id,
                  this.urlSerializer.serialize(t.rawUrl),
                  reason,
                  NavigationSkippedCode.IgnoredSameUrlNavigation,
                ),
              );
              t.resolve(false);
              return EMPTY;
            }

            if (this.urlHandlingStrategy.shouldProcessUrl(t.rawUrl)) {
              return of(t).pipe(
                // Fire NavigationStart event
                switchMap((t) => {
                  this.events.next(
                    new NavigationStart(
                      t.id,
                      this.urlSerializer.serialize(t.extractedUrl),
                      t.source,
                      t.restoredState,
                    ),
                  );
                  if (t.id !== this.navigationId) {
                    return EMPTY;
                  }

                  // This delay is required to match old behavior that forced
                  // navigation to always be async
                  return Promise.resolve(t);
                }),

                // Recognize
                recognize(
                  this.environmentInjector,
                  this.configLoader,
                  this.rootComponentType,
                  router.config,
                  this.urlSerializer,
                  this.paramsInheritanceStrategy,
                ),

                // Update URL if in `eager` update mode
                tap((t) => {
                  overallTransitionState.targetSnapshot = t.targetSnapshot;
                  overallTransitionState.urlAfterRedirects = t.urlAfterRedirects;
                  this.currentNavigation = {
                    ...this.currentNavigation!,
                    finalUrl: t.urlAfterRedirects,
                  };

                  // Fire RoutesRecognized
                  const routesRecognized = new RoutesRecognized(
                    t.id,
                    this.urlSerializer.serialize(t.extractedUrl),
                    this.urlSerializer.serialize(t.urlAfterRedirects!),
                    t.targetSnapshot!,
                  );
                  this.events.next(routesRecognized);
                }),
              );
            } else if (
              urlTransition &&
              this.urlHandlingStrategy.shouldProcessUrl(t.currentRawUrl)
            ) {
              /* When the current URL shouldn't be processed, but the previous one
               * was, we handle this "error condition" by navigating to the
               * previously successful URL, but leaving the URL intact.*/
              const {id, extractedUrl, source, restoredState, extras} = t;
              const navStart = new NavigationStart(
                id,
                this.urlSerializer.serialize(extractedUrl),
                source,
                restoredState,
              );
              this.events.next(navStart);
              const targetSnapshot = createEmptyState(this.rootComponentType).snapshot;

              this.currentTransition = overallTransitionState = {
                ...t,
                targetSnapshot,
                urlAfterRedirects: extractedUrl,
                extras: {...extras, skipLocationChange: false, replaceUrl: false},
              };
              this.currentNavigation!.finalUrl = extractedUrl;
              return of(overallTransitionState);
            } else {
              /* When neither the current or previous URL can be processed, do
               * nothing other than update router's internal reference to the
               * current "settled" URL. This way the next navigation will be coming
               * from the current URL in the browser.
               */
              const reason =
                typeof ngDevMode === 'undefined' || ngDevMode
                  ? `Navigation was ignored because the UrlHandlingStrategy` +
                    ` indicated neither the current URL ${t.currentRawUrl} nor target URL ${t.rawUrl} should be processed.`
                  : '';
              this.events.next(
                new NavigationSkipped(
                  t.id,
                  this.urlSerializer.serialize(t.extractedUrl),
                  reason,
                  NavigationSkippedCode.IgnoredByUrlHandlingStrategy,
                ),
              );
              t.resolve(false);
              return EMPTY;
            }
          }),

          // --- GUARDS ---
          tap((t) => {
            const guardsStart = new GuardsCheckStart(
              t.id,
              this.urlSerializer.serialize(t.extractedUrl),
              this.urlSerializer.serialize(t.urlAfterRedirects!),
              t.targetSnapshot!,
            );
            this.events.next(guardsStart);
          }),

          map((t) => {
            this.currentTransition = overallTransitionState = {
              ...t,
              guards: getAllRouteGuards(t.targetSnapshot!, t.currentSnapshot, this.rootContexts),
            };
            return overallTransitionState;
          }),

          checkGuards(this.environmentInjector, (evt: Event) => this.events.next(evt)),
          tap((t) => {
            overallTransitionState.guardsResult = t.guardsResult;
            if (t.guardsResult && typeof t.guardsResult !== 'boolean') {
              throw redirectingNavigationError(this.urlSerializer, t.guardsResult);
            }

            const guardsEnd = new GuardsCheckEnd(
              t.id,
              this.urlSerializer.serialize(t.extractedUrl),
              this.urlSerializer.serialize(t.urlAfterRedirects!),
              t.targetSnapshot!,
              !!t.guardsResult,
            );
            this.events.next(guardsEnd);
          }),

          filter((t) => {
            if (!t.guardsResult) {
              this.cancelNavigationTransition(t, '', NavigationCancellationCode.GuardRejected);
              return false;
            }
            return true;
          }),

          // --- RESOLVE ---
          switchTap((t) => {
            if (t.guards.canActivateChecks.length === 0) {
              return undefined;
            }

            return of(t).pipe(
              tap((t) => {
                const resolveStart = new ResolveStart(
                  t.id,
                  this.urlSerializer.serialize(t.extractedUrl),
                  this.urlSerializer.serialize(t.urlAfterRedirects!),
                  t.targetSnapshot!,
                );
                this.events.next(resolveStart);
              }),
              switchMap((t) => {
                let dataResolved = false;
                return of(t).pipe(
                  resolveData(this.paramsInheritanceStrategy, this.environmentInjector),
                  tap({
                    next: () => (dataResolved = true),
                    complete: () => {
                      if (!dataResolved) {
                        this.cancelNavigationTransition(
                          t,
                          typeof ngDevMode === 'undefined' || ngDevMode
                            ? `At least one route resolver didn't emit any value.`
                            : '',
                          NavigationCancellationCode.NoDataFromResolver,
                        );
                      }
                    },
                  }),
                );
              }),
              tap((t) => {
                const resolveEnd = new ResolveEnd(
                  t.id,
                  this.urlSerializer.serialize(t.extractedUrl),
                  this.urlSerializer.serialize(t.urlAfterRedirects!),
                  t.targetSnapshot!,
                );
                this.events.next(resolveEnd);
              }),
            );
          }),

          // --- LOAD COMPONENTS ---
          switchTap((t: NavigationTransition) => {
            const loadComponents = (route: ActivatedRouteSnapshot): Array<Observable<void>> => {
              const loaders: Array<Observable<void>> = [];
              if (route.routeConfig?.loadComponent) {
                const injector = getClosestRouteInjector(route) ?? this.environmentInjector;
                loaders.push(
                  this.configLoader.loadComponent(injector, route.routeConfig).pipe(
                    tap((loadedComponent) => {
                      route.component = loadedComponent;
                    }),
                    map(() => void 0),
                  ),
                );
              }
              for (const child of route.children) {
                loaders.push(...loadComponents(child));
              }
              return loaders;
            };
            return combineLatest(loadComponents(t.targetSnapshot!.root)).pipe(
              defaultIfEmpty(null),
              take(1),
            );
          }),

          switchTap(() => this.afterPreactivation()),

          switchMap(() => {
            const {currentSnapshot, targetSnapshot} = overallTransitionState;
            const viewTransitionStarted = this.createViewTransition?.(
              this.environmentInjector,
              currentSnapshot.root,
              targetSnapshot!.root,
            );

            // If view transitions are enabled, block the navigation until the view
            // transition callback starts. Otherwise, continue immediately.
            return viewTransitionStarted
              ? from(viewTransitionStarted).pipe(map(() => overallTransitionState))
              : of(overallTransitionState);
          }),

          map((t: NavigationTransition) => {
            const targetRouterState = createRouterState(
              router.routeReuseStrategy,
              t.targetSnapshot!,
              t.currentRouterState,
            );
            this.currentTransition = overallTransitionState = {...t, targetRouterState};
            this.currentNavigation!.targetRouterState = targetRouterState;
            return overallTransitionState;
          }),

          tap(() => {
            this.events.next(new BeforeActivateRoutes());
          }),

          activateRoutes(
            this.rootContexts,
            router.routeReuseStrategy,
            (evt: Event) => this.events.next(evt),
            this.inputBindingEnabled,
          ),

          // Ensure that if some observable used to drive the transition doesn't
          // complete, the navigation still finalizes This should never happen, but
          // this is done as a safety measure to avoid surfacing this error (#49567).
          take(1),

          takeUntil(
            new Observable<void>((subscriber) => {
              const abortSignal = overallTransitionState.abortController.signal;
              const handler = () => subscriber.next();
              abortSignal.addEventListener('abort', handler);
              return () => abortSignal.removeEventListener('abort', handler);
            }).pipe(
              // Ignore aborts if we are already completed, canceled, or are in the activation stage (we have targetRouterState)
              filter(() => !completedOrAborted && !overallTransitionState.targetRouterState),
              tap(() => {
                this.cancelNavigationTransition(
                  overallTransitionState,
                  overallTransitionState.abortController.signal.reason + '',
                  NavigationCancellationCode.Aborted,
                );
              }),
            ),
          ),

          tap({
            next: (t: NavigationTransition) => {
              completedOrAborted = true;
              this.lastSuccessfulNavigation = this.currentNavigation;
              this.events.next(
                new NavigationEnd(
                  t.id,
                  this.urlSerializer.serialize(t.extractedUrl),
                  this.urlSerializer.serialize(t.urlAfterRedirects!),
                ),
              );
              this.titleStrategy?.updateTitle(t.targetRouterState!.snapshot);
              t.resolve(true);
            },
            complete: () => {
              completedOrAborted = true;
            },
          }),

          // There used to be a lot more logic happening directly within the
          // transition Observable. Some of this logic has been refactored out to
          // other places but there may still be errors that happen there. This gives
          // us a way to cancel the transition from the outside. This may also be
          // required in the future to support something like the abort signal of the
          // Navigation API where the navigation gets aborted from outside the
          // transition.
          takeUntil(
            this.transitionAbortWithErrorSubject.pipe(
              tap((err) => {
                throw err;
              }),
            ),
          ),

          finalize(() => {
            /* When the navigation stream finishes either through error or success,
             * we set the `completed` or `errored` flag. However, there are some
             * situations where we could get here without either of those being set.
             * For instance, a redirect during NavigationStart. Therefore, this is a
             * catch-all to make sure the NavigationCancel event is fired when a
             * navigation gets cancelled but not caught by other means. */
            if (!completedOrAborted) {
              const cancelationReason =
                typeof ngDevMode === 'undefined' || ngDevMode
                  ? `Navigation ID ${overallTransitionState.id} is not equal to the current navigation id ${this.navigationId}`
                  : '';
              this.cancelNavigationTransition(
                overallTransitionState,
                cancelationReason,
                NavigationCancellationCode.SupersededByNewNavigation,
              );
            }
            // Only clear current navigation if it is still set to the one that
            // finalized.
            if (this.currentTransition?.id === overallTransitionState.id) {
              this.currentNavigation = null;
              this.currentTransition = null;
            }
          }),
          catchError((e) => {
            // If the application is already destroyed, the catch block should not
            // execute anything in practice because other resources have already
            // been released and destroyed.
            if (this.destroyed) {
              overallTransitionState.resolve(false);
              return EMPTY;
            }

            completedOrAborted = true;
            /* This error type is issued during Redirect, and is handled as a
             * cancellation rather than an error. */
            if (isNavigationCancelingError(e)) {
              this.events.next(
                new NavigationCancel(
                  overallTransitionState.id,
                  this.urlSerializer.serialize(overallTransitionState.extractedUrl),
                  e.message,
                  e.cancellationCode,
                ),
              );

              // When redirecting, we need to delay resolving the navigation
              // promise and push it to the redirect navigation
              if (!isRedirectingNavigationCancelingError(e)) {
                overallTransitionState.resolve(false);
              } else {
                this.events.next(new RedirectRequest(e.url, e.navigationBehaviorOptions));
              }

              /* All other errors should reset to the router's internal URL reference
               * to the pre-error state. */
            } else {
              const navigationError = new NavigationError(
                overallTransitionState.id,
                this.urlSerializer.serialize(overallTransitionState.extractedUrl),
                e,
                overallTransitionState.targetSnapshot ?? undefined,
              );

              try {
                const navigationErrorHandlerResult = runInInjectionContext(
                  this.environmentInjector,
                  () => this.navigationErrorHandler?.(navigationError),
                );

                if (navigationErrorHandlerResult instanceof RedirectCommand) {
                  const {message, cancellationCode} = redirectingNavigationError(
                    this.urlSerializer,
                    navigationErrorHandlerResult,
                  );
                  this.events.next(
                    new NavigationCancel(
                      overallTransitionState.id,
                      this.urlSerializer.serialize(overallTransitionState.extractedUrl),
                      message,
                      cancellationCode,
                    ),
                  );
                  this.events.next(
                    new RedirectRequest(
                      navigationErrorHandlerResult.redirectTo,
                      navigationErrorHandlerResult.navigationBehaviorOptions,
                    ),
                  );
                } else {
                  this.events.next(navigationError);
                  throw e;
                }
              } catch (ee) {
                // TODO(atscott): consider flipping the default behavior of
                // resolveNavigationPromiseOnError to be `resolve(false)` when
                // undefined. This is the most sane thing to do given that
                // applications very rarely handle the promise rejection and, as a
                // result, would get "unhandled promise rejection" console logs.
                // The vast majority of applications would not be affected by this
                // change so omitting a migration seems reasonable. Instead,
                // applications that rely on rejection can specifically opt-in to the
                // old behavior.
                if (this.options.resolveNavigationPromiseOnError) {
                  overallTransitionState.resolve(false);
                } else {
                  overallTransitionState.reject(ee);
                }
              }
            }

            return EMPTY;
          }),
        );
        // casting because `pipe` returns observable({}) when called with 8+ arguments
      }),
    ) as Observable<NavigationTransition>;
  }

  private cancelNavigationTransition(
    t: NavigationTransition,
    reason: string,
    code: NavigationCancellationCode,
  ) {
    const navCancel = new NavigationCancel(
      t.id,
      this.urlSerializer.serialize(t.extractedUrl),
      reason,
      code,
    );
    this.events.next(navCancel);
    t.resolve(false);
  }

  /**
   * @returns Whether we're navigating to somewhere that is not what the Router is
   * currently set to.
   */
  private isUpdatingInternalState() {
    // TODO(atscott): The serializer should likely be used instead of
    // `UrlTree.toString()`. Custom serializers are often written to handle
    // things better than the default one (objects, for example will be
    // [Object object] with the custom serializer and be "the same" when they
    // aren't).
    // (Same for isUpdatedBrowserUrl)
    return (
      this.currentTransition?.extractedUrl.toString() !==
      this.currentTransition?.currentUrlTree.toString()
    );
  }

  /**
   * @returns Whether we're updating the browser URL to something new (navigation is going
   * to somewhere not displayed in the URL bar and we will update the URL
   * bar if navigation succeeds).
   */
  private isUpdatedBrowserUrl() {
    // The extracted URL is the part of the URL that this application cares about. `extract` may
    // return only part of the browser URL and that part may have not changed even if some other
    // portion of the URL did.
    const currentBrowserUrl = this.urlHandlingStrategy.extract(
      this.urlSerializer.parse(this.location.path(true)),
    );
    const targetBrowserUrl =
      this.currentNavigation?.targetBrowserUrl ?? this.currentNavigation?.extractedUrl;
    return (
      currentBrowserUrl.toString() !== targetBrowserUrl?.toString() &&
      !this.currentNavigation?.extras.skipLocationChange
    );
  }
}

export function isBrowserTriggeredNavigation(source: NavigationTrigger) {
  return source !== IMPERATIVE_NAVIGATION;
}
