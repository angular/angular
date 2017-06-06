import { RouteConfig as RouteConfigAnnotation } from './route_config_impl';
import { makeDecorator } from 'angular2/src/core/util/decorators';
export { Route, Redirect, AuxRoute, AsyncRoute } from './route_config_impl';
// Copied from RouteConfig in route_config_impl.
/**
 * The `RouteConfig` decorator defines routes for a given component.
 *
 * It takes an array of {@link RouteDefinition}s.
 */
export var RouteConfig = makeDecorator(RouteConfigAnnotation);
