/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  HashLocationStrategy,
  LOCATION_INITIALIZED,
  LocationStrategy,
  ViewportScroller,
} from '@angular/common';
import {
  APP_BOOTSTRAP_LISTENER,
  ApplicationRef,
  ComponentRef,
  ENVIRONMENT_INITIALIZER,
  EnvironmentProviders,
  inject,
  InjectionToken,
  Injector,
  makeEnvironmentProviders,
  NgZone,
  provideAppInitializer,
  Provider,
  runInInjectionContext,
  Type,
  ɵperformanceMarkFeature as performanceMarkFeature,
} from '@angular/core';
import {of, Subject} from 'rxjs';

import {INPUT_BINDER, RoutedComponentInputBinder} from './directives/router_outlet';
import {Event, NavigationError, stringifyEvent} from './events';
import {RedirectCommand, Routes} from './models';
import {NAVIGATION_ERROR_HANDLER, NavigationTransitions} from './navigation_transition';
import {Router} from './router';
import {InMemoryScrollingOptions, ROUTER_CONFIGURATION, RouterConfigOptions} from './router_config';
import {ROUTES} from './router_config_loader';
import {PreloadingStrategy, RouterPreloader} from './router_preloader';
import {ROUTER_SCROLLER, RouterScroller} from './router_scroller';
import {ActivatedRoute} from './router_state';
import {UrlSerializer} from './url_tree';
import {afterNextNavigation} from './utils/navigations';
import {
  CREATE_VIEW_TRANSITION,
  createViewTransition,
  VIEW_TRANSITION_OPTIONS,
  ViewTransitionsFeatureOptions,
} from './utils/view_transition';

/**
 * Sets up providers necessary to enable `Router` functionality for the application.
 * Allows to configure a set of routes as well as extra features that should be enabled.
 *
 * @usageNotes
 *
 * Basic example of how you can add a Router to your application:
 * ```ts
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent, {
 *   providers: [provideRouter(appRoutes)]
 * });
 * ```
 *
 * You can also enable optional features in the Router by adding functions from the `RouterFeatures`
 * type:
 * ```ts
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes,
 *         withDebugTracing(),
 *         withRouterConfig({paramsInheritanceStrategy: 'always'}))
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link RouterFeatures}
 *
 * @publicApi
 * @param routes A set of `Route`s to use for the application routing table.
 * @param features Optional features to configure additional router behaviors.
 * @returns A set of providers to setup a Router.
 */
export function provideRouter(routes: Routes, ...features: RouterFeatures[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: ROUTES, multi: true, useValue: routes},
    typeof ngDevMode === 'undefined' || ngDevMode
      ? {provide: ROUTER_IS_PROVIDED, useValue: true}
      : [],
    {provide: ActivatedRoute, useFactory: rootRoute, deps: [Router]},
    {provide: APP_BOOTSTRAP_LISTENER, multi: true, useFactory: getBootstrapListener},
    features.map((feature) => feature.ɵproviders),
  ]);
}

export function rootRoute(router: Router): ActivatedRoute {
  return router.routerState.root;
}

/**
 * Helper type to represent a Router feature.
 *
 * @publicApi
 */
export interface RouterFeature<FeatureKind extends RouterFeatureKind> {
  ɵkind: FeatureKind;
  ɵproviders: Array<Provider | EnvironmentProviders>;
}

/**
 * Helper function to create an object that represents a Router feature.
 */
function routerFeature<FeatureKind extends RouterFeatureKind>(
  kind: FeatureKind,
  providers: Array<Provider | EnvironmentProviders>,
): RouterFeature<FeatureKind> {
  return {ɵkind: kind, ɵproviders: providers};
}

/**
 * An Injection token used to indicate whether `provideRouter` or `RouterModule.forRoot` was ever
 * called.
 */
export const ROUTER_IS_PROVIDED = new InjectionToken<boolean>('', {
  providedIn: 'root',
  factory: () => false,
});

const routerIsProvidedDevModeCheck = {
  provide: ENVIRONMENT_INITIALIZER,
  multi: true,
  useFactory() {
    return () => {
      if (!inject(ROUTER_IS_PROVIDED)) {
        console.warn(
          '`provideRoutes` was called without `provideRouter` or `RouterModule.forRoot`. ' +
            'This is likely a mistake.',
        );
      }
    };
  },
};

/**
 * Registers a DI provider for a set of routes.
 * @param routes The route configuration to provide.
 *
 * @usageNotes
 *
 * ```ts
 * @NgModule({
 *   providers: [provideRoutes(ROUTES)]
 * })
 * class LazyLoadedChildModule {}
 * ```
 *
 * @deprecated If necessary, provide routes using the `ROUTES` `InjectionToken`.
 * @see {@link ROUTES}
 * @publicApi
 */
export function provideRoutes(routes: Routes): Provider[] {
  return [
    {provide: ROUTES, multi: true, useValue: routes},
    typeof ngDevMode === 'undefined' || ngDevMode ? routerIsProvidedDevModeCheck : [],
  ];
}

/**
 * A type alias for providers returned by `withInMemoryScrolling` for use with `provideRouter`.
 *
 * @see {@link withInMemoryScrolling}
 * @see {@link provideRouter}
 *
 * @publicApi
 */
export type InMemoryScrollingFeature = RouterFeature<RouterFeatureKind.InMemoryScrollingFeature>;

/**
 * Enables customizable scrolling behavior for router navigations.
 *
 * @usageNotes
 *
 * Basic example of how you can enable scrolling feature:
 * ```ts
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withInMemoryScrolling())
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link provideRouter}
 * @see {@link ViewportScroller}
 *
 * @publicApi
 * @param options Set of configuration parameters to customize scrolling behavior, see
 *     `InMemoryScrollingOptions` for additional information.
 * @returns A set of providers for use with `provideRouter`.
 */
export function withInMemoryScrolling(
  options: InMemoryScrollingOptions = {},
): InMemoryScrollingFeature {
  const providers = [
    {
      provide: ROUTER_SCROLLER,
      useFactory: () => {
        const viewportScroller = inject(ViewportScroller);
        const zone = inject(NgZone);
        const transitions = inject(NavigationTransitions);
        const urlSerializer = inject(UrlSerializer);
        return new RouterScroller(urlSerializer, transitions, viewportScroller, zone, options);
      },
    },
  ];
  return routerFeature(RouterFeatureKind.InMemoryScrollingFeature, providers);
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

    if (injector.get(INITIAL_NAVIGATION) === InitialNavigation.EnabledNonBlocking) {
      router.initialNavigation();
    }

    injector.get(ROUTER_PRELOADER, null, {optional: true})?.setUpPreloading();
    injector.get(ROUTER_SCROLLER, null, {optional: true})?.init();
    router.resetRootComponentType(ref.componentTypes[0]);
    if (!bootstrapDone.closed) {
      bootstrapDone.next();
      bootstrapDone.complete();
      bootstrapDone.unsubscribe();
    }
  };
}

/**
 * A subject used to indicate that the bootstrapping phase is done. When initial navigation is
 * `enabledBlocking`, the first navigation waits until bootstrapping is finished before continuing
 * to the activation phase.
 */
const BOOTSTRAP_DONE = new InjectionToken<Subject<void>>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'bootstrap done indicator' : '',
  {
    factory: () => {
      return new Subject<void>();
    },
  },
);

/**
 * This and the INITIAL_NAVIGATION token are used internally only. The public API side of this is
 * configured through the `ExtraOptions`.
 *
 * When set to `EnabledBlocking`, the initial navigation starts before the root
 * component is created. The bootstrap is blocked until the initial navigation is complete. This
 * value should be set in case you use [server-side rendering](guide/ssr), but do not enable
 * [hydration](guide/hydration) for your application.
 *
 * When set to `EnabledNonBlocking`, the initial navigation starts after the root component has been
 * created. The bootstrap is not blocked on the completion of the initial navigation.
 *
 * When set to `Disabled`, the initial navigation is not performed. The location listener is set up
 * before the root component gets created. Use if there is a reason to have more control over when
 * the router starts its initial navigation due to some complex initialization logic.
 *
 * @see {@link ExtraOptions}
 */
const enum InitialNavigation {
  EnabledBlocking,
  EnabledNonBlocking,
  Disabled,
}

const INITIAL_NAVIGATION = new InjectionToken<InitialNavigation>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'initial navigation' : '',
  {providedIn: 'root', factory: () => InitialNavigation.EnabledNonBlocking},
);

/**
 * A type alias for providers returned by `withEnabledBlockingInitialNavigation` for use with
 * `provideRouter`.
 *
 * @see {@link withEnabledBlockingInitialNavigation}
 * @see {@link provideRouter}
 *
 * @publicApi
 */
export type EnabledBlockingInitialNavigationFeature =
  RouterFeature<RouterFeatureKind.EnabledBlockingInitialNavigationFeature>;

/**
 * A type alias for providers returned by `withEnabledBlockingInitialNavigation` or
 * `withDisabledInitialNavigation` functions for use with `provideRouter`.
 *
 * @see {@link withEnabledBlockingInitialNavigation}
 * @see {@link withDisabledInitialNavigation}
 * @see {@link provideRouter}
 *
 * @publicApi
 */
export type InitialNavigationFeature =
  | EnabledBlockingInitialNavigationFeature
  | DisabledInitialNavigationFeature;

/**
 * Configures initial navigation to start before the root component is created.
 *
 * The bootstrap is blocked until the initial navigation is complete. This should be set in case
 * you use [server-side rendering](guide/ssr), but do not enable [hydration](guide/hydration) for
 * your application.
 *
 * @usageNotes
 *
 * Basic example of how you can enable this navigation behavior:
 * ```ts
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withEnabledBlockingInitialNavigation())
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link provideRouter}
 *
 * @publicApi
 * @returns A set of providers for use with `provideRouter`.
 */
export function withEnabledBlockingInitialNavigation(): EnabledBlockingInitialNavigationFeature {
  const providers = [
    {provide: INITIAL_NAVIGATION, useValue: InitialNavigation.EnabledBlocking},
    provideAppInitializer(() => {
      const injector = inject(Injector);
      const locationInitialized: Promise<any> = injector.get(
        LOCATION_INITIALIZED,
        Promise.resolve(),
      );

      return locationInitialized.then(() => {
        return new Promise((resolve) => {
          const router = injector.get(Router);
          const bootstrapDone = injector.get(BOOTSTRAP_DONE);
          afterNextNavigation(router, () => {
            // Unblock APP_INITIALIZER in case the initial navigation was canceled or errored
            // without a redirect.
            resolve(true);
          });

          injector.get(NavigationTransitions).afterPreactivation = () => {
            // Unblock APP_INITIALIZER once we get to `afterPreactivation`. At this point, we
            // assume activation will complete successfully (even though this is not
            // guaranteed).
            resolve(true);
            return bootstrapDone.closed ? of(void 0) : bootstrapDone;
          };
          router.initialNavigation();
        });
      });
    }),
  ];
  return routerFeature(RouterFeatureKind.EnabledBlockingInitialNavigationFeature, providers);
}

/**
 * A type alias for providers returned by `withDisabledInitialNavigation` for use with
 * `provideRouter`.
 *
 * @see {@link withDisabledInitialNavigation}
 * @see {@link provideRouter}
 *
 * @publicApi
 */
export type DisabledInitialNavigationFeature =
  RouterFeature<RouterFeatureKind.DisabledInitialNavigationFeature>;

/**
 * Disables initial navigation.
 *
 * Use if there is a reason to have more control over when the router starts its initial navigation
 * due to some complex initialization logic.
 *
 * @usageNotes
 *
 * Basic example of how you can disable initial navigation:
 * ```ts
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withDisabledInitialNavigation())
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link provideRouter}
 *
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withDisabledInitialNavigation(): DisabledInitialNavigationFeature {
  const providers = [
    provideAppInitializer(() => {
      inject(Router).setUpLocationChangeListener();
    }),
    {provide: INITIAL_NAVIGATION, useValue: InitialNavigation.Disabled},
  ];
  return routerFeature(RouterFeatureKind.DisabledInitialNavigationFeature, providers);
}

/**
 * A type alias for providers returned by `withDebugTracing` for use with `provideRouter`.
 *
 * @see {@link withDebugTracing}
 * @see {@link provideRouter}
 *
 * @publicApi
 */
export type DebugTracingFeature = RouterFeature<RouterFeatureKind.DebugTracingFeature>;

/**
 * Enables logging of all internal navigation events to the console.
 * Extra logging might be useful for debugging purposes to inspect Router event sequence.
 *
 * @usageNotes
 *
 * Basic example of how you can enable debug tracing:
 * ```ts
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withDebugTracing())
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link provideRouter}
 *
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withDebugTracing(): DebugTracingFeature {
  let providers: Provider[] = [];
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    providers = [
      {
        provide: ENVIRONMENT_INITIALIZER,
        multi: true,
        useFactory: () => {
          const router = inject(Router);
          return () =>
            router.events.subscribe((e: Event) => {
              // tslint:disable:no-console
              console.group?.(`Router Event: ${(<any>e.constructor).name}`);
              console.log(stringifyEvent(e));
              console.log(e);
              console.groupEnd?.();
              // tslint:enable:no-console
            });
        },
      },
    ];
  } else {
    providers = [];
  }
  return routerFeature(RouterFeatureKind.DebugTracingFeature, providers);
}

const ROUTER_PRELOADER = new InjectionToken<RouterPreloader>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'router preloader' : '',
);

/**
 * A type alias that represents a feature which enables preloading in Router.
 * The type is used to describe the return value of the `withPreloading` function.
 *
 * @see {@link withPreloading}
 * @see {@link provideRouter}
 *
 * @publicApi
 */
export type PreloadingFeature = RouterFeature<RouterFeatureKind.PreloadingFeature>;

/**
 * Allows to configure a preloading strategy to use. The strategy is configured by providing a
 * reference to a class that implements a `PreloadingStrategy`.
 *
 * @usageNotes
 *
 * Basic example of how you can configure preloading:
 * ```ts
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withPreloading(PreloadAllModules))
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link provideRouter}
 *
 * @param preloadingStrategy A reference to a class that implements a `PreloadingStrategy` that
 *     should be used.
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withPreloading(preloadingStrategy: Type<PreloadingStrategy>): PreloadingFeature {
  const providers = [
    {provide: ROUTER_PRELOADER, useExisting: RouterPreloader},
    {provide: PreloadingStrategy, useExisting: preloadingStrategy},
  ];
  return routerFeature(RouterFeatureKind.PreloadingFeature, providers);
}

/**
 * A type alias for providers returned by `withRouterConfig` for use with `provideRouter`.
 *
 * @see {@link withRouterConfig}
 * @see {@link provideRouter}
 *
 * @publicApi
 */
export type RouterConfigurationFeature =
  RouterFeature<RouterFeatureKind.RouterConfigurationFeature>;

/**
 * Allows to provide extra parameters to configure Router.
 *
 * @usageNotes
 *
 * Basic example of how you can provide extra configuration options:
 * ```ts
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withRouterConfig({
 *          onSameUrlNavigation: 'reload'
 *       }))
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link provideRouter}
 *
 * @param options A set of parameters to configure Router, see `RouterConfigOptions` for
 *     additional information.
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withRouterConfig(options: RouterConfigOptions): RouterConfigurationFeature {
  const providers = [{provide: ROUTER_CONFIGURATION, useValue: options}];
  return routerFeature(RouterFeatureKind.RouterConfigurationFeature, providers);
}

/**
 * A type alias for providers returned by `withHashLocation` for use with `provideRouter`.
 *
 * @see {@link withHashLocation}
 * @see {@link provideRouter}
 *
 * @publicApi
 */
export type RouterHashLocationFeature = RouterFeature<RouterFeatureKind.RouterHashLocationFeature>;

/**
 * Provides the location strategy that uses the URL fragment instead of the history API.
 *
 * @usageNotes
 *
 * Basic example of how you can use the hash location option:
 * ```ts
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withHashLocation())
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link provideRouter}
 * @see {@link /api/common/HashLocationStrategy HashLocationStrategy}
 *
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withHashLocation(): RouterHashLocationFeature {
  const providers = [{provide: LocationStrategy, useClass: HashLocationStrategy}];
  return routerFeature(RouterFeatureKind.RouterHashLocationFeature, providers);
}

/**
 * A type alias for providers returned by `withNavigationErrorHandler` for use with `provideRouter`.
 *
 * @see {@link withNavigationErrorHandler}
 * @see {@link provideRouter}
 *
 * @publicApi
 */
export type NavigationErrorHandlerFeature =
  RouterFeature<RouterFeatureKind.NavigationErrorHandlerFeature>;

/**
 * Provides a function which is called when a navigation error occurs.
 *
 * This function is run inside application's [injection context](guide/di/dependency-injection-context)
 * so you can use the [`inject`](api/core/inject) function.
 *
 * This function can return a `RedirectCommand` to convert the error to a redirect, similar to returning
 * a `UrlTree` or `RedirectCommand` from a guard. This will also prevent the `Router` from emitting
 * `NavigationError`; it will instead emit `NavigationCancel` with code NavigationCancellationCode.Redirect.
 * Return values other than `RedirectCommand` are ignored and do not change any behavior with respect to
 * how the `Router` handles the error.
 *
 * @usageNotes
 *
 * Basic example of how you can use the error handler option:
 * ```ts
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withNavigationErrorHandler((e: NavigationError) =>
 * inject(MyErrorTracker).trackError(e)))
 *     ]
 *   }
 * );
 * ```
 *
 * @see {@link NavigationError}
 * @see {@link /api/core/inject inject}
 * @see {@link runInInjectionContext}
 *
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withNavigationErrorHandler(
  handler: (error: NavigationError) => unknown | RedirectCommand,
): NavigationErrorHandlerFeature {
  const providers = [
    {
      provide: NAVIGATION_ERROR_HANDLER,
      useValue: handler,
    },
  ];
  return routerFeature(RouterFeatureKind.NavigationErrorHandlerFeature, providers);
}

/**
 * A type alias for providers returned by `withComponentInputBinding` for use with `provideRouter`.
 *
 * @see {@link withComponentInputBinding}
 * @see {@link provideRouter}
 *
 * @publicApi
 */
export type ComponentInputBindingFeature =
  RouterFeature<RouterFeatureKind.ComponentInputBindingFeature>;

/**
 * A type alias for providers returned by `withViewTransitions` for use with `provideRouter`.
 *
 * @see {@link withViewTransitions}
 * @see {@link provideRouter}
 *
 * @publicApi
 */
export type ViewTransitionsFeature = RouterFeature<RouterFeatureKind.ViewTransitionsFeature>;

/**
 * Enables binding information from the `Router` state directly to the inputs of the component in
 * `Route` configurations.
 *
 * @usageNotes
 *
 * Basic example of how you can enable the feature:
 * ```ts
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withComponentInputBinding())
 *     ]
 *   }
 * );
 * ```
 *
 * The router bindings information from any of the following sources:
 *
 *  - query parameters
 *  - path and matrix parameters
 *  - static route data
 *  - data from resolvers
 *
 * Duplicate keys are resolved in the same order from above, from least to greatest,
 * meaning that resolvers have the highest precedence and override any of the other information
 * from the route.
 *
 * Importantly, when an input does not have an item in the route data with a matching key, this
 * input is set to `undefined`. This prevents previous information from being
 * retained if the data got removed from the route (i.e. if a query parameter is removed).
 * Default values can be provided with a resolver on the route to ensure the value is always present
 * or an input and use an input transform in the component.
 *
 * @see {@link /guide/components/inputs#input-transforms Input Transforms}
 * @returns A set of providers for use with `provideRouter`.
 */
export function withComponentInputBinding(): ComponentInputBindingFeature {
  const providers = [
    RoutedComponentInputBinder,
    {provide: INPUT_BINDER, useExisting: RoutedComponentInputBinder},
  ];

  return routerFeature(RouterFeatureKind.ComponentInputBindingFeature, providers);
}

/**
 * Enables view transitions in the Router by running the route activation and deactivation inside of
 * `document.startViewTransition`.
 *
 * Note: The View Transitions API is not available in all browsers. If the browser does not support
 * view transitions, the Router will not attempt to start a view transition and continue processing
 * the navigation as usual.
 *
 * @usageNotes
 *
 * Basic example of how you can enable the feature:
 * ```ts
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent,
 *   {
 *     providers: [
 *       provideRouter(appRoutes, withViewTransitions())
 *     ]
 *   }
 * );
 * ```
 *
 * @returns A set of providers for use with `provideRouter`.
 * @see https://developer.chrome.com/docs/web-platform/view-transitions/
 * @see https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
 * @developerPreview 19.0
 */
export function withViewTransitions(
  options?: ViewTransitionsFeatureOptions,
): ViewTransitionsFeature {
  performanceMarkFeature('NgRouterViewTransitions');
  const providers = [
    {provide: CREATE_VIEW_TRANSITION, useValue: createViewTransition},
    {
      provide: VIEW_TRANSITION_OPTIONS,
      useValue: {skipNextTransition: !!options?.skipInitialTransition, ...options},
    },
  ];
  return routerFeature(RouterFeatureKind.ViewTransitionsFeature, providers);
}

/**
 * A type alias that represents all Router features available for use with `provideRouter`.
 * Features can be enabled by adding special functions to the `provideRouter` call.
 * See documentation for each symbol to find corresponding function name. See also `provideRouter`
 * documentation on how to use those functions.
 *
 * @see {@link provideRouter}
 *
 * @publicApi
 */
export type RouterFeatures =
  | PreloadingFeature
  | DebugTracingFeature
  | InitialNavigationFeature
  | InMemoryScrollingFeature
  | RouterConfigurationFeature
  | NavigationErrorHandlerFeature
  | ComponentInputBindingFeature
  | ViewTransitionsFeature
  | RouterHashLocationFeature;

/**
 * The list of features as an enum to uniquely type each feature.
 */
export const enum RouterFeatureKind {
  PreloadingFeature,
  DebugTracingFeature,
  EnabledBlockingInitialNavigationFeature,
  DisabledInitialNavigationFeature,
  InMemoryScrollingFeature,
  RouterConfigurationFeature,
  RouterHashLocationFeature,
  NavigationErrorHandlerFeature,
  ComponentInputBindingFeature,
  ViewTransitionsFeature,
}
