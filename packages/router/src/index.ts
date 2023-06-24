/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


export {createUrlTreeFromSnapshot} from './create_url_tree';
export {RouterLink, RouterLinkWithHref} from './directives/router_link';
export {RouterLinkActive} from './directives/router_link_active';
export {RouterOutlet, RouterOutletContract} from './directives/router_outlet';
export {ActivationEnd, ActivationStart, ChildActivationEnd, ChildActivationStart, Event, EventType, GuardsCheckEnd, GuardsCheckStart, NavigationCancel, NavigationCancellationCode as NavigationCancellationCode, NavigationEnd, NavigationError, NavigationSkipped, NavigationSkippedCode, NavigationStart, ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, RouterEvent, RoutesRecognized, Scroll} from './events';
export {CanActivateChildFn, CanActivateFn, CanDeactivateFn, CanLoadFn, CanMatchFn, Data, DefaultExport, LoadChildren, LoadChildrenCallback, NavigationBehaviorOptions, OnSameUrlNavigation, QueryParamsHandling, ResolveData, ResolveFn, Route, Routes, RunGuardsAndResolvers, UrlMatcher, UrlMatchResult} from './models';
export * from './models_deprecated';
export {Navigation, NavigationExtras, UrlCreationOptions} from './navigation_transition';
export {DefaultTitleStrategy, TitleStrategy} from './page_title_strategy';
export {DebugTracingFeature, DisabledInitialNavigationFeature, EnabledBlockingInitialNavigationFeature, InitialNavigationFeature, InMemoryScrollingFeature, NavigationErrorHandlerFeature, PreloadingFeature, provideRouter, provideRoutes, RouterConfigurationFeature, RouterFeature, RouterFeatures, RouterHashLocationFeature, withComponentInputBinding, withDebugTracing, withDisabledInitialNavigation, withEnabledBlockingInitialNavigation, withHashLocation, withInMemoryScrolling, withNavigationErrorHandler, withPreloading, withRouterConfig} from './provide_router';
export {BaseRouteReuseStrategy, DetachedRouteHandle, RouteReuseStrategy} from './route_reuse_strategy';
export {Router} from './router';
export {ExtraOptions, InitialNavigation, InMemoryScrollingOptions, ROUTER_CONFIGURATION, RouterConfigOptions} from './router_config';
export {ROUTES} from './router_config_loader';
export {ROUTER_INITIALIZER, RouterModule} from './router_module';
export {ChildrenOutletContexts, OutletContext} from './router_outlet_context';
export {NoPreloading, PreloadAllModules, PreloadingStrategy, RouterPreloader} from './router_preloader';
export {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot} from './router_state';
export {convertToParamMap, defaultUrlMatcher, ParamMap, Params, PRIMARY_OUTLET} from './shared';
export {UrlHandlingStrategy} from './url_handling_strategy';
export {DefaultUrlSerializer, IsActiveMatchOptions, UrlSegment, UrlSegmentGroup, UrlSerializer, UrlTree} from './url_tree';
export {mapToCanActivate, mapToCanActivateChild, mapToCanDeactivate, mapToCanMatch, mapToResolve} from './utils/functional_guards';
export {VERSION} from './version';

export * from './private_export';
