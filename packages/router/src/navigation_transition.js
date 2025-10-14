/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Location} from '@angular/common';
import {
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injectable,
  InjectionToken,
  runInInjectionContext,
  signal,
  untracked,
} from '@angular/core';
import {BehaviorSubject, combineLatest, EMPTY, from, of, Subject} from 'rxjs';
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
  RedirectRequest,
  ResolveEnd,
  ResolveStart,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  RoutesRecognized,
} from './events';
import {RedirectCommand} from './models';
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
import {ROUTER_CONFIGURATION} from './router_config';
import {RouterConfigLoader} from './router_config_loader';
import {ChildrenOutletContexts} from './router_outlet_context';
import {createEmptyState} from './router_state';
import {UrlHandlingStrategy} from './url_handling_strategy';
import {UrlSerializer} from './url_tree';
import {getAllRouteGuards} from './utils/preactivation';
import {CREATE_VIEW_TRANSITION} from './utils/view_transition';
import {getClosestRouteInjector} from './utils/config';
import {abortSignalToObservable} from './utils/abort_signal_to_observable';
export const NAVIGATION_ERROR_HANDLER = new InjectionToken(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'navigation error handler' : '',
);
let NavigationTransitions = class NavigationTransitions {
  get hasRequestedNavigation() {
    return this.navigationId !== 0;
  }
  constructor() {
    // Some G3 targets expect the navigation object to be mutated (and not getting a new reference on changes).
    this.currentNavigation = signal(null, {equal: () => false});
    this.currentTransition = null;
    this.lastSuccessfulNavigation = signal(null);
    /**
     * These events are used to communicate back to the Router about the state of the transition. The
     * Router wants to respond to these events in various ways. Because the `NavigationTransition`
     * class is not public, this event subject is not publicly exposed.
     */
    this.events = new Subject();
    /**
     * Used to abort the current transition with an error.
     */
    this.transitionAbortWithErrorSubject = new Subject();
    this.configLoader = inject(RouterConfigLoader);
    this.environmentInjector = inject(EnvironmentInjector);
    this.destroyRef = inject(DestroyRef);
    this.urlSerializer = inject(UrlSerializer);
    this.rootContexts = inject(ChildrenOutletContexts);
    this.location = inject(Location);
    this.inputBindingEnabled = inject(INPUT_BINDER, {optional: true}) !== null;
    this.titleStrategy = inject(TitleStrategy);
    this.options = inject(ROUTER_CONFIGURATION, {optional: true}) || {};
    this.paramsInheritanceStrategy = this.options.paramsInheritanceStrategy || 'emptyOnly';
    this.urlHandlingStrategy = inject(UrlHandlingStrategy);
    this.createViewTransition = inject(CREATE_VIEW_TRANSITION, {optional: true});
    this.navigationErrorHandler = inject(NAVIGATION_ERROR_HANDLER, {optional: true});
    this.navigationId = 0;
    /**
     * Hook that enables you to pause navigation after the preactivation phase.
     * Used by `RouterModule`.
     *
     * @internal
     */
    this.afterPreactivation = () => of(void 0);
    /** @internal */
    this.rootComponentType = null;
    this.destroyed = false;
    const onLoadStart = (r) => this.events.next(new RouteConfigLoadStart(r));
    const onLoadEnd = (r) => this.events.next(new RouteConfigLoadEnd(r));
    this.configLoader.onLoadEndListener = onLoadEnd;
    this.configLoader.onLoadStartListener = onLoadStart;
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
    });
  }
  complete() {
    this.transitions?.complete();
  }
  handleNavigationRequest(request) {
    const id = ++this.navigationId;
    // Navigation can happen as a side effect of template execution, as such we need to untrack signal updates
    // (Writing to signals is not allowed while Angular renders the template)
    // TODO: We might want to reconsider allowing navigation as side effect of template execution.
    untracked(() => {
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
    });
  }
  setupNavigations(router) {
    this.transitions = new BehaviorSubject(null);
    return this.transitions.pipe(
      filter((t) => t !== null),
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
            const lastSuccessfulNavigation = this.lastSuccessfulNavigation();
            // Store the Navigation object
            this.currentNavigation.set({
              id: t.id,
              initialUrl: t.rawUrl,
              extractedUrl: t.extractedUrl,
              targetBrowserUrl:
                typeof t.extras.browserUrl === 'string'
                  ? this.urlSerializer.parse(t.extras.browserUrl)
                  : t.extras.browserUrl,
              trigger: t.source,
              extras: t.extras,
              previousNavigation: !lastSuccessfulNavigation
                ? null
                : {
                    ...lastSuccessfulNavigation,
                    previousNavigation: null,
                  },
              abort: () => t.abortController.abort(),
            });
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
                  overallTransitionState.abortController.signal,
                ),
                // Update URL if in `eager` update mode
                tap((t) => {
                  overallTransitionState.targetSnapshot = t.targetSnapshot;
                  overallTransitionState.urlAfterRedirects = t.urlAfterRedirects;
                  this.currentNavigation.update((nav) => {
                    nav.finalUrl = t.urlAfterRedirects;
                    return nav;
                  });
                  // Fire RoutesRecognized
                  const routesRecognized = new RoutesRecognized(
                    t.id,
                    this.urlSerializer.serialize(t.extractedUrl),
                    this.urlSerializer.serialize(t.urlAfterRedirects),
                    t.targetSnapshot,
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
              this.currentNavigation.update((nav) => {
                nav.finalUrl = extractedUrl;
                return nav;
              });
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
              this.urlSerializer.serialize(t.urlAfterRedirects),
              t.targetSnapshot,
            );
            this.events.next(guardsStart);
          }),
          map((t) => {
            this.currentTransition = overallTransitionState = {
              ...t,
              guards: getAllRouteGuards(t.targetSnapshot, t.currentSnapshot, this.rootContexts),
            };
            return overallTransitionState;
          }),
          checkGuards(this.environmentInjector, (evt) => this.events.next(evt)),
          tap((t) => {
            overallTransitionState.guardsResult = t.guardsResult;
            if (t.guardsResult && typeof t.guardsResult !== 'boolean') {
              throw redirectingNavigationError(this.urlSerializer, t.guardsResult);
            }
            const guardsEnd = new GuardsCheckEnd(
              t.id,
              this.urlSerializer.serialize(t.extractedUrl),
              this.urlSerializer.serialize(t.urlAfterRedirects),
              t.targetSnapshot,
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
                  this.urlSerializer.serialize(t.urlAfterRedirects),
                  t.targetSnapshot,
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
                  this.urlSerializer.serialize(t.urlAfterRedirects),
                  t.targetSnapshot,
                );
                this.events.next(resolveEnd);
              }),
            );
          }),
          // --- LOAD COMPONENTS ---
          switchTap((t) => {
            const loadComponents = (route) => {
              const loaders = [];
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
            return combineLatest(loadComponents(t.targetSnapshot.root)).pipe(
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
              targetSnapshot.root,
            );
            // If view transitions are enabled, block the navigation until the view
            // transition callback starts. Otherwise, continue immediately.
            return viewTransitionStarted
              ? from(viewTransitionStarted).pipe(map(() => overallTransitionState))
              : of(overallTransitionState);
          }),
          map((t) => {
            const targetRouterState = createRouterState(
              router.routeReuseStrategy,
              t.targetSnapshot,
              t.currentRouterState,
            );
            this.currentTransition = overallTransitionState = {...t, targetRouterState};
            this.currentNavigation.update((nav) => {
              nav.targetRouterState = targetRouterState;
              return nav;
            });
            return overallTransitionState;
          }),
          tap(() => {
            this.events.next(new BeforeActivateRoutes());
          }),
          activateRoutes(
            this.rootContexts,
            router.routeReuseStrategy,
            (evt) => this.events.next(evt),
            this.inputBindingEnabled,
          ),
          // Ensure that if some observable used to drive the transition doesn't
          // complete, the navigation still finalizes This should never happen, but
          // this is done as a safety measure to avoid surfacing this error (#49567).
          take(1),
          takeUntil(
            abortSignalToObservable(overallTransitionState.abortController.signal).pipe(
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
            next: (t) => {
              completedOrAborted = true;
              this.lastSuccessfulNavigation.set(untracked(this.currentNavigation));
              this.events.next(
                new NavigationEnd(
                  t.id,
                  this.urlSerializer.serialize(t.extractedUrl),
                  this.urlSerializer.serialize(t.urlAfterRedirects),
                ),
              );
              this.titleStrategy?.updateTitle(t.targetRouterState.snapshot);
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
            overallTransitionState.abortController.abort();
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
              this.currentNavigation.set(null);
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
    );
  }
  cancelNavigationTransition(t, reason, code) {
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
  isUpdatingInternalState() {
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
  isUpdatedBrowserUrl() {
    // The extracted URL is the part of the URL that this application cares about. `extract` may
    // return only part of the browser URL and that part may have not changed even if some other
    // portion of the URL did.
    const currentBrowserUrl = this.urlHandlingStrategy.extract(
      this.urlSerializer.parse(this.location.path(true)),
    );
    const currentNavigation = untracked(this.currentNavigation);
    const targetBrowserUrl = currentNavigation?.targetBrowserUrl ?? currentNavigation?.extractedUrl;
    return (
      currentBrowserUrl.toString() !== targetBrowserUrl?.toString() &&
      !currentNavigation?.extras.skipLocationChange
    );
  }
};
NavigationTransitions = __decorate([Injectable({providedIn: 'root'})], NavigationTransitions);
export {NavigationTransitions};
export function isBrowserTriggeredNavigation(source) {
  return source !== IMPERATIVE_NAVIGATION;
}
//# sourceMappingURL=navigation_transition.js.map
