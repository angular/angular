/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export {createUrlTreeFromSnapshot} from './create_url_tree';
export {RouterLink, RouterLinkWithHref} from './directives/router_link';
export {RouterLinkActive} from './directives/router_link_active';
export {RouterOutlet, ROUTER_OUTLET_DATA} from './directives/router_outlet';
export {
  ActivationEnd,
  ActivationStart,
  ChildActivationEnd,
  ChildActivationStart,
  EventType,
  GuardsCheckEnd,
  GuardsCheckStart,
  NavigationCancel,
  NavigationCancellationCode as NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationSkippedCode,
  NavigationStart,
  ResolveEnd,
  ResolveStart,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  RouterEvent,
  RoutesRecognized,
  Scroll,
} from './events';
export {RedirectCommand} from './models';
export * from './models_deprecated';
export {DefaultTitleStrategy, TitleStrategy} from './page_title_strategy';
export {
  withViewTransitions,
  provideRouter,
  provideRoutes,
  withComponentInputBinding,
  withDebugTracing,
  withDisabledInitialNavigation,
  withEnabledBlockingInitialNavigation,
  withHashLocation,
  withInMemoryScrolling,
  withNavigationErrorHandler,
  withPreloading,
  withRouterConfig,
} from './provide_router';
export {BaseRouteReuseStrategy, RouteReuseStrategy} from './route_reuse_strategy';
export {Router} from './router';
export {ROUTER_CONFIGURATION} from './router_config';
export {ROUTES} from './router_config_loader';
export {ROUTER_INITIALIZER, RouterModule} from './router_module';
export {ChildrenOutletContexts, OutletContext} from './router_outlet_context';
export {
  NoPreloading,
  PreloadAllModules,
  PreloadingStrategy,
  RouterPreloader,
} from './router_preloader';
export {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  RouterState,
  RouterStateSnapshot,
} from './router_state';
export {convertToParamMap, defaultUrlMatcher, PRIMARY_OUTLET} from './shared';
export {UrlHandlingStrategy} from './url_handling_strategy';
export {
  DefaultUrlSerializer,
  UrlSegment,
  UrlSegmentGroup,
  UrlSerializer,
  UrlTree,
} from './url_tree';
export {
  mapToCanActivate,
  mapToCanActivateChild,
  mapToCanDeactivate,
  mapToCanMatch,
  mapToResolve,
} from './utils/functional_guards';
export {VERSION} from './version';
export * from './private_export';
import './router_devtools';
//# sourceMappingURL=index.js.map
