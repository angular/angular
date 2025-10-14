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
  ENVIRONMENT_INITIALIZER,
  inject,
  InjectionToken,
  Injector,
  makeEnvironmentProviders,
  NgZone,
  provideAppInitializer,
  ɵperformanceMarkFeature as performanceMarkFeature,
  ɵIS_ENABLED_BLOCKING_INITIAL_NAVIGATION as IS_ENABLED_BLOCKING_INITIAL_NAVIGATION,
  ɵpublishExternalGlobalUtil,
} from '@angular/core';
import {of, Subject} from 'rxjs';
import {INPUT_BINDER, RoutedComponentInputBinder} from './directives/router_outlet';
import {stringifyEvent} from './events';
import {NAVIGATION_ERROR_HANDLER, NavigationTransitions} from './navigation_transition';
import {Router} from './router';
import {ROUTER_CONFIGURATION} from './router_config';
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
} from './utils/view_transition';
import {getLoadedRoutes, getRouterInstance, navigateByUrl} from './router_devtools';
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
export function provideRouter(routes, ...features) {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    // Publish this util when the router is provided so that the devtools can use it.
    ɵpublishExternalGlobalUtil('ɵgetLoadedRoutes', getLoadedRoutes);
    ɵpublishExternalGlobalUtil('ɵgetRouterInstance', getRouterInstance);
    ɵpublishExternalGlobalUtil('ɵnavigateByUrl', navigateByUrl);
  }
  return makeEnvironmentProviders([
    {provide: ROUTES, multi: true, useValue: routes},
    typeof ngDevMode === 'undefined' || ngDevMode
      ? {provide: ROUTER_IS_PROVIDED, useValue: true}
      : [],
    {provide: ActivatedRoute, useFactory: rootRoute},
    {provide: APP_BOOTSTRAP_LISTENER, multi: true, useFactory: getBootstrapListener},
    features.map((feature) => feature.ɵproviders),
  ]);
}
export function rootRoute() {
  return inject(Router).routerState.root;
}
/**
 * Helper function to create an object that represents a Router feature.
 */
function routerFeature(kind, providers) {
  return {ɵkind: kind, ɵproviders: providers};
}
/**
 * An Injection token used to indicate whether `provideRouter` or `RouterModule.forRoot` was ever
 * called.
 */
export const ROUTER_IS_PROVIDED = new InjectionToken('', {
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
export function provideRoutes(routes) {
  return [
    {provide: ROUTES, multi: true, useValue: routes},
    typeof ngDevMode === 'undefined' || ngDevMode ? routerIsProvidedDevModeCheck : [],
  ];
}
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
export function withInMemoryScrolling(options = {}) {
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
  return routerFeature(4 /* RouterFeatureKind.InMemoryScrollingFeature */, providers);
}
export function getBootstrapListener() {
  const injector = inject(Injector);
  return (bootstrappedComponentRef) => {
    const ref = injector.get(ApplicationRef);
    if (bootstrappedComponentRef !== ref.components[0]) {
      return;
    }
    const router = injector.get(Router);
    const bootstrapDone = injector.get(BOOTSTRAP_DONE);
    if (injector.get(INITIAL_NAVIGATION) === 1 /* InitialNavigation.EnabledNonBlocking */) {
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
const BOOTSTRAP_DONE = new InjectionToken(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'bootstrap done indicator' : '',
  {
    factory: () => {
      return new Subject();
    },
  },
);
const INITIAL_NAVIGATION = new InjectionToken(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'initial navigation' : '',
  {providedIn: 'root', factory: () => 1 /* InitialNavigation.EnabledNonBlocking */},
);
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
export function withEnabledBlockingInitialNavigation() {
  const providers = [
    {provide: IS_ENABLED_BLOCKING_INITIAL_NAVIGATION, useValue: true},
    {provide: INITIAL_NAVIGATION, useValue: 0 /* InitialNavigation.EnabledBlocking */},
    provideAppInitializer(() => {
      const injector = inject(Injector);
      const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve());
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
  return routerFeature(
    2 /* RouterFeatureKind.EnabledBlockingInitialNavigationFeature */,
    providers,
  );
}
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
export function withDisabledInitialNavigation() {
  const providers = [
    provideAppInitializer(() => {
      inject(Router).setUpLocationChangeListener();
    }),
    {provide: INITIAL_NAVIGATION, useValue: 2 /* InitialNavigation.Disabled */},
  ];
  return routerFeature(3 /* RouterFeatureKind.DisabledInitialNavigationFeature */, providers);
}
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
export function withDebugTracing() {
  let providers = [];
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    providers = [
      {
        provide: ENVIRONMENT_INITIALIZER,
        multi: true,
        useFactory: () => {
          const router = inject(Router);
          return () =>
            router.events.subscribe((e) => {
              // tslint:disable:no-console
              console.group?.(`Router Event: ${e.constructor.name}`);
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
  return routerFeature(1 /* RouterFeatureKind.DebugTracingFeature */, providers);
}
const ROUTER_PRELOADER = new InjectionToken(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'router preloader' : '',
);
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
export function withPreloading(preloadingStrategy) {
  const providers = [
    {provide: ROUTER_PRELOADER, useExisting: RouterPreloader},
    {provide: PreloadingStrategy, useExisting: preloadingStrategy},
  ];
  return routerFeature(0 /* RouterFeatureKind.PreloadingFeature */, providers);
}
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
export function withRouterConfig(options) {
  const providers = [{provide: ROUTER_CONFIGURATION, useValue: options}];
  return routerFeature(5 /* RouterFeatureKind.RouterConfigurationFeature */, providers);
}
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
export function withHashLocation() {
  const providers = [{provide: LocationStrategy, useClass: HashLocationStrategy}];
  return routerFeature(6 /* RouterFeatureKind.RouterHashLocationFeature */, providers);
}
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
export function withNavigationErrorHandler(handler) {
  const providers = [
    {
      provide: NAVIGATION_ERROR_HANDLER,
      useValue: handler,
    },
  ];
  return routerFeature(7 /* RouterFeatureKind.NavigationErrorHandlerFeature */, providers);
}
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
export function withComponentInputBinding() {
  const providers = [
    RoutedComponentInputBinder,
    {provide: INPUT_BINDER, useExisting: RoutedComponentInputBinder},
  ];
  return routerFeature(8 /* RouterFeatureKind.ComponentInputBindingFeature */, providers);
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
export function withViewTransitions(options) {
  performanceMarkFeature('NgRouterViewTransitions');
  const providers = [
    {provide: CREATE_VIEW_TRANSITION, useValue: createViewTransition},
    {
      provide: VIEW_TRANSITION_OPTIONS,
      useValue: {skipNextTransition: !!options?.skipInitialTransition, ...options},
    },
  ];
  return routerFeature(9 /* RouterFeatureKind.ViewTransitionsFeature */, providers);
}
//# sourceMappingURL=provide_router.js.map
