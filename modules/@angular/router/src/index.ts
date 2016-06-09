import {RouterLink} from './directives/router_link';
import {RouterOutlet} from './directives/router_outlet';

export {Route, RouterConfig} from './config';
export {CanActivate, CanDeactivate} from './interfaces';
export {Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, RoutesRecognized, Router} from './router';
export {RouterOutletMap} from './router_outlet_map';
export {provideRouter} from './router_providers';
export {ActivatedRoute, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot} from './router_state';
export {PRIMARY_OUTLET, Params} from './shared';
export {DefaultUrlSerializer, UrlSerializer} from './url_serializer';
export {UrlSegment, UrlTree} from './url_tree';

export const ROUTER_DIRECTIVES = [RouterOutlet, RouterLink];