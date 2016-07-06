/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


export {ExtraOptions, provideRoutes, provideRouterConfig} from './src/common_router_providers';
export {Data, ResolveData, Route, RouterConfig} from './src/config';
export {RouterLink, RouterLinkWithHref} from './src/directives/router_link';
export {RouterLinkActive} from './src/directives/router_link_active';
export {RouterOutlet} from './src/directives/router_outlet';
export {CanActivate, CanDeactivate, Resolve} from './src/interfaces';
export {Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RoutesRecognized} from './src/router';
export {RouterOutletMap} from './src/router_outlet_map';
export {provideRouter} from './src/router_providers';
export {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot} from './src/router_state';
export {PRIMARY_OUTLET, Params} from './src/shared';
export {RouterAppModule, ROUTER_DIRECTIVES} from './src/router_app_module';
export {DefaultUrlSerializer, UrlPathWithParams, UrlSerializer, UrlTree} from './src/url_tree';
