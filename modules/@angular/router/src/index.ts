/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


export {Data, LoadChildren, LoadChildrenCallback, ResolveData, Route, Routes} from './config';
export {RouterLink, RouterLinkWithHref} from './directives/router_link';
export {RouterLinkActive} from './directives/router_link_active';
export {RouterOutlet} from './directives/router_outlet';
export {CanActivate, CanActivateChild, CanDeactivate, CanLoad, Resolve} from './interfaces';
export {Event, NavigationCancel, NavigationEnd, NavigationError, NavigationExtras, NavigationStart, Router, RoutesRecognized} from './router';
export {ExtraOptions, RouterModule, provideRoutes} from './router_module';
export {RouterOutletMap} from './router_outlet_map';
export {NoPreloading, PreloadAllModules, PreloadingStrategy} from './router_preloader';
export {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot} from './router_state';
export {PRIMARY_OUTLET, Params} from './shared';
export {DefaultUrlSerializer, UrlSegment, UrlSerializer, UrlTree} from './url_tree';

export * from './private_export'
