/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HashLocationStrategy, LOCATION_INITIALIZED, LocationStrategy, ViewportScroller} from '@angular/common';
import {APP_BOOTSTRAP_LISTENER, APP_INITIALIZER, ApplicationRef, Component, ComponentRef, ENVIRONMENT_INITIALIZER, EnvironmentInjector, EnvironmentProviders, inject, InjectFlags, InjectionToken, Injector, makeEnvironmentProviders, NgZone, Provider, Type} from '@angular/core';
import {of, Subject} from 'rxjs';

import {INPUT_BINDER, RoutedComponentInputBinder} from './directives/router_outlet';
import {Event, NavigationError, stringifyEvent} from './events';
import {Routes} from './models';
import {NavigationTransitions} from './navigation_transition';
import {Router} from './router';
import {InMemoryScrollingOptions, ROUTER_CONFIGURATION, RouterConfigOptions} from './router_config';
import {ROUTES} from './router_config_loader';
import {PreloadingStrategy, RouterPreloader} from './router_preloader';
import {ROUTER_SCROLLER, RouterScroller} from './router_scroller';
import {ActivatedRoute} from './router_state';
import {UrlSerializer} from './url_tree';
import {afterNextNavigation} from './utils/navigations';


/**
 * Sets up providers necessary to enable `Router` functionality for the application.
 * Allows to configure a set of routes as well as extra features that should be enabled.
 *
 * @usageNotes
 *
 * Basic example of how you can add a Router to your application:
 * ```
 * const appRoutes: Routes = [];
 * bootstrapApplication(AppComponent, {
 *   providers: [provideRouter(appRoutes)]
 * });
 * ```
 *
 * You can also enable optional features in the Router by adding functions from the `RouterFeatures`
 * type:
 * ```
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
 * @see `RouterFeatures`
 *
 * @publicApi
 * @param routes A set of `Route`s to use for the application routing table.
 * @param features Optional features to configure additional router behaviors.
 * @returns A set of providers to setup a Router.
 */
export function provideRouter(routes: Routes, ...features: RouterFeatures[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: ROUTES, multi: true, useValue: routes},
    (typeof ngDevMode === 'undefined' || ngDevMode) ?
        {provide: ROUTER_IS_PROVIDED, useValue: true} :
        [],
    {provide: ActivatedRoute, useFactory: rootRoute, deps: [Router]},
    {provide: APP_BOOTSTRAP_LISTENER, multi: true, useFactory: getBootstrapListener},
    features.map(feature => feature.ɵproviders),
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
  ɵproviders: Provider[];
}

/**
 * Helper function to create an object that represents a Router feature.
 */
function routerFeature<FeatureKind extends RouterFeatureKind>(
    kind: FeatureKind, providers: Provider[]): RouterFeature<FeatureKind> {
  return {ɵkind: kind, ɵproviders: providers};
}


/**
 * An Injection token used to indicate whether `provideRouter` or `RouterModule.forRoot` was ever
 * called.
 */
export const ROUTER_IS_PROVIDED =
    new InjectionToken<boolean>('', {providedIn: 'root', factory: () => false});

const routerIsProvidedDevModeCheck = {
  provide: ENVIRONMENT_INITIALIZER,
  multi: true,
  useFactory() {
    return () => {
      if (!inject(ROUTER_IS_PROVIDED)) {
        console.warn(
            '`provideRoutes` was called without `provideRouter` or `RouterModule.forRoot`. ' +
            'This is likely a mistake.');
      }
    };
  }
};

/**
 * Registers a [DI provider](guide/glossary#provider) for a set of routes.
 * @param routes The route configuration to provide.
 *
 * @usageNotes
 *
 * ```
 * @NgModule({
 *   providers: [provideRoutes(ROUTES)]
 * })
 * class LazyLoadedChildModule {}
 * ```
 *
 * @deprecated If necessary, provide routes using the `ROUTES` `InjectionToken`.
 * @see `ROUTES`
 * @publicApi
 */
export function provideRoutes(routes: Routes): Provider[] {
  return [
    {provide: ROUTES, multi: true, useValue: routes},
    (typeof ngDevMode === 'undefined' || ngDevMode) ? routerIsProvidedDevModeCheck : [],
  ];
}

/**
 * A type alias for providers returned by `withInMemoryScrolling` for use with `provideRouter`.
 *
 * @see `withInMemoryScrolling`
 * @see `provideRouter`
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
 * ```
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
 * @see `provideRouter`
 * @see `ViewportScroller`
 *
 * @publicApi
 * @param options Set of configuration parameters to customize scrolling behavior, see
 *     `InMemoryScrollingOptions` for additional information.
 * @returns A set of providers for use with `provideRouter`.
 */
export function withInMemoryScrolling(options: InMemoryScrollingOptions = {}):
    InMemoryScrollingFeature {
  const providers = [{
    provide: ROUTER_SCROLLER,
    useFactory: () => {
      const viewportScroller = inject(ViewportScroller);
      const zone = inject(NgZone);
      const transitions = inject(NavigationTransitions);
      const urlSerializer = inject(UrlSerializer);
      return new RouterScroller(urlSerializer, transitions, viewportScroller, zone, options);
    },
  }];
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

    injector.get(ROUTER_PRELOADER, null, InjectFlags.Optional)?.setUpPreloading();
    injector.get(ROUTER_SCROLLER, null, InjectFlags.Optional)?.init();
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
    (typeof ngDevMode === 'undefined' || ngDevMode) ? 'bootstrap done indicator' : '', {
      factory: () => {
        return new Subject<void>();
      }
    });

/**
 * This and the INITIAL_NAVIGATION token are used internally only. The public API side of this is
 * configured through the `ExtraOptions`.
 *
 * When set to `EnabledBlocking`, the initial navigation starts before the root
 * component is created. The bootstrap is blocked until the initial navigation is complete. This
 * value is required for [server-side rendering](guide/universal) to work.
 *
 * When set to `EnabledNonBlocking`, the initial navigation starts after the root component has been
 * created. The bootstrap is not blocked on the completion of the initial navigation.
 *
 * When set to `Disabled`, the initial navigation is not performed. The location listener is set up
 * before the root component gets created. Use if there is a reason to have more control over when
 * the router starts its initial navigation due to some complex initialization logic.
 *
 * @see `ExtraOptions`
 */
const enum InitialNavigation {
  EnabledBlocking,
  EnabledNonBlocking,
  Disabled,
}

const INITIAL_NAVIGATION = new InjectionToken<InitialNavigation>(
    (typeof ngDevMode === 'undefined' || ngDevMode) ? 'initial navigation' : '',
    {providedIn: 'root', factory: () => InitialNavigation.EnabledNonBlocking});

/**
 * A type alias for providers returned by `withEnabledBlockingInitialNavigation` for use with
 * `provideRouter`.
 *
 * @see `withEnabledBlockingInitialNavigation`
 * @see `provideRouter`
 *
 * @publicApi
 */
export type EnabledBlockingInitialNavigationFeature =
    RouterFeature<RouterFeatureKind.EnabledBlockingInitialNavigationFeature>;

/**
 * A type alias for providers returned by `withEnabledBlockingInitialNavigation` or
 * `withDisabledInitialNavigation` functions for use with `provideRouter`.
 *
 * @see `withEnabledBlockingInitialNavigation`
 * @see `withDisabledInitialNavigation`
 * @see `provideRouter`
 *
 * @publicApi
 */
export type InitialNavigationFeature =
    EnabledBlockingInitialNavigationFeature|DisabledInitialNavigationFeature;

/**
 * Configures initial navigation to start before the root component is created.
 *
 * The bootstrap is blocked until the initial navigation is complete. This value is required for
 * [server-side rendering](guide/universal) to work.
 *
 * @usageNotes
 *
 * Basic example of how you can enable this navigation behavior:
 * ```
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
 * @see `provideRouter`
 *
 * @publicApi
 * @returns A set of providers for use with `provideRouter`.
 */
export function withEnabledBlockingInitialNavigation(): EnabledBlockingInitialNavigationFeature {
  const providers = [
    {provide: INITIAL_NAVIGATION, useValue: InitialNavigation.EnabledBlocking},
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [Injector],
      useFactory: (injector: Injector) => {
        const locationInitialized: Promise<any> =
            injector.get(LOCATION_INITIALIZED, Promise.resolve());

        return () => {
          return locationInitialized.then(() => {
            return new Promise(resolve => {
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
        };
      }
    },
  ];
  return routerFeature(RouterFeatureKind.EnabledBlockingInitialNavigationFeature, providers);
}

/**
 * A type alias for providers returned by `withDisabledInitialNavigation` for use with
 * `provideRouter`.
 *
 * @see `withDisabledInitialNavigation`
 * @see `provideRouter`
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
 * ```
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
 * @see `provideRouter`
 *
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withDisabledInitialNavigation(): DisabledInitialNavigationFeature {
  const providers = [
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
    {provide: INITIAL_NAVIGATION, useValue: InitialNavigation.Disabled}
  ];
  return routerFeature(RouterFeatureKind.DisabledInitialNavigationFeature, providers);
}

/**
 * A type alias for providers returned by `withDebugTracing` for use with `provideRouter`.
 *
 * @see `withDebugTracing`
 * @see `provideRouter`
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
 * ```
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
 * @see `provideRouter`
 *
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withDebugTracing(): DebugTracingFeature {
  let providers: Provider[] = [];
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    providers = [{
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
    providers = [];
  }
  return routerFeature(RouterFeatureKind.DebugTracingFeature, providers);
}

const ROUTER_PRELOADER = new InjectionToken<RouterPreloader>(
    (typeof ngDevMode === 'undefined' || ngDevMode) ? 'router preloader' : '');

/**
 * A type alias that represents a feature which enables preloading in Router.
 * The type is used to describe the return value of the `withPreloading` function.
 *
 * @see `withPreloading`
 * @see `provideRouter`
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
 * ```
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
 * @see `provideRouter`
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
 * @see `withRouterConfig`
 * @see `provideRouter`
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
 * ```
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
 * @see `provideRouter`
 *
 * @param options A set of parameters to configure Router, see `RouterConfigOptions` for
 *     additional information.
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withRouterConfig(options: RouterConfigOptions): RouterConfigurationFeature {
  const providers = [
    {provide: ROUTER_CONFIGURATION, useValue: options},
  ];
  return routerFeature(RouterFeatureKind.RouterConfigurationFeature, providers);
}

/**
 * A type alias for providers returned by `withHashLocation` for use with `provideRouter`.
 *
 * @see `withHashLocation`
 * @see `provideRouter`
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
 * ```
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
 * @see `provideRouter`
 * @see `HashLocationStrategy`
 *
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withHashLocation(): RouterConfigurationFeature {
  const providers = [
    {provide: LocationStrategy, useClass: HashLocationStrategy},
  ];
  return routerFeature(RouterFeatureKind.RouterConfigurationFeature, providers);
}

/**
 * A type alias for providers returned by `withNavigationErrorHandler` for use with `provideRouter`.
 *
 * @see `withNavigationErrorHandler`
 * @see `provideRouter`
 *
 * @publicApi
 */
export type NavigationErrorHandlerFeature =
    RouterFeature<RouterFeatureKind.NavigationErrorHandlerFeature>;

/**
 * Subscribes to the Router's navigation events and calls the given function when a
 * `NavigationError` happens.
 *
 * This function is run inside application's injection context so you can use the `inject` function.
 *
 * @usageNotes
 *
 * Basic example of how you can use the error handler option:
 * ```
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
 * @see `NavigationError`
 * @see `inject`
 * @see `EnvironmentInjector#runInContext`
 *
 * @returns A set of providers for use with `provideRouter`.
 *
 * @publicApi
 */
export function withNavigationErrorHandler(fn: (error: NavigationError) => void):
    NavigationErrorHandlerFeature {
  const providers = [{
    provide: ENVIRONMENT_INITIALIZER,
    multi: true,
    useValue: () => {
      const injector = inject(EnvironmentInjector);
      inject(Router).events.subscribe((e) => {
        if (e instanceof NavigationError) {
          injector.runInContext(() => fn(e));
        }
      });
    }
  }];
  return routerFeature(RouterFeatureKind.NavigationErrorHandlerFeature, providers);
}

/**
 * A type alias for providers returned by `withComponentInputBinding` for use with `provideRouter`.
 *
 * @see `withComponentInputBinding`
 * @see `provideRouter`
 *
 * @publicApi
 */
export type ComponentInputBindingFeature =
    RouterFeature<RouterFeatureKind.ComponentInputBindingFeature>;

/**
 * Enables binding information from the `Router` state directly to the inputs of the component in
 * `Route` configurations.
 *
 * @usageNotes
 *
 * Basic example of how you can enable the feature:
 * ```
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
 * A type alias that represents all Router features available for use with `provideRouter`.
 * Features can be enabled by adding special functions to the `provideRouter` call.
 * See documentation for each symbol to find corresponding function name. See also `provideRouter`
 * documentation on how to use those functions.
 *
 * @see `provideRouter`
 *
 * @publicApi
 */
export type RouterFeatures =
    PreloadingFeature|DebugTracingFeature|InitialNavigationFeature|InMemoryScrollingFeature|
    RouterConfigurationFeature|NavigationErrorHandlerFeature|ComponentInputBindingFeature;

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
}
