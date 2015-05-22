/**
 * @module
 * @public
 * @description
 * Maps application URLs into application states, to support deep-linking and navigation.
 */


export {Router} from './src/router/router';
export {RouterOutlet} from './src/router/router_outlet';
export {RouterLink} from './src/router/router_link';
export {RouteParams} from './src/router/instruction';
export * from './src/router/route_config_annotation';
export * from './src/router/route_config_decorator';

import {BrowserLocation} from './src/router/browser_location';
import {Router, RootRouter} from './src/router/router';
import {RouterOutlet} from './src/router/router_outlet';
import {RouterLink} from './src/router/router_link';
import {RouteRegistry} from './src/router/route_registry';
import {Pipeline} from './src/router/pipeline';
import {Location} from './src/router/location';
import {appComponentTypeToken} from './src/core/application_tokens';
import {bind} from './di';
import {CONST_EXPR} from './src/facade/lang';

export const routerDirectives:List = CONST_EXPR([
  RouterOutlet,
  RouterLink
]);

export var routerInjectables:List = [
  RouteRegistry,
  Pipeline,
  BrowserLocation,
  Location,
  bind(Router).toFactory((registry, pipeline, location, appRoot) => {
    return new RootRouter(registry, pipeline, location, appRoot);
  }, [RouteRegistry, Pipeline, Location, appComponentTypeToken])
];
