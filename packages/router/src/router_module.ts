/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HashLocationStrategy, Location, LOCATION_INITIALIZED, LocationStrategy, PathLocationStrategy, ViewportScroller} from '@angular/common';
import {ANALYZE_FOR_ENTRY_COMPONENTS, APP_BOOTSTRAP_LISTENER, APP_INITIALIZER, ApplicationRef, Compiler, ComponentRef, ENVIRONMENT_INITIALIZER, Inject, inject, InjectFlags, InjectionToken, Injector, ModuleWithProviders, NgModule, NgProbeToken, Optional, Provider, SkipSelf, Type, ɵRuntimeError as RuntimeError} from '@angular/core';
import {of, Subject} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';

import {EmptyOutletComponent} from './components/empty_outlet';
import {RouterLink, RouterLinkWithHref} from './directives/router_link';
import {RouterLinkActive} from './directives/router_link_active';
import {RouterOutlet} from './directives/router_outlet';
import {RuntimeErrorCode} from './errors';
import {Event, NavigationCancel, NavigationCancellationCode, NavigationEnd, NavigationError, stringifyEvent} from './events';
import {Route, Routes} from './models';
import {DefaultTitleStrategy, TitleStrategy} from './page_title_strategy';
import {RouteReuseStrategy} from './route_reuse_strategy';
import {ErrorHandler, Router} from './router';
import {RouterConfigLoader, ROUTES} from './router_config_loader';
import {ChildrenOutletContexts} from './router_outlet_context';
import {PreloadingStrategy, RouterPreloader} from './router_preloader';
import {ROUTER_SCROLLER, RouterScroller} from './router_scroller';
import {ActivatedRoute} from './router_state';
import {UrlHandlingStrategy} from './url_handling_strategy';
import {DefaultUrlSerializer, UrlSerializer, UrlTree} from './url_tree';
import {flatten} from './utils/collection';

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

/**
 * The directives defined in the `RouterModule`.
 */
const ROUTER_DIRECTIVES =
    [RouterOutlet, RouterLink, RouterLinkWithHref, RouterLinkActive, EmptyOutletComponent];

/**
 * A [DI token](guide/glossary/#di-token) for the router service.
 *
 * @publicApi
 */
export const ROUTER_CONFIGURATION =
    new InjectionToken<ExtraOptions>(NG_DEV_MODE ? 'router config' : 'ROUTER_CONFIGURATION', {
      providedIn: 'root',
      factory: () => ({}),
    });

/**
 * @docsNotRequired
 */
export const ROUTER_FORROOT_GUARD = new InjectionToken<void>(
    NG_DEV_MODE ? 'router duplicate forRoot guard' : 'ROUTER_FORROOT_GUARD');

const ROUTER_PRELOADER = new InjectionToken<RouterPreloader>(NG_DEV_MODE ? 'router preloader' : '');

export const ROUTER_PROVIDERS: Provider[] = [
  Location,
  {provide: UrlSerializer, useClass: DefaultUrlSerializer},
  {
    provide: Router,
    useFactory: setupRouter,
    deps: [
      UrlSerializer, ChildrenOutletContexts, Location, Injector, Compiler, ROUTES,
      ROUTER_CONFIGURATION, DefaultTitleStrategy, [TitleStrategy, new Optional()],
      [UrlHandlingStrategy, new Optional()], [RouteReuseStrategy, new Optional()]
    ]
  },
  ChildrenOutletContexts,
  {provide: ActivatedRoute, useFactory: rootRoute, deps: [Router]},
  RouterConfigLoader,
];

export function routerNgProbeToken() {
  return new NgProbeToken('Router', Router);
}

/**
 * @description
 *
 * Adds directives and providers for in-app navigation among views defined in an application.
 * Use the Angular `Router` service to declaratively specify application states and manage state
 * transitions.
 *
 * You can import this NgModule multiple times, once for each lazy-loaded bundle.
 * However, only one `Router` service can be active.
 * To ensure this, there are two ways to register routes when importing this module:
 *
 * * The `forRoot()` method creates an `NgModule` that contains all the directives, the given
 * routes, and the `Router` service itself.
 * * The `forChild()` method creates an `NgModule` that contains all the directives and the given
 * routes, but does not include the `Router` service.
 *
 * @see [Routing and Navigation guide](guide/router) for an
 * overview of how the `Router` service should be used.
 *
 * @publicApi
 */
@NgModule({
  declarations: ROUTER_DIRECTIVES,
  exports: ROUTER_DIRECTIVES,
})
export class RouterModule {
  // Note: We are injecting the Router so it gets created eagerly...
  constructor(@Optional() @Inject(ROUTER_FORROOT_GUARD) guard: any, @Optional() router: Router) {}

  /**
   * Creates and configures a module with all the router providers and directives.
   * Optionally sets up an application listener to perform an initial navigation.
   *
   * When registering the NgModule at the root, import as follows:
   *
   * ```
   * @NgModule({
   *   imports: [RouterModule.forRoot(ROUTES)]
   * })
   * class MyNgModule {}
   * ```
   *
   * @param routes An array of `Route` objects that define the navigation paths for the application.
   * @param config An `ExtraOptions` configuration object that controls how navigation is performed.
   * @return The new `NgModule`.
   *
   */
  static forRoot(routes: Routes, config?: ExtraOptions): ModuleWithProviders<RouterModule> {
    return {
      ngModule: RouterModule,
      providers: [
        ROUTER_PROVIDERS,
        NG_DEV_MODE ? (config?.enableTracing ? provideTracing() : []) : [],
        provideRoutes(routes),
        {
          provide: ROUTER_FORROOT_GUARD,
          useFactory: provideForRootGuard,
          deps: [[Router, new Optional(), new SkipSelf()]]
        },
        {provide: ROUTER_CONFIGURATION, useValue: config ? config : {}},
        config?.useHash ? provideHashLocationStrategy() : providePathLocationStrategy(),
        provideRouterScroller(),
        config?.preloadingStrategy ? providePreloading(config.preloadingStrategy) : [],
        {provide: NgProbeToken, multi: true, useFactory: routerNgProbeToken},
        config?.initialNavigation ? provideInitialNavigation(config) : [],
        provideRouterInitializer(),
      ],
    };
  }

  /**
   * Creates a module with all the router directives and a provider registering routes,
   * without creating a new Router service.
   * When registering for submodules and lazy-loaded submodules, create the NgModule as follows:
   *
   * ```
   * @NgModule({
   *   imports: [RouterModule.forChild(ROUTES)]
   * })
   * class MyNgModule {}
   * ```
   *
   * @param routes An array of `Route` objects that define the navigation paths for the submodule.
   * @return The new NgModule.
   *
   */
  static forChild(routes: Routes): ModuleWithProviders<RouterModule> {
    return {ngModule: RouterModule, providers: [provideRoutes(routes)]};
  }
}

export function provideRouterScroller(): Provider {
  return {
    provide: ROUTER_SCROLLER,
    useFactory: () => {
      const router = inject(Router);
      const viewportScroller = inject(ViewportScroller);
      const config: ExtraOptions = inject(ROUTER_CONFIGURATION);
      if (config.scrollOffset) {
        viewportScroller.setOffset(config.scrollOffset);
      }
      return new RouterScroller(router, viewportScroller, config);
    },
  };
}

function provideHashLocationStrategy(): Provider {
  return {provide: LocationStrategy, useClass: HashLocationStrategy};
}

function providePathLocationStrategy(): Provider {
  return {provide: LocationStrategy, useClass: PathLocationStrategy};
}

export function provideForRootGuard(router: Router): any {
  if (NG_DEV_MODE && router) {
    throw new RuntimeError(
        RuntimeErrorCode.FOR_ROOT_CALLED_TWICE,
        `RouterModule.forRoot() called twice. Lazy loaded modules should use RouterModule.forChild() instead.`);
  }
  return 'guarded';
}

/**
 * Registers a [DI provider](guide/glossary#provider) for a set of routes.
 * @param routes The route configuration to provide.
 *
 * @usageNotes
 *
 * ```
 * @NgModule({
 *   imports: [RouterModule.forChild(ROUTES)],
 *   providers: [provideRoutes(EXTRA_ROUTES)]
 * })
 * class MyNgModule {}
 * ```
 *
 * @publicApi
 */
export function provideRoutes(routes: Routes): any {
  return [
    {provide: ANALYZE_FOR_ENTRY_COMPONENTS, multi: true, useValue: routes},
    {provide: ROUTES, multi: true, useValue: routes},
  ];
}

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
 * The following values have been [deprecated](guide/releases#deprecation-practices) since v11,
 * and should not be used for new applications.
 *
 * @see `forRoot()`
 *
 * @publicApi
 */
export type InitialNavigation = 'disabled'|'enabledBlocking'|'enabledNonBlocking';

/**
 * A set of configuration options for a router module, provided in the
 * `forRoot()` method.
 *
 * @see `forRoot()`
 *
 *
 * @publicApi
 */
export interface ExtraOptions {
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
   * A custom error handler for failed navigations.
   * If the handler returns a value, the navigation Promise is resolved with this value.
   * If the handler throws an exception, the navigation Promise is rejected with the exception.
   *
   */
  errorHandler?: ErrorHandler;

  /**
   * Configures a preloading strategy.
   * One of `PreloadAllModules` or `NoPreloading` (the default).
   */
  preloadingStrategy?: any;

  /**
   * Define what the router should do if it receives a navigation request to the current URL.
   * Default is `ignore`, which causes the router ignores the navigation.
   * This can disable features such as a "refresh" button.
   * Use this option to configure the behavior when navigating to the
   * current URL. Default is 'ignore'.
   */
  onSameUrlNavigation?: 'reload'|'ignore';

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

  /**
   * When set to 'enabled', scrolls to the anchor element when the URL has a fragment.
   * Anchor scrolling is disabled by default.
   *
   * Anchor scrolling does not happen on 'popstate'. Instead, we restore the position
   * that we stored or scroll to the top.
   */
  anchorScrolling?: 'disabled'|'enabled';

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
   * A custom handler for malformed URI errors. The handler is invoked when `encodedURI` contains
   * invalid character sequences.
   * The default implementation is to redirect to the root URL, dropping
   * any path or parameter information. The function takes three parameters:
   *
   * - `'URIError'` - Error thrown when parsing a bad URL.
   * - `'UrlSerializer'` - UrlSerializer that’s configured with the router.
   * - `'url'` -  The malformed URL that caused the URIError
   * */
  malformedUriErrorHandler?:
      (error: URIError, urlSerializer: UrlSerializer, url: string) => UrlTree;

  /**
   * Defines when the router updates the browser URL. By default ('deferred'),
   * update after successful navigation.
   * Set to 'eager' if prefer to update the URL at the beginning of navigation.
   * Updating the URL early allows you to handle a failure of navigation by
   * showing an error message with the URL that failed.
   */
  urlUpdateStrategy?: 'deferred'|'eager';

  /**
   * Enables a bug fix that corrects relative link resolution in components with empty paths.
   * Example:
   *
   * ```
   * const routes = [
   *   {
   *     path: '',
   *     component: ContainerComponent,
   *     children: [
   *       { path: 'a', component: AComponent },
   *       { path: 'b', component: BComponent },
   *     ]
   *   }
   * ];
   * ```
   *
   * From the `ContainerComponent`, you should be able to navigate to `AComponent` using
   * the following `routerLink`, but it will not work if `relativeLinkResolution` is set
   * to `'legacy'`:
   *
   * `<a [routerLink]="['./a']">Link to A</a>`
   *
   * However, this will work:
   *
   * `<a [routerLink]="['../a']">Link to A</a>`
   *
   * In other words, you're required to use `../` rather than `./` when the relative link
   * resolution is set to `'legacy'`.
   *
   * The default in v11 is `corrected`.
   *
   * @deprecated
   */
  relativeLinkResolution?: 'legacy'|'corrected';

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
}

export function setupRouter(
    urlSerializer: UrlSerializer, contexts: ChildrenOutletContexts, location: Location,
    injector: Injector, compiler: Compiler, config: Route[][], opts: ExtraOptions = {},
    defaultTitleStrategy: DefaultTitleStrategy, titleStrategy?: TitleStrategy,
    urlHandlingStrategy?: UrlHandlingStrategy, routeReuseStrategy?: RouteReuseStrategy) {
  const router =
      new Router(null, urlSerializer, contexts, location, injector, compiler, flatten(config));

  if (urlHandlingStrategy) {
    router.urlHandlingStrategy = urlHandlingStrategy;
  }

  if (routeReuseStrategy) {
    router.routeReuseStrategy = routeReuseStrategy;
  }

  router.titleStrategy = titleStrategy ?? defaultTitleStrategy;

  assignExtraOptionsToRouter(opts, router);

  return router;
}

export function assignExtraOptionsToRouter(opts: ExtraOptions, router: Router): void {
  if (opts.errorHandler) {
    router.errorHandler = opts.errorHandler;
  }

  if (opts.malformedUriErrorHandler) {
    router.malformedUriErrorHandler = opts.malformedUriErrorHandler;
  }

  if (opts.onSameUrlNavigation) {
    router.onSameUrlNavigation = opts.onSameUrlNavigation;
  }

  if (opts.paramsInheritanceStrategy) {
    router.paramsInheritanceStrategy = opts.paramsInheritanceStrategy;
  }

  if (opts.relativeLinkResolution) {
    router.relativeLinkResolution = opts.relativeLinkResolution;
  }

  if (opts.urlUpdateStrategy) {
    router.urlUpdateStrategy = opts.urlUpdateStrategy;
  }

  if (opts.canceledNavigationResolution) {
    router.canceledNavigationResolution = opts.canceledNavigationResolution;
  }
}

export function rootRoute(router: Router): ActivatedRoute {
  return router.routerState.root;
}

export function getBootstrapListener() {
  const injector = inject(Injector);
  return (bootstrappedComponentRef: ComponentRef<unknown>) => {
    const ref = injector.get(ApplicationRef);

    if (bootstrappedComponentRef !== ref.components[0]) {
      return;
    }

    const router = injector.get(Router);
    const bootstrapDone = injector.get(BOOTSTRAP_DONE);

    // Default case
    if (injector.get(INITIAL_NAVIGATION, null, InjectFlags.Optional) === null) {
      router.initialNavigation();
    }

    injector.get(ROUTER_PRELOADER, null, InjectFlags.Optional)?.setUpPreloading();
    injector.get(ROUTER_SCROLLER, null, InjectFlags.Optional)?.init();
    router.resetRootComponentType(ref.componentTypes[0]);
    bootstrapDone.next();
    bootstrapDone.complete();
  };
}

// TODO(atscott): This should not be in the public API
/**
 * A [DI token](guide/glossary/#di-token) for the router initializer that
 * is called after the app is bootstrapped.
 *
 * @publicApi
 */
export const ROUTER_INITIALIZER = new InjectionToken<(compRef: ComponentRef<any>) => void>(
    NG_DEV_MODE ? 'Router Initializer' : '');

function provideInitialNavigation(config: Pick<ExtraOptions, 'initialNavigation'>): Provider[] {
  return [
    config.initialNavigation === 'disabled' ? provideDisabledInitialNavigation() : [],
    config.initialNavigation === 'enabledBlocking' ? provideEnabledBlockingInitialNavigation() : [],
  ];
}

function provideRouterInitializer(): ReadonlyArray<Provider> {
  return [
    // ROUTER_INITIALIZER token should be removed. It's public API but shouldn't be. We can just
    // have `getBootstrapListener` directly attached to APP_BOOTSTRAP_LISTENER.
    {provide: ROUTER_INITIALIZER, useFactory: getBootstrapListener},
    {provide: APP_BOOTSTRAP_LISTENER, multi: true, useExisting: ROUTER_INITIALIZER},
  ];
}

/**
 * A subject used to indicate that the bootstrapping phase is done. When initial navigation is
 * `enabledBlocking`, the first navigation waits until bootstrapping is finished before continuing
 * to the activation phase.
 */
const BOOTSTRAP_DONE =
    new InjectionToken<Subject<void>>(NG_DEV_MODE ? 'bootstrap done indicator' : '', {
      factory: () => {
        return new Subject<void>();
      }
    });

function provideEnabledBlockingInitialNavigation(): Provider {
  return [
    {provide: INITIAL_NAVIGATION, useValue: 'enabledBlocking'},
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [Injector],
      useFactory: (injector: Injector) => {
        const locationInitialized: Promise<any> =
            injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
        let initNavigation = false;

        /**
         * Performs the given action once the router finishes its next/current navigation.
         *
         * If the navigation is canceled or errors without a redirect, the navigation is considered
         * complete. If the `NavigationEnd` event emits, the navigation is also considered complete.
         */
        function afterNextNavigation(action: () => void) {
          const router = injector.get(Router);
          router.events
              .pipe(
                  filter(
                      (e): e is NavigationEnd|NavigationCancel|NavigationError =>
                          e instanceof NavigationEnd || e instanceof NavigationCancel ||
                          e instanceof NavigationError),
                  map(e => {
                    if (e instanceof NavigationEnd) {
                      // Navigation assumed to succeed if we get `ActivationStart`
                      return true;
                    }
                    const redirecting = e instanceof NavigationCancel ?
                        (e.code === NavigationCancellationCode.Redirect ||
                         e.code === NavigationCancellationCode.SupersededByNewNavigation) :
                        false;
                    return redirecting ? null : false;
                  }),
                  filter((result): result is boolean => result !== null),
                  take(1),
                  )
              .subscribe(() => {
                action();
              });
        }

        return () => {
          return locationInitialized.then(() => {
            return new Promise(resolve => {
              const router = injector.get(Router);
              const bootstrapDone = injector.get(BOOTSTRAP_DONE);
              afterNextNavigation(() => {
                // Unblock APP_INITIALIZER in case the initial navigation was canceled or errored
                // without a redirect.
                resolve(true);
                initNavigation = true;
              });

              router.afterPreactivation = () => {
                // Unblock APP_INITIALIZER once we get to `afterPreactivation`. At this point, we
                // assume activation will complete successfully (even though this is not
                // guaranteed).
                resolve(true);
                // only the initial navigation should be delayed until bootstrapping is done.
                if (!initNavigation) {
                  return bootstrapDone.closed ? of(void 0) : bootstrapDone;
                  // subsequent navigations should not be delayed
                } else {
                  return of(void 0);
                }
              };
              router.initialNavigation();
            });
          });
        };
      }
    },
  ];
}

const INITIAL_NAVIGATION =
    new InjectionToken<'disabled'|'enabledBlocking'>(NG_DEV_MODE ? 'initial navigation' : '');

function provideDisabledInitialNavigation(): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const router = inject(Router);
        return () => {
          router.setUpLocationChangeListener();
        };
      }
    },
    {provide: INITIAL_NAVIGATION, useValue: 'disabled'}
  ];
}

function provideTracing(): Provider[] {
  if (NG_DEV_MODE) {
    return [{
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useFactory: () => {
        const router = inject(Router);
        return () => router.events.subscribe((e: Event) => {
          // tslint:disable:no-console
          console.group?.(`Router Event: ${(<any>e.constructor).name}`);
          console.log(stringifyEvent(e));
          console.log(e);
          console.groupEnd?.();
          // tslint:enable:no-console
        });
      }
    }];
  } else {
    return [];
  }
}

export function providePreloading(preloadingStrategy: Type<PreloadingStrategy>): Provider[] {
  return [
    RouterPreloader,
    {provide: ROUTER_PRELOADER, useExisting: RouterPreloader},
    {provide: PreloadingStrategy, useExisting: preloadingStrategy},
  ];
}
