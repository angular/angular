import {RouteConfig as RouteConfigAnnotation} from './route_config_impl';
import {makeDecorator} from 'angular2/src/util/decorators';

export {Route, Redirect, AsyncRoute, RouteDefinition} from './route_config_impl';
export var RouteConfig = makeDecorator(RouteConfigAnnotation);
