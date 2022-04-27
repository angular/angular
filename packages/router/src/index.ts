/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


export {RouterLink, RouterLinkWithHref} from './directives/router_link.js';
export {RouterLinkActive} from './directives/router_link_active.js';
export {RouterOutlet, RouterOutletContract} from './directives/router_outlet.js';
export {ActivationEnd, ActivationStart, ChildActivationEnd, ChildActivationStart, Event, GuardsCheckEnd, GuardsCheckStart, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, RouterEvent, RoutesRecognized, Scroll} from './events.js';
export {CanActivate, CanActivateChild, CanDeactivate, CanLoad, Data, LoadChildren, LoadChildrenCallback, QueryParamsHandling, Resolve, ResolveData, Route, Routes, RunGuardsAndResolvers, UrlMatcher, UrlMatchResult} from './models.js';
export {DefaultTitleStrategy, TitleStrategy} from './page_title_strategy.js';
export {BaseRouteReuseStrategy, DetachedRouteHandle, RouteReuseStrategy} from './route_reuse_strategy.js';
export {Navigation, NavigationBehaviorOptions, NavigationExtras, Router, UrlCreationOptions} from './router.js';
export {ROUTES} from './router_config_loader.js';
export {ExtraOptions, InitialNavigation, provideRoutes, ROUTER_CONFIGURATION, ROUTER_INITIALIZER, RouterModule} from './router_module.js';
export {ChildrenOutletContexts, OutletContext} from './router_outlet_context.js';
export {NoPreloading, PreloadAllModules, PreloadingStrategy, RouterPreloader} from './router_preloader.js';
export {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot} from './router_state.js';
export {convertToParamMap, ParamMap, Params, PRIMARY_OUTLET} from './shared.js';
export {UrlHandlingStrategy} from './url_handling_strategy.js';
export {DefaultUrlSerializer, IsActiveMatchOptions, UrlSegment, UrlSegmentGroup, UrlSerializer, UrlTree} from './url_tree.js';
export {VERSION} from './version.js';

export * from './private_export.js';
