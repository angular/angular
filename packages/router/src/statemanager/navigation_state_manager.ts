/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  afterNextRender,
  ɵpromiseWithResolvers as promiseWithResolvers,
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injectable,
} from '@angular/core';

import {PlatformLocation, PlatformNavigation} from '@angular/common';
import {StateManager} from './state_manager';
import {RestoredState, Navigation as RouterNavigation} from '../navigation_transition';
import {
  BeforeActivateRoutes,
  isRedirectingEvent,
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  NavigationTrigger,
  PrivateRouterEvents,
  RoutesRecognized,
} from '../events';
import {Subject, SubscriptionLike} from 'rxjs';
import {UrlTree} from '../url_tree';
import {ROUTER_SCROLLER} from '../router_scroller';

type NavigationInfo = {ɵrouterInfo: {intercept: boolean}};

@Injectable({providedIn: 'root'})
/**
 * A `StateManager` that uses the browser's Navigation API to get the state of a `popstate`
 * event.
 *
 * This class is currently an extension of `HistoryStateManager` and is used when the
 * Navigation API is available. It overrides the behavior of listening to `popstate` events
 * to retrieve the state from `navigation.currentEntry` instead of `history.state` since
 * history and navigation states are separate.
 *
 * This implementation is not complete - it does not integrate at all with navigation API other than
 * providing the right state on popstate. It needs to manage the whole lifecycle of the navigation
 * by intercepting the navigation event.
 */
export class NavigationStateManager extends StateManager {
  private readonly injector = inject(EnvironmentInjector);
  private readonly navigation = inject(PlatformNavigation);
  private readonly inMemoryScrollingEnabled = inject(ROUTER_SCROLLER, {optional: true}) !== null;
  /** The base origin of the application, extracted from PlatformLocation. */
  private readonly base = new URL(inject(PlatformLocation).href).origin;
  /** The root URL of the Angular application, considering the base href. */
  private readonly appRootURL = new URL(this.location.prepareExternalUrl?.('/') ?? '/', this.base)
    .href;
  /**
   * The `NavigationHistoryEntry` from the Navigation API that corresponds to the last successfully
   * activated router state. This is crucial for restoring the browser state if an ongoing navigation
   * is canceled or fails, allowing a precise rollback to a known good entry.
   * It's updated on `navigatesuccess`.
   */
  private activeHistoryEntry: NavigationHistoryEntry = this.navigation.currentEntry!;

  /**
   * Holds state related to the currently processing navigation that was intercepted from a
   * `navigate` event. This includes the router's internal `Navigation` object.
   */
  private currentNavigation: {
    removeAbortListener?: () => void;
    /** The Angular Router's internal representation of the ongoing navigation. */
    routerTransition?: RouterNavigation;
    /** Function to reject the intercepted navigation event. */
    rejectNavigateEvent?: (reason?: any) => void;
    /** Function to resolve the intercepted navigation event. */
    resolveHandler?: (v: void) => void;
    navigationEvent?: NavigateEvent;
  } = {};

  /**
   * Subject used to notify listeners (typically the `Router`) of URL/state changes
   * that were initiated outside the Angular Router but detected via the Navigation API's
   * `navigate` event (e.g., user clicking browser back/forward, or manual URL changes if
   * interceptable by the Navigation API).
   */
  private nonRouterCurrentEntryChangeSubject = new Subject<{
    path: string;
    state: RestoredState | null | undefined;
  }>();

  nonRouterEntryChangeListener?: SubscriptionLike;
  private get registered() {
    return (
      this.nonRouterEntryChangeListener !== undefined && !this.nonRouterEntryChangeListener.closed
    );
  }

  constructor() {
    super();

    // Listen to the 'navigate' event from the Navigation API.
    // This is the primary entry point for intercepting and handling navigations.
    const navigateListener = (event: NavigateEvent) => {
      this.handleNavigate(event);
    };
    this.navigation.addEventListener('navigate', navigateListener);
    inject(DestroyRef).onDestroy(() =>
      this.navigation.removeEventListener('navigate', navigateListener),
    );
  }

  override registerNonRouterCurrentEntryChangeListener(
    listener: (
      url: string,
      state: RestoredState | null | undefined,
      trigger: NavigationTrigger,
    ) => void,
  ): SubscriptionLike {
    this.activeHistoryEntry = this.navigation.currentEntry!;
    this.nonRouterEntryChangeListener = this.nonRouterCurrentEntryChangeSubject.subscribe(
      ({path, state}) => {
        listener(path, state, 'popstate');
      },
    );
    return this.nonRouterEntryChangeListener;
  }

  /**
   * Handles router events emitted by the `NavigationTransitions` service.
   * This method orchestrates the interaction with the Navigation API based on the
   * current stage of the router's internal navigation pipeline.
   *
   * @param e The router event (e.g., `NavigationStart`, `NavigationEnd`).
   * @param transition The Angular Router's internal navigation object.
   */
  override async handleRouterEvent(
    e: Event | PrivateRouterEvents,
    transition: RouterNavigation,
  ): Promise<void> {
    this.currentNavigation = {...this.currentNavigation, routerTransition: transition};
    if (e instanceof NavigationStart) {
      this.updateStateMemento();
    } else if (e instanceof NavigationSkipped) {
      this.finishNavigation();
      this.commitTransition(transition);
    } else if (e instanceof RoutesRecognized) {
      if (this.urlUpdateStrategy === 'eager' && !transition.extras.skipLocationChange) {
        this.createNavigationForTransition(transition);
      }
    } else if (e instanceof BeforeActivateRoutes) {
      // Commit the internal router state.
      this.commitTransition(transition);
      if (this.urlUpdateStrategy === 'deferred' && !transition.extras.skipLocationChange) {
        this.createNavigationForTransition(transition);
      }
    } else if (e instanceof NavigationCancel || e instanceof NavigationError) {
      void this.cancel(transition, e);
    } else if (e instanceof NavigationEnd) {
      const {resolveHandler, removeAbortListener} = this.currentNavigation;
      this.currentNavigation = {};
      // We no longer care about aborts for this navigation once it's successfully ended.
      // Since we're delaying the resolution of the handler until after next render, it's
      // technically possible for it to still get aborted in that window, so we remove the listener here.
      removeAbortListener?.();
      // Update `activeHistoryEntry` to the new current entry from Navigation API.
      this.activeHistoryEntry = this.navigation.currentEntry!;
      // TODO(atscott): Consider initiating scroll here since it will be attempted periodically.
      // We have to wait for render to resolve because focus reset is only done once in the spec.
      // Render is not synchronous with NavigationEnd today. The Router's navigation promise resolve
      // is what _causes_ the render to happen with ZoneJS...
      // Resolve handler after next render to defer scroll and focus reset.
      afterNextRender({read: () => resolveHandler?.()}, {injector: this.injector});
    }
  }

  private createNavigationForTransition(transition: RouterNavigation) {
    const {navigationEvent} = this.currentNavigation;
    // If we are currently handling a traversal navigation, we do not need a new navigation for it
    // because we are strictly restoring a previous state. If we are instead handling a navigation
    // initiated outside the router, we do need to replace it with a router-triggered navigation
    // to add the router-specific state.
    if (
      navigationEvent &&
      (navigationEvent.navigationType === 'traverse' ||
        navigationEvent.navigationType === 'reload') &&
      this.eventAndRouterDestinationsMatch(navigationEvent, transition)
    ) {
      return;
    }
    // Before we create a navigation for the Router transition, we have to remove any abort listeners
    // from the previous navigation event. Creating the new navigation will cause the signal
    // to be aborted, and we don't want that to cause our router transition to be aborted.
    this.currentNavigation.removeAbortListener?.();
    const path = this.createBrowserPath(transition);
    this.navigate(path, transition);
  }

  /**
   * Initiates a navigation using the browser's Navigation API (`navigation.navigate`).
   * This is called when the Angular Router starts an imperative navigation.
   *
   * @param internalPath The internal path generated by the router.
   * @param transition The Angular Router's navigation object.
   */
  private navigate(internalPath: string, transition: RouterNavigation) {
    // Determine the actual browser path, considering skipLocationChange.
    const path = transition.extras.skipLocationChange
      ? this.navigation.currentEntry!.url! // If skipping, use the current URL.
      : this.location.prepareExternalUrl(internalPath); // Otherwise, prepare the external URL.

    // Prepare the state to be stored in the NavigationHistoryEntry.
    const state = {
      ...transition.extras.state,
      // Include router's navigationId for tracking. Required for in-memory scroll restoration
      navigationId: transition.id,
    };

    const info: NavigationInfo = {ɵrouterInfo: {intercept: true}};

    // Determine if this should be a 'push' or 'replace' history operation.
    const history =
      this.location.isCurrentPathEqualTo(path) ||
      transition.extras.replaceUrl ||
      transition.extras.skipLocationChange
        ? 'replace'
        : 'push';

    // Call the Navigation API and prevent unhandled promise rejections of the
    // returned promises from `navigation.navigate`.
    handleResultRejections(
      this.navigation.navigate(path, {
        state,
        history,
        info,
      }),
    );
  }

  /**
   * Finalizes the current navigation by committing the URL (if not already done)
   * and resolving the post-commit handler promise. Clears the `currentNavigation` state.
   */
  private finishNavigation() {
    this.currentNavigation?.resolveHandler?.();
    this.currentNavigation = {};
  }

  /**
   * Performs the necessary rollback action to restore the browser URL to the
   * state before the transition.
   */
  private async cancel(transition: RouterNavigation, cause: NavigationCancel | NavigationError) {
    this.currentNavigation.rejectNavigateEvent?.();
    const clearedState = {}; // Marker to detect if a new navigation started during async ops.
    this.currentNavigation = clearedState;
    // Do not reset state if we're redirecting or navigation is superseded by a new one.
    if (isRedirectingEvent(cause)) {
      return;
    }
    // Determine if the rollback should be a traversal to a specific previous entry
    // or a replacement of the current URL.
    const isTraversalReset =
      this.canceledNavigationResolution === 'computed' &&
      this.navigation.currentEntry!.key !== this.activeHistoryEntry.key;
    this.resetInternalState(transition.finalUrl, isTraversalReset);

    // If the current browser entry ID is already the same as our target active entry,
    // no browser history manipulation is needed.
    if (this.navigation.currentEntry!.id === this.activeHistoryEntry.id) {
      return;
    }

    // If the cancellation was not due to a guard or resolver (e.g., superseded by another
    // navigation, or aborted by user), there's a race condition. Another navigation might
    // have already started. A delay is used to see if `currentNavigation` changes,
    // indicating a new navigation has taken over.
    // We have no way of knowing if a navigation was aborted by another incoming navigation
    // https://github.com/WICG/navigation-api/issues/288
    if (cause instanceof NavigationCancel && cause.code === NavigationCancellationCode.Aborted) {
      await Promise.resolve();
      if (this.currentNavigation !== clearedState) {
        // A new navigation has started, so don't attempt to roll back this one.
        return;
      }
    }

    if (isTraversalReset) {
      // Traverse back to the specific `NavigationHistoryEntry` that was active before.
      handleResultRejections(
        this.navigation.traverseTo(this.activeHistoryEntry.key, {
          info: {ɵrouterInfo: {intercept: false}} satisfies NavigationInfo,
        }),
      );
    } else {
      // Replace the current history entry with the state of the last known good URL/state.
      const internalPath = this.urlSerializer.serialize(this.getCurrentUrlTree());
      const pathOrUrl = this.location.prepareExternalUrl(internalPath);
      handleResultRejections(
        this.navigation.navigate(pathOrUrl, {
          state: this.activeHistoryEntry.getState(),
          history: 'replace',
          info: {ɵrouterInfo: {intercept: false}} satisfies NavigationInfo,
        }),
      );
    }
  }

  private resetInternalState(finalUrl: UrlTree | undefined, traversalReset: boolean): void {
    this.routerState = this.stateMemento.routerState;
    this.currentUrlTree = this.stateMemento.currentUrlTree;
    this.rawUrlTree = traversalReset
      ? this.stateMemento.rawUrlTree
      : this.urlHandlingStrategy.merge(this.currentUrlTree, finalUrl ?? this.rawUrlTree);
  }

  /**
   * Handles the `navigate` event from the browser's Navigation API.
   * This is the core interception point.
   *
   * @param event The `NavigateEvent` from the Navigation API.
   */
  private handleNavigate(event: NavigateEvent) {
    // If the event cannot be intercepted (e.g., cross-origin, or some browser-internal
    // navigations), let the browser handle it.
    if (!event.canIntercept) {
      return;
    }

    const routerInfo = (event?.info as NavigationInfo | undefined)?.ɵrouterInfo;
    if (routerInfo && !routerInfo.intercept) {
      return;
    }
    const isTriggeredByRouterTransition = !!routerInfo;
    if (!isTriggeredByRouterTransition) {
      // If there's an ongoing navigation in the Angular Router, abort it. This new navigation
      // supersedes it. If the navigation was triggered by the Router, it may be the navigation
      // happening from _inside_ the navigation transition, or a separate Router.navigate call
      // that would have already handled cleanup of the previous navigation.
      this.currentNavigation.routerTransition?.abort();

      if (!this.registered) {
        // If the router isn't set up to listen for these yet. Do not convert it to a router navigation.
        this.finishNavigation();
        return;
      }
    }

    this.currentNavigation = {...this.currentNavigation};
    this.currentNavigation.navigationEvent = event;
    // Setup an abort handler. If the `NavigateEvent` is aborted (e.g., user clicks stop,
    // or another navigation supersedes this one), we need to abort the Angular Router's
    // internal navigation transition as well.
    const abortHandler = () => {
      this.currentNavigation.routerTransition?.abort();
    };
    event.signal.addEventListener('abort', abortHandler);
    this.currentNavigation.removeAbortListener = () =>
      event.signal.removeEventListener('abort', abortHandler);

    let scroll = this.inMemoryScrollingEnabled
      ? 'manual'
      : (this.currentNavigation.routerTransition?.extras.scroll ?? 'after-transition');
    const interceptOptions: NavigationInterceptOptions = {
      scroll,
    };

    const {
      promise: handlerPromise,
      resolve: resolveHandler,
      reject: rejectHandler,
    } = promiseWithResolvers<void>();
    this.currentNavigation.resolveHandler = () => {
      this.currentNavigation.removeAbortListener?.();
      resolveHandler();
    };
    this.currentNavigation.rejectNavigateEvent = () => {
      this.currentNavigation.removeAbortListener?.();
      rejectHandler();
    };
    // Prevent unhandled promise rejections from internal promises.
    handlerPromise.catch(() => {});
    interceptOptions.handler = () => handlerPromise;

    // Intercept the navigation event with the configured options.
    event.intercept(interceptOptions);

    // If `routerInfo` is null, this `NavigateEvent` was not triggered by one of the Router's
    // own `this.navigation.navigate()` calls. It's an external navigation (e.g., user click,
    // browser back/forward that the Navigation API surfaces). We need to inform the Router.
    if (!isTriggeredByRouterTransition) {
      this.handleNavigateEventTriggeredOutsideRouterAPIs(event);
    }
  }

  /**
   * Handles `NavigateEvent`s that were not initiated by the Angular Router's own API calls
   * (e.g., `router.navigate()`). These are typically from user interactions like back/forward
   * buttons or direct URL manipulation if the Navigation API intercepts them.
   *
   * It converts such an event into a format the Angular Router can understand and processes it
   * via the `nonRouterCurrentEntryChangeSubject`.
   *
   * @param event The `NavigateEvent` from the Navigation API.
   */
  private handleNavigateEventTriggeredOutsideRouterAPIs(event: NavigateEvent) {
    // TODO(atscott): Consider if the destination URL doesn't start with `appRootURL`.
    // Should we ignore it or not intercept in the first place?

    // Extract the application-relative path from the full destination URL.
    const path = event.destination.url.substring(this.appRootURL.length - 1);
    const state = event.destination.getState() as RestoredState | null | undefined;
    this.nonRouterCurrentEntryChangeSubject.next({path, state});
  }

  private eventAndRouterDestinationsMatch(
    navigateEvent: NavigateEvent,
    transition: RouterNavigation,
  ): boolean {
    const internalPath = this.createBrowserPath(transition);
    const eventDestination = new URL(navigateEvent.destination.url);
    // this might be a path or an actual URL depending on the baseHref
    const routerDestination = this.location.prepareExternalUrl(internalPath);
    return new URL(routerDestination, eventDestination.origin).href === eventDestination.href;
  }
}

/**
 * Attaches a no-op `.catch(() => {})` to the `committed` and `finished` promises of a
 * `NavigationResult`. This is to prevent unhandled promise rejection errors in the console
 * if the consumer of the navigation method (e.g., `router.navigate()`) doesn't explicitly
 * handle rejections on both promises. Navigations can be legitimately aborted (e.g., by a
 * subsequent navigation), and this shouldn't necessarily manifest as an unhandled error
 * if the application code doesn't specifically need to react to the `committed` promise
 * rejecting in such cases. The `finished` promise is more commonly used to determine
 * overall success/failure.
 */
function handleResultRejections(result: NavigationResult): NavigationResult {
  result.finished.catch(() => {});
  result.committed.catch(() => {});
  return result;
}
