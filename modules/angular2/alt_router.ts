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
export {OnActivate, CanDeactivate} from './src/alt_router/interfaces';
export {ROUTER_PROVIDERS} from './src/alt_router/router_providers';

import {RouterOutlet} from './src/alt_router/directives/router_outlet';
import {RouterLink} from './src/alt_router/directives/router_link';

export const ROUTER_DIRECTIVES: any[] = /*@ts2dart_const*/[RouterOutlet, RouterLink];
