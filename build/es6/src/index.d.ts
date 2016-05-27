export { Router } from './router';
export { UrlSerializer, DefaultUrlSerializer } from './url_serializer';
export { RouterState, ActivatedRoute } from './router_state';
export { RouterOutletMap } from './router_outlet_map';
import { RouterOutlet } from './directives/router_outlet';
import { RouterLink } from './directives/router_link';
export declare const ROUTER_DIRECTIVES: (typeof RouterOutlet | typeof RouterLink)[];
