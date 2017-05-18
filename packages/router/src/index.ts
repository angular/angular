/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


export {Data, LoadChildren, LoadChildrenCallback, ResolveData, Route, Routes, RunGuardsAndResolvers} from './config';
export {RouterLink, RouterLinkWithHref} from './directives/router_link';
export {RouterLinkActive} from './directives/router_link_active';
export {RouterOutlet} from './directives/router_outlet';
export {Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, RouteConfigLoadEnd, RouteConfigLoadStart, RoutesRecognized} from './events';
export {CanActivate, CanActivateChild, CanDeactivate, CanLoad, Resolve} from './interfaces';
export {DetachedRouteHandle, RouteReuseStrategy} from './route_reuse_strategy';
export {NavigationExtras, Router} from './router';
export {ROUTES} from './router_config_loader';
export {ExtraOptions, ROUTER_CONFIGURATION, ROUTER_INITIALIZER, RouterModule, provideRoutes} from './router_module';
export {RouterOutletMap} from './router_outlet_map';
export {NoPreloading, PreloadAllModules, PreloadingStrategy, RouterPreloader} from './router_preloader';
export {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot} from './router_state';
export {PRIMARY_OUTLET, ParamMap, Params, convertToParamMap} from './shared';
export {UrlHandlingStrategy} from './url_handling_strategy';
export {DefaultUrlSerializer, UrlSegment, UrlSegmentGroup, UrlSerializer, UrlTree} from './url_tree';
export {VERSION} from './version';

export * from './private_export'
