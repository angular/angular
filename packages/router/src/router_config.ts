/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '@angular/core';

import {OnSameUrlNavigation} from './models';
import {UrlSerializer, UrlTree} from './url_tree';


/**
 * Error handler that is invoked when a navigation error occurs.
 *
 * If the handler returns a value, the navigation Promise is resolved with this value.
 * If the handler throws an exception, the navigation Promise is rejected with
 * the exception.
 *
 * @publicApi
 * @deprecated Subscribe to the `Router` events and watch for `NavigationError` instead.
 */
export type ErrorHandler = (error: any) => any;

/**
 * Allowed values in an `ExtraOptions` object that configure
 * when the router performs the initial navigation operation.
 *
 * * 'enabledNonBlocking' - (default) The initial navigation starts after the
 * root component has been created. The bootstrap is not blocked on the completion of the initial
 * navigation.
 * * 'enabledBlocking' - The initial navigation starts before the root component is created.
 * The bootstrap is blocked until the initial navigation is complete. This value is required
 * for [server-side rendering](guide/universal) to work.
 * * 'disabled' - The initial navigation is not performed. The location listener is set up before
 * the root component gets created. Use if there is a reason to have
 * more control over when the router starts its initial navigation due to some complex
 * initialization logic.
 *
 * @see `forRoot()`
 *
 * @publicApi
 */
export type InitialNavigation = 'disabled'|'enabledBlocking'|'enabledNonBlocking';

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
  canceledNavigationResolution?: 'replace'|'computed';

  /**
   * Configures the default for handling a navigation request to the current URL.
   *
   * If unset, the `Router` will use `'ignore'`.
   *
   * @see `OnSameUrlNavigation`
   */
  onSameUrlNavigation?: OnSameUrlNavigation;

  /**
   * Defines how the router merges parameters, data, and resolved data from parent to child
   * routes. By default ('emptyOnly'), inherits parent parameters only for
   * path-less or component-less routes.
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
  paramsInheritanceStrategy?: 'emptyOnly'|'always';

  /**
   * Defines when the router updates the browser URL. By default ('deferred'),
   * update after successful navigation.
   * Set to 'eager' if prefer to update the URL at the beginning of navigation.
   * Updating the URL early allows you to handle a failure of navigation by
   * showing an error message with the URL that failed.
   */
  urlUpdateStrategy?: 'deferred'|'eager';
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
  anchorScrolling?: 'disabled'|'enabled';

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
   * ```typescript
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
  scrollPositionRestoration?: 'disabled'|'enabled'|'top';
}

/**
 * A set of configuration options for a router module, provided in the
 * `forRoot()` method.
 *
 * @see `forRoot()`
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
   * value is required for [server-side rendering](guide/universal) to work. When set to
   * `enabledNonBlocking`, the initial navigation starts after the root component has been created.
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
   * A custom error handler for failed navigations.
   * If the handler returns a value, the navigation Promise is resolved with this value.
   * If the handler throws an exception, the navigation Promise is rejected with the exception.
   *
   * @deprecated Subscribe to the `Router` events and watch for `NavigationError` instead.
   */
  errorHandler?: (error: any) => any;

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
  scrollOffset?: [number, number]|(() => [number, number]);

  /**
   * A custom handler for malformed URI errors. The handler is invoked when `encodedURI` contains
   * invalid character sequences.
   * The default implementation is to redirect to the root URL, dropping
   * any path or parameter information. The function takes three parameters:
   *
   * - `'URIError'` - Error thrown when parsing a bad URL.
   * - `'UrlSerializer'` - UrlSerializer that’s configured with the router.
   * - `'url'` -  The malformed URL that caused the URIError
   *
   * @deprecated URI parsing errors should be handled in the `UrlSerializer` instead.
   * */
  malformedUriErrorHandler?:
      (error: URIError, urlSerializer: UrlSerializer, url: string) => UrlTree;
}

/**
 * A [DI token](guide/glossary/#di-token) for the router service.
 *
 * @publicApi
 */
export const ROUTER_CONFIGURATION = new InjectionToken<ExtraOptions>(
    (typeof ngDevMode === 'undefined' || ngDevMode) ? 'router config' : '', {
      providedIn: 'root',
      factory: () => ({}),
    });
