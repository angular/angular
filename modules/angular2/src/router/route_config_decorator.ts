import {RouteConfig as RouteConfigAnnotation, RouteDefinition} from './route_config_impl';
import {makeDecorator} from 'angular2/src/core/util/decorators';

export {Route, Redirect, AuxRoute, AsyncRoute, RouteDefinition} from './route_config_impl';

// Copied from RouteConfig in route_config_impl.
/**
 * The `RouteConfig` decorator defines routes for a given component.
 *
 * It takes an array of {@link RouteDefinition}s.
 */
export var RouteConfig: (configs: RouteDefinition[]) => ClassDecorator =
    makeDecorator(RouteConfigAnnotation);
