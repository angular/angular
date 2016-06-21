import {RouterLink} from './src/directives/router_link';
import {RouterLinkActive} from './src/directives/router_link_active';
import {RouterOutlet} from './src/directives/router_outlet';

export {ExtraOptions} from './src/common_router_providers';
export {Route, RouterConfig} from './src/config';
export {CanActivate, CanDeactivate} from './src/interfaces';
export {Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RoutesRecognized} from './src/router';
export {RouterOutletMap} from './src/router_outlet_map';
export {provideRouter} from './src/router_providers';
export {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot} from './src/router_state';
export {PRIMARY_OUTLET, Params} from './src/shared';
export {DefaultUrlSerializer, UrlPathWithParams, UrlSerializer, UrlTree} from './src/url_tree';

export const ROUTER_DIRECTIVES = [RouterOutlet, RouterLink, RouterLinkActive];