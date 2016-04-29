/**
 * @module
 * @description
 * Alternative implementation of the router. Experimental.
 */

export {Router, RouterOutletMap} from './src/alt_router/router';
export {RouteSegment, UrlSegment, Tree} from './src/alt_router/segments';
export {Routes} from './src/alt_router/metadata/decorators';
export {Route} from './src/alt_router/metadata/metadata';
export {
  RouterUrlSerializer,
  DefaultRouterUrlSerializer
} from './src/alt_router/router_url_serializer';
export {OnActivate} from './src/alt_router/interfaces';
export {ROUTER_PROVIDERS} from './src/alt_router/router_providers';

import {RouterOutlet} from './src/alt_router/directives/router_outlet';
import {RouterLink} from './src/alt_router/directives/router_link';
import {CONST_EXPR} from './src/facade/lang';

export const ROUTER_DIRECTIVES: any[] = CONST_EXPR([RouterOutlet, RouterLink]);
