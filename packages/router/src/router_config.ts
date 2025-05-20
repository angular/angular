/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';

import {OnSameUrlNavigation, QueryParamsHandling, RedirectCommand} from './models';

/**
 * Allowed values in an `ExtraOptions` object that configure
 * when the router performs the initial navigation operation.
 *
 * * 'enabledNonBlocking' - (default) The initial navigation starts after the
 * root component has been created. The bootstrap is not blocked on the completion of the initial
 * navigation.
 * * 'enabledBlocking' - The initial navigation starts before the root component is created.
 * The bootstrap is blocked until the initial navigation is complete. This value should be set in
 * case you use [server-side rendering](guide/ssr), but do not enable [hydration](guide/hydration)
 * for your application.
 * * 'disabled' - The initial navigation is not performed. The location listener is set up before
 * the root component gets created. Use if there is a reason to have
 * more control over when the router starts its initial navigation due to some complex
 * initialization logic.
 *
 * @see {@link /api/router/RouterModule#forRoot forRoot}
 *
 * @publicApi
 */
export type InitialNavigation = 'disabled' | 'enabledBlocking' | 'enabledNonBlocking';

/**
 * Extra configuration options that can be used with the `withRouterConfig` function.
 *
 * @publicApi
 */
export interface RouterConfigOptions {
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
   * The default value is `replace` when not set.
   */
  canceledNavigationResolution?: 'replace' | 'computed';

  /**
   * Configures the default for handling a navigation request to the current URL.
   *
   * If unset, the `Router` will use `'ignore'`.
   *
   * @see {@link OnSameUrlNavigation}
   */
  onSameUrlNavigation?: OnSameUrlNavigation;

  /**
   * Defines how the router merges parameters, data, and resolved data from parent to child
   * routes.
   *
   * By default ('emptyOnly'), a route inherits the parent route's parameters when the route itself
   * has an empty path (meaning its configured with path: '') or when the parent route doesn't have
   * any component set.
   *
   * Set to 'always' to enable unconditional inheritance of parent parameters.
   *
   * Note that when dealing with matrix parameters, "parent" refers to the parent `Route`
   * config which does not necessarily mean the "URL segment to the left". When the `Route` `path`
   * contains multiple segments, the matrix parameters must appear on the last segment. For example,
   * matrix parameters for `{path: 'a/b', component: MyComp}` should appear as `a/b;foo=bar` and not
   * `a;foo=bar/b`.
   *
   */
  paramsInheritanceStrategy?: 'emptyOnly' | 'always';

  /**
   * Defines when the router updates the browser URL. By default ('deferred'),
   * update after successful navigation.
   * Set to 'eager' if prefer to update the URL at the beginning of navigation.
   * Updating the URL early allows you to handle a failure of navigation by
   * showing an error message with the URL that failed.
   */
  urlUpdateStrategy?: 'deferred' | 'eager';

  /**
   * The default strategy to use for handling query params in `Router.createUrlTree` when one is not provided.
   *
   * The `createUrlTree` method is used internally by `Router.navigate` and `RouterLink`.
   * Note that `QueryParamsHandling` does not apply to `Router.navigateByUrl`.
   *
   * When neither the default nor the queryParamsHandling option is specified in the call to `createUrlTree`,
   * the current parameters will be replaced by new parameters.
   *
   * @see {@link Router#createUrlTree}
   * @see {@link QueryParamsHandling}
   */
  defaultQueryParamsHandling?: QueryParamsHandling;

  /**
   * When `true`, the `Promise` will instead resolve with `false`, as it does with other failed
   * navigations (for example, when guards are rejected).

   * Otherwise the `Promise` returned by the Router's navigation with be rejected
   * if an error occurs.
   */
  resolveNavigationPromiseOnError?: boolean;
}

/**
 * Configuration options for the scrolling feature which can be used with `withInMemoryScrolling`
 * function.
 *
 * @publicApi
 */
export interface InMemoryScrollingOptions {
  /**
   * When set to 'enabled', scrolls to the anchor element when the URL has a fragment.
   * Anchor scrolling is disabled by default.
   *
   * Anchor scrolling does not happen on 'popstate'. Instead, we restore the position
   * that we stored or scroll to the top.
   */
  anchorScrolling?: 'disabled' | 'enabled';

  /**
   * Configures if the scroll position needs to be restored when navigating back.
   *
   * * 'disabled'- (Default) Does nothing. Scroll position is maintained on navigation.
   * * 'top'- Sets the scroll position to x = 0, y = 0 on all navigation.
   * * 'enabled'- Restores the previous scroll position on backward navigation, else sets the
   * position to the anchor if one is provided, or sets the scroll position to [0, 0] (forward
   * navigation). This option will be the default in the future.
   *
   * You can implement custom scroll restoration behavior by adapting the enabled behavior as
   * in the following example.
   *
   * ```ts
   * class AppComponent {
   *   movieData: any;
   *
   *   constructor(private router: Router, private viewportScroller: ViewportScroller,
   * changeDetectorRef: ChangeDetectorRef) {
   *   router.events.pipe(filter((event: Event): event is Scroll => event instanceof Scroll)
   *     ).subscribe(e => {
   *       fetch('http://example.com/movies.json').then(response => {
   *         this.movieData = response.json();
   *         // update the template with the data before restoring scroll
   *         changeDetectorRef.detectChanges();
   *
   *         if (e.position) {
   *           viewportScroller.scrollToPosition(e.position);
   *         }
   *       });
   *     });
   *   }
   * }
   * ```
   */
  scrollPositionRestoration?: 'disabled' | 'enabled' | 'top';
}

/**
 * A set of configuration options for a router module, provided in the
 * `forRoot()` method.
 *
 * @see {@link /api/router/routerModule#forRoot forRoot}
 *
 *
 * @publicApi
 */
export interface ExtraOptions extends InMemoryScrollingOptions, RouterConfigOptions {
  /**
   * When true, log all internal navigation events to the console.
   * Use for debugging.
   */
  enableTracing?: boolean;

  /**
   * When true, enable the location strategy that uses the URL fragment
   * instead of the history API.
   */
  useHash?: boolean;

  /**
   * One of `enabled`, `enabledBlocking`, `enabledNonBlocking` or `disabled`.
   * When set to `enabled` or `enabledBlocking`, the initial navigation starts before the root
   * component is created. The bootstrap is blocked until the initial navigation is complete. This
   * value should be set in case you use [server-side rendering](guide/ssr), but do not enable
   * [hydration](guide/hydration) for your application. When set to `enabledNonBlocking`,
   * the initial navigation starts after the root component has been created.
   * The bootstrap is not blocked on the completion of the initial navigation. When set to
   * `disabled`, the initial navigation is not performed. The location listener is set up before the
   * root component gets created. Use if there is a reason to have more control over when the router
   * starts its initial navigation due to some complex initialization logic.
   */
  initialNavigation?: InitialNavigation;

  /**
   * When true, enables binding information from the `Router` state directly to the inputs of the
   * component in `Route` configurations.
   */
  bindToComponentInputs?: boolean;

  /**
   * When true, enables view transitions in the Router by running the route activation and
   * deactivation inside of `document.startViewTransition`.
   *
   * @see https://developer.chrome.com/docs/web-platform/view-transitions/
   * @see https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
   * @experimental 17.0
   */
  enableViewTransitions?: boolean;

  /**
   * A custom error handler for failed navigations.
   * If the handler returns a value, the navigation Promise is resolved with this value.
   * If the handler throws an exception, the navigation Promise is rejected with the exception.
   *
   * @see RouterConfigOptions
   */
  errorHandler?: (error: any) => RedirectCommand | any;

  /**
   * Configures a preloading strategy.
   * One of `PreloadAllModules` or `NoPreloading` (the default).
   */
  preloadingStrategy?: any;

  /**
   * Configures the scroll offset the router will use when scrolling to an element.
   *
   * When given a tuple with x and y position value,
   * the router uses that offset each time it scrolls.
   * When given a function, the router invokes the function every time
   * it restores scroll position.
   */
  scrollOffset?: [number, number] | (() => [number, number]);
}

/**
 * A DI token for the router service.
 *
 * @publicApi
 */
export const ROUTER_CONFIGURATION = new InjectionToken<ExtraOptions>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'router config' : '',
  {
    providedIn: 'root',
    factory: () => ({}),
  },
);
