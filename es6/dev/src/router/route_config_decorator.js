import { RouteConfig as RouteConfigAnnotation } from './route_config_impl';
import { makeDecorator } from 'angular2/src/core/util/decorators';
export { Route, Redirect, AuxRoute, AsyncRoute } from './route_config_impl';
export var RouteConfig = makeDecorator(RouteConfigAnnotation);
//# sourceMappingURL=route_config_decorator.js.map