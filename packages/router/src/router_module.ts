/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  HashLocationStrategy,
  Location,
  LocationStrategy,
  PathLocationStrategy,
  ViewportScroller,
} from '@angular/common';
import {
  APP_BOOTSTRAP_LISTENER,
  ComponentRef,
  inject,
  Inject,
  InjectionToken,
  ModuleWithProviders,
  NgModule,
  NgZone,
  Optional,
  Provider,
  SkipSelf,
  ɵRuntimeError as RuntimeError,
} from '@angular/core';

import {EmptyOutletComponent} from './components/empty_outlet';
import {RouterLink} from './directives/router_link';
import {RouterLinkActive} from './directives/router_link_active';
import {RouterOutlet} from './directives/router_outlet';
import {RuntimeErrorCode} from './errors';
import {Routes} from './models';
import {NAVIGATION_ERROR_HANDLER, NavigationTransitions} from './navigation_transition';
import {
  getBootstrapListener,
  rootRoute,
  ROUTER_IS_PROVIDED,
  withComponentInputBinding,
  withDebugTracing,
  withDisabledInitialNavigation,
  withEnabledBlockingInitialNavigation,
  withPreloading,
  withViewTransitions,
} from './provide_router';
import {Router} from './router';
import {ExtraOptions, ROUTER_CONFIGURATION} from './router_config';
import {RouterConfigLoader, ROUTES} from './router_config_loader';
import {ChildrenOutletContexts} from './router_outlet_context';
import {ROUTER_SCROLLER, RouterScroller} from './router_scroller';
import {ActivatedRoute} from './router_state';
import {DefaultUrlSerializer, UrlSerializer} from './url_tree';

/**
 * The directives defined in the `RouterModule`.
 */
const ROUTER_DIRECTIVES = [RouterOutlet, RouterLink, RouterLinkActive, EmptyOutletComponent];

/**
 * @docsNotRequired
 */
export const ROUTER_FORROOT_GUARD = new InjectionToken<void>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'router duplicate forRoot guard' : '',
);

// TODO(atscott): All of these except `ActivatedRoute` are `providedIn: 'root'`. They are only kept
// here to avoid a breaking change whereby the provider order matters based on where the
// `RouterModule`/`RouterTestingModule` is imported. These can/should be removed as a "breaking"
// change in a major version.
export const ROUTER_PROVIDERS: Provider[] = [
  Location,
  {provide: UrlSerializer, useClass: DefaultUrlSerializer},
  Router,
  ChildrenOutletContexts,
  {provide: ActivatedRoute, useFactory: rootRoute},
  RouterConfigLoader,
  // Only used to warn when `provideRoutes` is used without `RouterModule` or `provideRouter`. Can
  // be removed when `provideRoutes` is removed.
  typeof ngDevMode === 'undefined' || ngDevMode
    ? {provide: ROUTER_IS_PROVIDED, useValue: true}
    : [],
];

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
 * @see [Routing and Navigation guide](guide/routing/common-router-tasks) for an
 * overview of how the `Router` service should be used.
 *
 * @publicApi
 */
@NgModule({
  imports: ROUTER_DIRECTIVES,
  exports: ROUTER_DIRECTIVES,
})
export class RouterModule {
  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      inject(ROUTER_FORROOT_GUARD, {optional: true});
    }
  }

  /**
   * Creates and configures a module with all the router providers and directives.
   * Optionally sets up an application listener to perform an initial navigation.
   *
   * When registering the NgModule at the root, import as follows:
   *
   * ```ts
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
        typeof ngDevMode === 'undefined' || ngDevMode
          ? config?.enableTracing
            ? withDebugTracing().ɵproviders
            : []
          : [],
        {provide: ROUTES, multi: true, useValue: routes},
        typeof ngDevMode === 'undefined' || ngDevMode
          ? {
              provide: ROUTER_FORROOT_GUARD,
              useFactory: provideForRootGuard,
            }
          : [],
        config?.errorHandler
          ? {
              provide: NAVIGATION_ERROR_HANDLER,
              useValue: config.errorHandler,
            }
          : [],
        {provide: ROUTER_CONFIGURATION, useValue: config ? config : {}},
        config?.useHash ? provideHashLocationStrategy() : providePathLocationStrategy(),
        provideRouterScroller(),
        config?.preloadingStrategy ? withPreloading(config.preloadingStrategy).ɵproviders : [],
        config?.initialNavigation ? provideInitialNavigation(config) : [],
        config?.bindToComponentInputs ? withComponentInputBinding().ɵproviders : [],
        config?.enableViewTransitions ? withViewTransitions().ɵproviders : [],
        provideRouterInitializer(),
      ],
    };
  }

  /**
   * Creates a module with all the router directives and a provider registering routes,
   * without creating a new Router service.
   * When registering for submodules and lazy-loaded submodules, create the NgModule as follows:
   *
   * ```ts
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
    return {
      ngModule: RouterModule,
      providers: [{provide: ROUTES, multi: true, useValue: routes}],
    };
  }
}

/**
 * For internal use by `RouterModule` only. Note that this differs from `withInMemoryRouterScroller`
 * because it reads from the `ExtraOptions` which should not be used in the standalone world.
 */
export function provideRouterScroller(): Provider {
  return {
    provide: ROUTER_SCROLLER,
    useFactory: () => {
      const viewportScroller = inject(ViewportScroller);
      const zone = inject(NgZone);
      const config: ExtraOptions = inject(ROUTER_CONFIGURATION);
      const transitions = inject(NavigationTransitions);
      const urlSerializer = inject(UrlSerializer);
      if (config.scrollOffset) {
        viewportScroller.setOffset(config.scrollOffset);
      }
      return new RouterScroller(urlSerializer, transitions, viewportScroller, zone, config);
    },
  };
}

// Note: For internal use only with `RouterModule`. Standalone setup via `provideRouter` should
// provide hash location directly via `{provide: LocationStrategy, useClass: HashLocationStrategy}`.
function provideHashLocationStrategy(): Provider {
  return {provide: LocationStrategy, useClass: HashLocationStrategy};
}

// Note: For internal use only with `RouterModule`. Standalone setup via `provideRouter` does not
// need this at all because `PathLocationStrategy` is the default factory for `LocationStrategy`.
function providePathLocationStrategy(): Provider {
  return {provide: LocationStrategy, useClass: PathLocationStrategy};
}

export function provideForRootGuard(): any {
  const router = inject(Router, {optional: true, skipSelf: true});

  if (router) {
    throw new RuntimeError(
      RuntimeErrorCode.FOR_ROOT_CALLED_TWICE,
      `The Router was provided more than once. This can happen if 'forRoot' is used outside of the root injector.` +
        ` Lazy loaded modules should use RouterModule.forChild() instead.`,
    );
  }
  return 'guarded';
}

// Note: For internal use only with `RouterModule`. Standalone router setup with `provideRouter`
// users call `withXInitialNavigation` directly.
function provideInitialNavigation(config: Pick<ExtraOptions, 'initialNavigation'>): Provider[] {
  return [
    config.initialNavigation === 'disabled' ? withDisabledInitialNavigation().ɵproviders : [],
    config.initialNavigation === 'enabledBlocking'
      ? withEnabledBlockingInitialNavigation().ɵproviders
      : [],
  ];
}

// TODO(atscott): This should not be in the public API
/**
 * A DI token for the router initializer that
 * is called after the app is bootstrapped.
 *
 * @publicApi
 */
export const ROUTER_INITIALIZER = new InjectionToken<(compRef: ComponentRef<any>) => void>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'Router Initializer' : '',
);

function provideRouterInitializer(): Provider[] {
  return [
    // ROUTER_INITIALIZER token should be removed. It's public API but shouldn't be. We can just
    // have `getBootstrapListener` directly attached to APP_BOOTSTRAP_LISTENER.
    {provide: ROUTER_INITIALIZER, useFactory: getBootstrapListener},
    {provide: APP_BOOTSTRAP_LISTENER, multi: true, useExisting: ROUTER_INITIALIZER},
  ];
}
