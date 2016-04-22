/**
 * @module
 * @description
 * Alternative implementation of the router. Experimental.
 */

export {Router, RouterOutletMap} from './src/alt_router/router';
export {RouteSegment} from './src/alt_router/segments';
export {Routes} from './src/alt_router/metadata/decorators';
export {Route} from './src/alt_router/metadata/metadata';
export {RouterUrlParser, DefaultRouterUrlParser} from './src/alt_router/router_url_parser';
export {OnActivate} from './src/alt_router/interfaces';

import {RouterOutlet} from './src/alt_router/directives/router_outlet';
import {CONST_EXPR} from './src/facade/lang';

export const ROUTER_DIRECTIVES: any[] = CONST_EXPR([RouterOutlet]);
