/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location} from '@angular/common';
import {inject, Injectable, NgZone, Type, ɵConsole as Console, ɵInitialRenderPendingTasks as InitialRenderPendingTasks, ɵRuntimeError as RuntimeError} from '@angular/core';
import {Observable, of, SubscriptionLike} from 'rxjs';

import {createSegmentGroupFromRoute, createUrlTreeFromSegmentGroup} from './create_url_tree';
import {INPUT_BINDER} from './directives/router_outlet';
import {RuntimeErrorCode} from './errors';
import {Event, IMPERATIVE_NAVIGATION, NavigationTrigger} from './events';
import {NavigationBehaviorOptions, OnSameUrlNavigation, Routes} from './models';
import {Navigation, NavigationExtras, NavigationTransition, NavigationTransitions, RestoredState, UrlCreationOptions} from './navigation_transition';
import {TitleStrategy} from './page_title_strategy';
import {RouteReuseStrategy} from './route_reuse_strategy';
import {ROUTER_CONFIGURATION} from './router_config';
import {ROUTES} from './router_config_loader';
import {createEmptyState, RouterState} from './router_state';
import {Params} from './shared';
import {UrlHandlingStrategy} from './url_handling_strategy';
import {containsTree, IsActiveMatchOptions, isUrlTree, UrlSegmentGroup, UrlSerializer, UrlTree} from './url_tree';
import {standardizeConfig, validateConfig} from './utils/config';
import {afterNextNavigation} from './utils/navigations';



function defaultErrorHandler(error: any): any {
  throw error;
}

function defaultMalformedUriErrorHandler(
    error: URIError, urlSerializer: UrlSerializer, url: string): UrlTree {
  return urlSerializer.parse('/');
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
@Injectable({providedIn: 'root'})
export class Router {
  /**
   * Represents the activated `UrlTree` that the `Router` is configured to handle (through
   * `UrlHandlingStrategy`). That is, after we find the route config tree that we're going to
   * activate, run guards, and are just about to activate the route, we set the currentUrlTree.
   *
   * This should match the `browserUrlTree` when a navigation succeeds. If the
   * `UrlHandlingStrategy.shouldProcessUrl` is `false`, only the `browserUrlTree` is updated.
   * @internal
   */
  currentUrlTree: UrlTree;
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
   * @internal
   *
   * Note that this is _only_ here to support `UrlHandlingStrategy.extract` and
   * `UrlHandlingStrategy.shouldProcessUrl`. If those didn't exist, we could get by with
   * `currentUrlTree` alone. If a new Router were to be provided (i.e. one that works with the
   * browser navigation API), we should think about whether this complexity should be carried over.
   *
   * - extract: `rawUrlTree` is needed because `extract` may only return part
   * of the navigation URL. Thus, `currentUrlTree` may only represent _part_ of the browser URL.
   * When a navigation gets cancelled and we need to reset the URL or a new navigation occurs, we
   * need to know the _whole_ browser URL, not just the part handled by UrlHandlingStrategy.
   * - shouldProcessUrl: When this returns `false`, the router just ignores the navigation but still
   * updates the `rawUrlTree` with the assumption that the navigation was caused by the location
   * change listener due to a URL update by the AngularJS router. In this case, we still need to
   * know what the browser's URL is for future navigations.
   *
   */
  rawUrlTree: UrlTree;
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
   * @internal
   */
  browserUrlTree: UrlTree;
  private disposed = false;

  private locationSubscription?: SubscriptionLike;
  // TODO(b/260747083): This should not exist and navigationId should be private in
  // `NavigationTransitions`
  private get navigationId() {
    return this.navigationTransitions.navigationId;
  }

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
    if (this.canceledNavigationResolution !== 'computed') {
      return undefined;
    }
    return (this.location.getState() as RestoredState | null)?.ɵrouterPageId;
  }
  private console = inject(Console);
  private isNgZoneEnabled: boolean = false;

  /**
   * An event stream for routing events.
   */
  public get events(): Observable<Event> {
    // TODO(atscott): This _should_ be events.asObservable(). However, this change requires internal
    // cleanup: tests are doing `(route.events as Subject<Event>).next(...)`. This isn't
    // allowed/supported but we still have to fix these or file bugs against the teams before making
    // the change.
    return this.navigationTransitions.events;
  }
  /**
   * The current state of routing in this NgModule.
   */
  public readonly routerState: RouterState;

  private options = inject(ROUTER_CONFIGURATION, {optional: true}) || {};

  private pendingTasks = inject(InitialRenderPendingTasks);

  /**
   * A handler for navigation errors in this NgModule.
   *
   * @deprecated Subscribe to the `Router` events and watch for `NavigationError` instead.
   *   `provideRouter` has the `withNavigationErrorHandler` feature to make this easier.
   * @see `withNavigationErrorHandler`
   */
  errorHandler = this.options.errorHandler || defaultErrorHandler;

  /**
   * A handler for errors thrown by `Router.parseUrl(url)`
   * when `url` contains an invalid character.
   * The most common case is a `%` sign
   * that's not encoded and is not part of a percent encoded sequence.
   *
   * @deprecated URI parsing errors should be handled in the `UrlSerializer`.
   *
   * @see `RouterModule`
   */
  malformedUriErrorHandler =
      this.options.malformedUriErrorHandler || defaultMalformedUriErrorHandler;

  /**
   * True if at least one navigation event has occurred,
   * false otherwise.
   */
  navigated: boolean = false;
  private lastSuccessfulId: number = -1;

  /**
   * A strategy for extracting and merging URLs.
   * Used for AngularJS to Angular migrations.
   *
   * @deprecated Configure using `providers` instead:
   *   `{provide: UrlHandlingStrategy, useClass: MyStrategy}`.
   */
  urlHandlingStrategy = inject(UrlHandlingStrategy);

  /**
   * A strategy for re-using routes.
   *
   * @deprecated Configure using `providers` instead:
   *   `{provide: RouteReuseStrategy, useClass: MyStrategy}`.
   */
  routeReuseStrategy = inject(RouteReuseStrategy);

  /**
   * A strategy for setting the title based on the `routerState`.
   *
   * @deprecated Configure using `providers` instead:
   *   `{provide: TitleStrategy, useClass: MyStrategy}`.
   */
  titleStrategy?: TitleStrategy = inject(TitleStrategy);

  /**
   * How to handle a navigation request to the current URL.
   *
   *
   * @deprecated Configure this through `provideRouter` or `RouterModule.forRoot` instead.
   * @see `withRouterConfig`
   * @see `provideRouter`
   * @see `RouterModule`
   */
  onSameUrlNavigation: OnSameUrlNavigation = this.options.onSameUrlNavigation || 'ignore';

  /**
   * How to merge parameters, data, resolved data, and title from parent to child
   * routes. One of:
   *
   * - `'emptyOnly'` : Inherit parent parameters, data, and resolved data
   * for path-less or component-less routes.
   * - `'always'` : Inherit parent parameters, data, and resolved data
   * for all child routes.
   *
   * @deprecated Configure this through `provideRouter` or `RouterModule.forRoot` instead.
   * @see `withRouterConfig`
   * @see `provideRouter`
   * @see `RouterModule`
   */
  paramsInheritanceStrategy: 'emptyOnly'|'always' =
      this.options.paramsInheritanceStrategy || 'emptyOnly';

  /**
   * Determines when the router updates the browser URL.
   * By default (`"deferred"`), updates the browser URL after navigation has finished.
   * Set to `'eager'` to update the browser URL at the beginning of navigation.
   * You can choose to update early so that, if navigation fails,
   * you can show an error message with the URL that failed.
   *
   * @deprecated Configure this through `provideRouter` or `RouterModule.forRoot` instead.
   * @see `withRouterConfig`
   * @see `provideRouter`
   * @see `RouterModule`
   */
  urlUpdateStrategy: 'deferred'|'eager' = this.options.urlUpdateStrategy || 'deferred';

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
   * @deprecated Configure this through `provideRouter` or `RouterModule.forRoot` instead.
   * @see `withRouterConfig`
   * @see `provideRouter`
   * @see `RouterModule`
   */
  canceledNavigationResolution: 'replace'|'computed' =
      this.options.canceledNavigationResolution || 'replace';

  config: Routes = inject(ROUTES, {optional: true})?.flat() ?? [];

  private readonly navigationTransitions = inject(NavigationTransitions);
  private readonly urlSerializer = inject(UrlSerializer);
  private readonly location = inject(Location);

  /**
   * Indicates whether the the application has opted in to binding Router data to component inputs.
   *
   * This option is enabled by the `withComponentInputBinding` feature of `provideRouter` or
   * `bindToComponentInputs` in the `ExtraOptions` of `RouterModule.forRoot`.
   */
  readonly componentInputBindingEnabled = !!inject(INPUT_BINDER, {optional: true});

  constructor() {
    this.isNgZoneEnabled = inject(NgZone) instanceof NgZone && NgZone.isInAngularZone();

    this.resetConfig(this.config);
    this.currentUrlTree = new UrlTree();
    this.rawUrlTree = this.currentUrlTree;
    this.browserUrlTree = this.currentUrlTree;

    this.routerState = createEmptyState(this.currentUrlTree, null);

    this.navigationTransitions.setupNavigations(this).subscribe(
        t => {
          this.lastSuccessfulId = t.id;
          this.currentPageId = this.browserPageId ?? 0;
        },
        e => {
          this.console.warn(`Unhandled Navigation Error: ${e}`);
        });
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
      const state = this.location.getState() as RestoredState;
      this.navigateToSyncWithBrowser(this.location.path(true), IMPERATIVE_NAVIGATION, state);
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
            this.navigateToSyncWithBrowser(event['url']!, source, event.state);
          }, 0);
        }
      });
    }
  }

  /**
   * Schedules a router navigation to synchronize Router state with the browser state.
   *
   * This is done as a response to a popstate event and the initial navigation. These
   * two scenarios represent times when the browser URL/state has been updated and
   * the Router needs to respond to ensure its internal state matches.
   */
  private navigateToSyncWithBrowser(
      url: string, source: NavigationTrigger, state: RestoredState|undefined) {
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
    this.scheduleNavigation(urlTree, source, restoredState, extras);
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
    return this.navigationTransitions.currentNavigation;
  }

  /**
   * The `Navigation` object of the most recent navigation to succeed and `null` if there
   *     has not been a successful navigation yet.
   */
  get lastSuccessfulNavigation(): Navigation|null {
    return this.navigationTransitions.lastSuccessfulNavigation;
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
    (typeof ngDevMode === 'undefined' || ngDevMode) && validateConfig(config);
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
    this.navigationTransitions.complete();
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

    let relativeToUrlSegmentGroup: UrlSegmentGroup|undefined;
    try {
      const relativeToSnapshot = relativeTo ? relativeTo.snapshot : this.routerState.snapshot.root;
      relativeToUrlSegmentGroup = createSegmentGroupFromRoute(relativeToSnapshot);
    } catch (e: unknown) {
      // This is strictly for backwards compatibility with tests that create
      // invalid `ActivatedRoute` mocks.
      // Note: the difference between having this fallback for invalid `ActivatedRoute` setups and
      // just throwing is ~500 test failures. Fixing all of those tests by hand is not feasible at
      // the moment.
      if (typeof commands[0] !== 'string' || !commands[0].startsWith('/')) {
        // Navigations that were absolute in the old way of creating UrlTrees
        // would still work because they wouldn't attempt to match the
        // segments in the `ActivatedRoute` to the `currentUrlTree` but
        // instead just replace the root segment with the navigation result.
        // Non-absolute navigations would fail to apply the commands because
        // the logic could not find the segment to replace (so they'd act like there were no
        // commands).
        commands = [];
      }
      relativeToUrlSegmentGroup = this.currentUrlTree.root;
    }
    return createUrlTreeFromSegmentGroup(relativeToUrlSegmentGroup, commands, q, f ?? null);
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
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (this.isNgZoneEnabled && !NgZone.isInAngularZone()) {
        this.console.warn(
            `Navigation triggered outside Angular zone, did you forget to call 'ngZone.run()'?`);
      }
    }

    const urlTree = isUrlTree(url) ? url : this.parseUrl(url);
    const mergedTree = this.urlHandlingStrategy.merge(urlTree, this.rawUrlTree);

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

  /** @internal */
  scheduleNavigation(
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

    // Indicate that the navigation is happening.
    const taskId = this.pendingTasks.add();
    afterNextNavigation(this, () => {
      // Remove pending task in a microtask to allow for cancelled
      // initial navigations and redirects within the same task.
      Promise.resolve().then(() => this.pendingTasks.remove(taskId));
    });

    this.navigationTransitions.handleNavigationRequest({
      source,
      restoredState,
      currentUrlTree: this.currentUrlTree,
      currentRawUrl: this.currentUrlTree,
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

  /** @internal */
  setBrowserUrl(url: UrlTree, transition: NavigationTransition) {
    const path = this.urlSerializer.serialize(url);
    if (this.location.isCurrentPathEqualTo(path) || !!transition.extras.replaceUrl) {
      // replacements do not update the target page
      const currentBrowserPageId = this.browserPageId;
      const state = {
        ...transition.extras.state,
        ...this.generateNgRouterState(transition.id, currentBrowserPageId)
      };
      this.location.replaceState(path, '', state);
    } else {
      const state = {
        ...transition.extras.state,
        ...this.generateNgRouterState(transition.id, (this.browserPageId ?? 0) + 1)
      };
      this.location.go(path, '', state);
    }
  }

  /**
   * Performs the necessary rollback action to restore the browser URL to the
   * state before the transition.
   * @internal
   */
  restoreHistory(transition: NavigationTransition, restoringFromCaughtError = false) {
    if (this.canceledNavigationResolution === 'computed') {
      const currentBrowserPageId = this.browserPageId ?? this.currentPageId;
      const targetPagePosition = this.currentPageId - currentBrowserPageId;
      if (targetPagePosition !== 0) {
        this.location.historyGo(targetPagePosition);
      } else if (
          this.currentUrlTree === this.getCurrentNavigation()?.finalUrl &&
          targetPagePosition === 0) {
        // We got to the activation stage (where currentUrlTree is set to the navigation's
        // finalUrl), but we weren't moving anywhere in history (skipLocationChange or replaceUrl).
        // We still need to reset the router state back to what it was when the navigation started.
        this.resetState(transition);
        // TODO(atscott): resetting the `browserUrlTree` should really be done in `resetState`.
        // Investigate if this can be done by running TGP.
        this.browserUrlTree = transition.currentUrlTree;
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
        this.resetState(transition);
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
          (typeof ngDevMode === 'undefined' || ngDevMode) &&
              `The requested path contains ${cmd} segment at index ${i}`);
    }
  }
}
