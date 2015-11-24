import { RouteDefinition } from './route_config_decorator';
import { Type } from 'angular2/src/facade/lang';
/**
 * Given a JS Object that represents... returns a corresponding Route, AsyncRoute, or Redirect
 */
export declare function normalizeRouteConfig(config: RouteDefinition): RouteDefinition;
export declare function assertComponentExists(component: Type, path: string): void;
