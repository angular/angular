import {Routes as RoutesAnnotation, RouteDefinition} from './route_config_impl';
import {makeDecorator} from 'angular2/src/core/util/decorators';

export {Route, Redirect, AuxRoute, AsyncRoute, RouteDefinition} from './route_config_impl';

/**
 * The `Routes` decorator defines routes for a given component.
 *
 * It takes an array of {@link RouteDefinition}s.
 */
export var Routes: (configs: RouteDefinition[]) => ClassDecorator = makeDecorator(RoutesAnnotation);


/**
 * Use {@link Routes} instead.
 *
 * The `RouteConfig` decorator defines routes for a given component.
 *
 * It takes an array of {@link RouteDefinition}s.
 *
 * @deprecated
 */
class RouteConfigAnnotation extends RoutesAnnotation {
  constructor(configs: RouteDefinition[]) {
    super(configs);
    console.log(`@RouteConfig is deprecated use @Routes instead`);
  }
}

/**
 * Use {@link Routes} instead.
 *
 * The `RouteConfig` decorator defines routes for a given component.
 *
 * It takes an array of {@link RouteDefinition}s.
 *
 * @deprecated
 */
export var RouteConfig: (configs: RouteDefinition[]) => ClassDecorator =
    makeDecorator(RouteConfigAnnotation);
