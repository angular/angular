export { Router } from './router';
export { UrlSerializer, DefaultUrlSerializer } from './url_serializer';
export { RouterState, ActivatedRoute, RouterStateSnapshot, ActivatedRouteSnapshot } from './router_state';
export { UrlTree, UrlSegment} from './url_tree';
export { RouterOutletMap } from './router_outlet_map';
export { RouterConfig, Route } from './config';
export { Params, PRIMARY_OUTLET } from './shared';
export { provideRouter } from './router_providers';

import { RouterOutlet } from './directives/router_outlet';
import { RouterLink } from './directives/router_link';

export const ROUTER_DIRECTIVES = [RouterOutlet, RouterLink];