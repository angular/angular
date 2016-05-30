/**
 * @module
 * @description
 * Maps application URLs into application states, to support deep-linking and navigation.
 */

export {Router, RouterOutletMap} from './src/router';
export {RouteSegment, UrlSegment, Tree, UrlTree, RouteTree} from './src/segments';
export {Routes} from './src/metadata/decorators';
export {Route} from './src/metadata/metadata';
export {RouterUrlSerializer, DefaultRouterUrlSerializer} from './src/router_url_serializer';
export {OnActivate, CanDeactivate} from './src/interfaces';
export {ROUTER_PROVIDERS} from './src/router_providers';

export {RouterOutlet} from './src/directives/router_outlet';
export {RouterLink} from './src/directives/router_link';
export {ROUTER_DIRECTIVES} from "./src/directives/router_directives";
