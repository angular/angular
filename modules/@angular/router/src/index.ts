import {RouterLink} from './directives/router_link';
import {RouterLinkActive} from './directives/router_link_active';
import {RouterOutlet} from './directives/router_outlet';

export {ExtraOptions} from './common_router_providers';
export {Route, RouterConfig} from './config';
export {CanActivate, CanDeactivate} from './interfaces';
export {Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RoutesRecognized} from './router';
export {RouterOutletMap} from './router_outlet_map';
export {provideRouter} from './router_providers';
export {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot} from './router_state';
export {PRIMARY_OUTLET, Params} from './shared';
export {DefaultUrlSerializer, UrlSerializer} from './url_serializer';
export {UrlPathWithParams, UrlTree} from './url_tree';

export const ROUTER_DIRECTIVES = [RouterOutlet, RouterLink, RouterLinkActive];