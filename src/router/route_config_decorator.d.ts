import { RouteDefinition } from './route_config_impl';
export { Route, Redirect, AuxRoute, AsyncRoute, RouteDefinition } from './route_config_impl';
/**
 * The `RouteConfig` decorator defines routes for a given component.
 *
 * It takes an array of {@link RouteDefinition}s.
 */
export declare var RouteConfig: (configs: RouteDefinition[]) => ClassDecorator;
