/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location} from '@angular/common';
import {
  computed,
  ɵConsole as Console,
  EnvironmentInjector,
  inject,
  Injectable,
  ɵPendingTasksInternal as PendingTasks,
  ɵRuntimeError as RuntimeError,
  signal,
  Signal,
  Type,
  untracked,
  ɵINTERNAL_APPLICATION_ERROR_HANDLER,
} from '@angular/core';
import {Observable, Subject, Subscription, SubscriptionLike} from 'rxjs';

import {standardizeConfig} from './components/empty_outlet';
import {createSegmentGroupFromRoute, createUrlTreeFromSegmentGroup} from './create_url_tree';
import {INPUT_BINDER} from './directives/router_outlet';
import {RuntimeErrorCode} from './errors';
import {
  Event,
  IMPERATIVE_NAVIGATION,
  isPublicRouterEvent,
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationTrigger,
  RedirectRequest,
} from './events';
import {NavigationBehaviorOptions, OnSameUrlNavigation, Routes} from './models';
import {
  isBrowserTriggeredNavigation,
  Navigation,
  NavigationExtras,
  NavigationTransitions,
  RestoredState,
  UrlCreationOptions,
} from './navigation_transition';
import {RouteReuseStrategy} from './route_reuse_strategy';
import {ROUTER_CONFIGURATION} from './router_config';
import {ROUTES} from './router_config_loader';
import {Params} from './shared';
import {StateManager} from './statemanager/state_manager';
import {UrlHandlingStrategy} from './url_handling_strategy';
import {
  containsTree,
  IsActiveMatchOptions,
  isUrlTree,
  UrlSegmentGroup,
  UrlSerializer,
  UrlTree,
} from './url_tree';
import {validateConfig} from './utils/config';
import {afterNextNavigation} from './utils/navigations';
import {RouterState} from './router_state';
import {shallowEqual} from './utils/collection';

/**
 * The equivalent `IsActiveMatchOptions` options for `Router.isActive` is called with `true`
 * (exact = true).
 */
export const exactMatchOptions: IsActiveMatchOptions = {
  paths: 'exact',
  fragment: 'ignored',
  matrixParams: 'ignored',
  queryParams: 'exact',
};

/**
 * The equivalent `IsActiveMatchOptions` options for `Router.isActive` is called with `false`
 * (exact = false).
 */
export const subsetMatchOptions: IsActiveMatchOptions = {
  paths: 'subset',
  fragment: 'ignored',
  matrixParams: 'ignored',
  queryParams: 'subset',
};

/**
 * @description
 *
 * A service that facilitates navigation among views and URL manipulation capabilities.
 * This service is provided in the root scope and configured with [provideRouter](api/router/provideRouter).
 *
 * @see {@link Route}
 * @see {@link provideRouter}
 * @see [Routing and Navigation Guide](guide/routing/common-router-tasks).
 *
 * @ngModule RouterModule
 *
 * @publicApi
 */
@Injectable({providedIn: 'root'})
export class Router {
  private disposed = false;
  private nonRouterCurrentEntryChangeSubscription?: SubscriptionLike;

  private readonly console = inject(Console);
  private readonly stateManager = inject(StateManager);
  private readonly options = inject(ROUTER_CONFIGURATION, {optional: true}) || {};
  private readonly pendingTasks = inject(PendingTasks);
  private readonly urlUpdateStrategy = this.options.urlUpdateStrategy || 'deferred';
  private readonly navigationTransitions = inject(NavigationTransitions);
  private readonly urlSerializer = inject(UrlSerializer);
  private readonly location = inject(Location);
  private readonly urlHandlingStrategy = inject(UrlHandlingStrategy);
  private readonly injector = inject(EnvironmentInjector);

  private currentUrlTree = this.stateManager.currentUrlTree;
  private fragment = computed(() => this.currentUrlTree().fragment);
  private queryParams = computed(() => this.currentUrlTree().queryParams, {equal: shallowEqual});
  private rawUrlTree = this.stateManager.rawUrlTree;
  /**
   * The private `Subject` type for the public events exposed in the getter. This is used internally
   * to push events to. The separate field allows us to expose separate types in the public API
   * (i.e., an Observable rather than the Subject).
   */
  private _events = new Subject<Event>();
  /**
   * An event stream for routing events.
   */
  public get events(): Observable<Event> {
    // TODO(atscott): This _should_ be events.asObservable(). However, this change requires internal
    // cleanup: tests are doing `(route.events as Subject<Event>).next(...)`. This isn't
    // allowed/supported but we still have to fix these or file bugs against the teams before making
    // the change.
    return this._events;
  }
  /**
   * The current state of routing in this NgModule.
   */
  get routerState(): RouterState {
    return untracked(this.stateManager.routerState);
  }

  /**
   * True if at least one navigation event has occurred,
   * false otherwise.
   */
  get navigated(): boolean {
    return untracked(this._navigated);
  }
  /** @deprecated */
  set navigated(v: boolean) {
    this._navigated.set(v);
  }
  /** @internal */
  _navigated = signal(false);

  /**
   * A strategy for re-using routes.
   *
   * @deprecated Configure using `providers` instead:
   *   `{provide: RouteReuseStrategy, useClass: MyStrategy}`.
   */
  routeReuseStrategy: RouteReuseStrategy = inject(RouteReuseStrategy);

  /**
   * How to handle a navigation request to the current URL.
   *
   *
   * @deprecated Configure this through `provideRouter` or `RouterModule.forRoot` instead.
   * @see {@link withRouterConfig}
   * @see {@link provideRouter}
   * @see {@link RouterModule}
   */
  onSameUrlNavigation: OnSameUrlNavigation = this.options.onSameUrlNavigation || 'ignore';

  config: Routes = inject(ROUTES, {optional: true})?.flat() ?? [];

  /**
   * Indicates whether the application has opted in to binding Router data to component inputs.
   *
   * This option is enabled by the `withComponentInputBinding` feature of `provideRouter` or
   * `bindToComponentInputs` in the `ExtraOptions` of `RouterModule.forRoot`.
   */
  readonly componentInputBindingEnabled: boolean = !!inject(INPUT_BINDER, {optional: true});

  constructor() {
    this.resetConfig(this.config);

    this.navigationTransitions.setupNavigations(this).subscribe({
      error: (e) => {
        this.console.warn(ngDevMode ? `Unhandled Navigation Error: ${e}` : e);
      },
    });
    this.subscribeToNavigationEvents();
  }

  private eventsSubscription = new Subscription();
  private subscribeToNavigationEvents() {
    const subscription = this.navigationTransitions.events.subscribe((e) => {
      try {
        const currentTransition = this.navigationTransitions.currentTransition;
        const currentNavigation = this.navigationTransitions.currentNavigation;
        if (currentTransition !== null && currentNavigation !== null) {
          this.stateManager.handleRouterEvent(e, currentNavigation);
          if (
            e instanceof NavigationCancel &&
            e.code !== NavigationCancellationCode.Redirect &&
            e.code !== NavigationCancellationCode.SupersededByNewNavigation
          ) {
            // It seems weird that `navigated` is set to `true` when the navigation is rejected,
            // however it's how things were written initially. Investigation would need to be done
            // to determine if this can be removed.
            this.navigated = true;
          } else if (e instanceof NavigationEnd) {
            this.navigated = true;
          } else if (e instanceof RedirectRequest) {
            const opts = e.navigationBehaviorOptions;
            const mergedTree = this.urlHandlingStrategy.merge(
              e.url,
              currentTransition.currentRawUrl,
            );
            const extras = {
              browserUrl: currentTransition.extras.browserUrl,
              info: currentTransition.extras.info,
              skipLocationChange: currentTransition.extras.skipLocationChange,
              // The URL is already updated at this point if we have 'eager' URL
              // updates or if the navigation was triggered by the browser (back
              // button, URL bar, etc). We want to replace that item in history
              // if the navigation is rejected.
              replaceUrl:
                currentTransition.extras.replaceUrl ||
                this.urlUpdateStrategy === 'eager' ||
                isBrowserTriggeredNavigation(currentTransition.source),
              // allow developer to override default options with RedirectCommand
              ...opts,
            };

            this.scheduleNavigation(mergedTree, IMPERATIVE_NAVIGATION, null, extras, {
              resolve: currentTransition.resolve,
              reject: currentTransition.reject,
              promise: currentTransition.promise,
            });
          }
        }
        // Note that it's important to have the Router process the events _before_ the event is
        // pushed through the public observable. This ensures the correct router state is in place
        // before applications observe the events.
        if (isPublicRouterEvent(e)) {
          this._events.next(e);
        }
      } catch (e: unknown) {
        this.navigationTransitions.transitionAbortWithErrorSubject.next(e as Error);
      }
    });
    this.eventsSubscription.add(subscription);
  }

  /** @internal */
  resetRootComponentType(rootComponentType: Type<any>): void {
    // TODO: vsavkin router 4.0 should make the root component set to null
    // this will simplify the lifecycle of the router.
    this.routerState.root.component = rootComponentType;
    this.navigationTransitions.rootComponentType = rootComponentType;
  }

  /**
   * Sets up the location change listener and performs the initial navigation.
   */
  initialNavigation(): void {
    this.setUpLocationChangeListener();
    if (!this.navigationTransitions.hasRequestedNavigation) {
      this.navigateToSyncWithBrowser(
        this.location.path(true),
        IMPERATIVE_NAVIGATION,
        this.stateManager.restoredState(),
      );
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
    this.nonRouterCurrentEntryChangeSubscription ??=
      this.stateManager.registerNonRouterCurrentEntryChangeListener((url, state, source) => {
        this.navigateToSyncWithBrowser(url, source, state);
      });
  }

  /**
   * Schedules a router navigation to synchronize Router state with the browser state.
   *
   * This is done as a response to a popstate event and the initial navigation. These
   * two scenarios represent times when the browser URL/state has been updated and
   * the Router needs to respond to ensure its internal state matches.
   */
  private navigateToSyncWithBrowser(
    url: string,
    source: NavigationTrigger,
    state: RestoredState | null | undefined,
  ) {
    const extras: NavigationExtras = {replaceUrl: true};

    // TODO: restoredState should always include the entire state, regardless
    // of navigationId. This requires a breaking change to update the type on
    // NavigationStart’s restoredState, which currently requires navigationId
    // to always be present. The Router used to only restore history state if
    // a navigationId was present.

    // The stored navigationId is used by the RouterScroller to retrieve the scroll
    // position for the page.
    const restoredState = state?.navigationId ? state : null;

    // Separate to NavigationStart.restoredState, we must also restore the state to
    // history.state and generate a new navigationId, since it will be overwritten
    if (state) {
      const stateCopy = {...state} as Partial<RestoredState>;
      delete stateCopy.navigationId;
      delete stateCopy.ɵrouterPageId;
      if (Object.keys(stateCopy).length !== 0) {
        extras.state = stateCopy;
      }
    }

    const urlTree = this.parseUrl(url);
    this.scheduleNavigation(urlTree, source, restoredState, extras).catch((e) => {
      if (this.disposed) {
        return;
      }
      this.injector.get(ɵINTERNAL_APPLICATION_ERROR_HANDLER)(e);
    });
  }

  /** The current URL. */
  get url(): string {
    return untracked(this._url);
  }
  private _url = computed(() => this.serializeUrl(this.currentUrlTree()));

  /**
   * Returns the current `Navigation` object when the router is navigating,
   * and `null` when idle.
   */
  getCurrentNavigation(): Navigation | null {
    return this.navigationTransitions.currentNavigation;
  }

  /**
   * The `Navigation` object of the most recent navigation to succeed and `null` if there
   *     has not been a successful navigation yet.
   */
  get lastSuccessfulNavigation(): Navigation | null {
    return this.navigationTransitions.lastSuccessfulNavigation;
  }

  /**
   * Resets the route configuration used for navigation and generating links.
   *
   * @param config The route array for the new configuration.
   *
   * @usageNotes
   *
   * ```ts
   * router.resetConfig([
   *  { path: 'team/:id', component: TeamCmp, children: [
   *    { path: 'simple', component: SimpleCmp },
   *    { path: 'user/:name', component: UserCmp }
   *  ]}
   * ]);
   * ```
   */
  resetConfig(config: Routes): void {
    (typeof ngDevMode === 'undefined' || ngDevMode) && validateConfig(config);
    this.config = config.map(standardizeConfig);
    this.navigated = false;
  }

  /** @docs-private */
  ngOnDestroy(): void {
    this.dispose();
  }

  /** Disposes of the router. */
  dispose(): void {
    // We call `unsubscribe()` to release observers, as users may forget to
    // unsubscribe manually when subscribing to `router.events`. We do not call
    // `complete()` because it is unsafe; if someone subscribes using the `first`
    // operator and the observable completes before emitting a value,
    // RxJS will throw an error.
    this._events.unsubscribe();
    this.navigationTransitions.complete();
    if (this.nonRouterCurrentEntryChangeSubscription) {
      this.nonRouterCurrentEntryChangeSubscription.unsubscribe();
      this.nonRouterCurrentEntryChangeSubscription = undefined;
    }
    this.disposed = true;
    this.eventsSubscription.unsubscribe();
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
  createUrlTree(commands: readonly any[], navigationExtras: UrlCreationOptions = {}): UrlTree {
    return untracked(this.createUrlTreeComputed(commands, navigationExtras));
  }

  /** @internal */
  createUrlTreeComputed(
    commands: readonly any[],
    navigationExtras: UrlCreationOptions = {},
  ): Signal<UrlTree> {
    const {relativeTo, queryParams, fragment, queryParamsHandling, preserveFragment} =
      navigationExtras;
    return computed(() => {
      const f = preserveFragment ? this.fragment() : fragment;
      let q: Params | null = null;
      switch (queryParamsHandling ?? this.options.defaultQueryParamsHandling) {
        case 'merge':
          q = {...this.queryParams(), ...queryParams};
          break;
        case 'preserve':
          q = this.queryParams();
          break;
        default:
          q = queryParams || null;
      }
      if (q !== null) {
        q = this.removeEmptyProps(q);
      }

      let relativeToUrlSegmentGroup: UrlSegmentGroup | undefined;
      try {
        const relativeToSnapshot = relativeTo
          ? relativeTo.snapshot
          : this.routerState.snapshot.root;
        relativeToUrlSegmentGroup = createSegmentGroupFromRoute(relativeToSnapshot);
      } catch (e: unknown) {
        // This is strictly for backwards compatibility with tests that create
        // invalid `ActivatedRoute` mocks.
        // Note: the difference between having this fallback for invalid `ActivatedRoute` setups and
        // just throwing is ~500 test failures. Fixing all of those tests by hand is not feasible at
        // the moment.
        if (typeof commands[0] !== 'string' || commands[0][0] !== '/') {
          // Navigations that were absolute in the old way of creating UrlTrees
          // would still work because they wouldn't attempt to match the
          // segments in the `ActivatedRoute` to the `currentUrlTree` but
          // instead just replace the root segment with the navigation result.
          // Non-absolute navigations would fail to apply the commands because
          // the logic could not find the segment to replace (so they'd act like there were no
          // commands).
          commands = [];
        }
        relativeToUrlSegmentGroup = this.currentUrlTree().root;
      }
      return createUrlTreeFromSegmentGroup(relativeToUrlSegmentGroup, commands, q, f ?? null);
    });
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
   * ```ts
   * router.navigateByUrl("/team/33/user/11");
   *
   * // Navigate without updating the URL
   * router.navigateByUrl("/team/33/user/11", { skipLocationChange: true });
   * ```
   *
   * @see [Routing and Navigation guide](guide/routing/common-router-tasks)
   *
   */
  navigateByUrl(
    url: string | UrlTree,
    extras: NavigationBehaviorOptions = {
      skipLocationChange: false,
    },
  ): Promise<boolean> {
    const urlTree = isUrlTree(url) ? url : this.parseUrl(url);
    const mergedTree = this.urlHandlingStrategy.merge(urlTree, untracked(this.rawUrlTree));

    return this.scheduleNavigation(mergedTree, IMPERATIVE_NAVIGATION, null, extras);
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
   * @returns A Promise that resolves to `true` when navigation succeeds, or `false` when navigation
   *     fails. The Promise is rejected when an error occurs if `resolveNavigationPromiseOnError` is
   * not `true`.
   *
   * @usageNotes
   *
   * The following calls request navigation to a dynamic route path relative to the current URL.
   *
   * ```ts
   * router.navigate(['team', 33, 'user', 11], {relativeTo: route});
   *
   * // Navigate without updating the URL, overriding the default behavior
   * router.navigate(['team', 33, 'user', 11], {relativeTo: route, skipLocationChange: true});
   * ```
   *
   * @see [Routing and Navigation guide](guide/routing/common-router-tasks)
   *
   */
  navigate(
    commands: readonly any[],
    extras: NavigationExtras = {skipLocationChange: false},
  ): Promise<boolean> {
    validateCommands(commands);
    return this.navigateByUrl(this.createUrlTree(commands, extras), extras);
  }

  /** Serializes a `UrlTree` into a string */
  serializeUrl(url: UrlTree): string {
    return this.urlSerializer.serialize(url);
  }

  /** Parses a string into a `UrlTree` */
  parseUrl(url: string): UrlTree {
    try {
      return this.urlSerializer.parse(url);
    } catch {
      return this.urlSerializer.parse('/');
    }
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
  isActive(url: string | UrlTree, exact: boolean): boolean;
  /**
   * Returns whether the url is activated.
   */
  isActive(url: string | UrlTree, matchOptions: IsActiveMatchOptions): boolean;
  /** @internal */
  isActive(url: string | UrlTree, matchOptions: boolean | IsActiveMatchOptions): boolean;
  isActive(url: string | UrlTree, matchOptions: boolean | IsActiveMatchOptions): boolean {
    return untracked(this._isActive(url, matchOptions));
  }
  /** @internal */
  _isActive(url: string | UrlTree, matchOptions: boolean | IsActiveMatchOptions): Signal<boolean> {
    let options: IsActiveMatchOptions;
    if (matchOptions === true) {
      options = {...exactMatchOptions};
    } else if (matchOptions === false) {
      options = {...subsetMatchOptions};
    } else {
      options = matchOptions;
    }

    return computed(() => {
      if (isUrlTree(url)) {
        return containsTree(this.currentUrlTree(), url, options);
      }

      const urlTree = this.parseUrl(url);
      return containsTree(this.currentUrlTree(), urlTree, options);
    });
  }

  private removeEmptyProps(params: Params): Params {
    return Object.entries(params).reduce((result: Params, [key, value]: [string, any]) => {
      if (value !== null && value !== undefined) {
        result[key] = value;
      }
      return result;
    }, {});
  }

  private scheduleNavigation(
    rawUrl: UrlTree,
    source: NavigationTrigger,
    restoredState: RestoredState | null,
    extras: NavigationExtras,
    priorPromise?: {
      resolve: (result: boolean | PromiseLike<boolean>) => void;
      reject: (reason?: any) => void;
      promise: Promise<boolean>;
    },
  ): Promise<boolean> {
    if (this.disposed) {
      return Promise.resolve(false);
    }

    let resolve: (result: boolean | PromiseLike<boolean>) => void;
    let reject: (reason?: any) => void;
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

    // Indicate that the navigation is happening.
    const taskId = this.pendingTasks.add();
    afterNextNavigation(this, () => {
      // Remove pending task in a microtask to allow for cancelled
      // initial navigations and redirects within the same task.
      queueMicrotask(() => this.pendingTasks.remove(taskId));
    });

    this.navigationTransitions.handleNavigationRequest({
      source,
      restoredState,
      currentUrlTree: untracked(this.currentUrlTree),
      currentRawUrl: untracked(this.currentUrlTree),
      rawUrl,
      extras,
      resolve: resolve!,
      reject: reject!,
      promise,
      currentSnapshot: this.routerState.snapshot,
      currentRouterState: this.routerState,
    });

    // Make sure that the error is propagated even though `processNavigations` catch
    // handler does not rethrow
    return promise.catch((e: any) => {
      return Promise.reject(e);
    });
  }
}

function validateCommands(commands: readonly string[]): void {
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    if (cmd == null) {
      throw new RuntimeError(
        RuntimeErrorCode.NULLISH_COMMAND,
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
          `The requested path contains ${cmd} segment at index ${i}`,
      );
    }
  }
}
