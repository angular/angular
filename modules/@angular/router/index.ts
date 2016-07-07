/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


export {ExtraOptions, provideRouterConfig, provideRoutes} from './src/common_router_providers';
export {Data, ResolveData, Route, RouterConfig, Routes} from './src/config';
export {RouterLink, RouterLinkWithHref} from './src/directives/router_link';
export {RouterLinkActive} from './src/directives/router_link_active';
export {RouterOutlet} from './src/directives/router_outlet';
export {CanActivate, CanDeactivate, Resolve} from './src/interfaces';
export {Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RoutesRecognized} from './src/router';
export {ROUTER_DIRECTIVES, RouterModule} from './src/router_module';
export {RouterOutletMap} from './src/router_outlet_map';
export {provideRouter} from './src/router_providers';
export {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot} from './src/router_state';
export {PRIMARY_OUTLET, Params} from './src/shared';
export {DefaultUrlSerializer, UrlPathWithParams, UrlSerializer, UrlTree} from './src/url_tree';
