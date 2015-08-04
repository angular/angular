import {RouteConfig as RouteConfigAnnotation, RouteDefinition} from './route_config_impl';
import {makeDecorator} from 'angular2/src/util/decorators';
import {List} from 'angular2/src/facade/collection';

export {Route, Redirect, AsyncRoute, RouteDefinition} from './route_config_impl';
export var RouteConfig: (configs: List<RouteDefinition>) => ClassDecorator =
    makeDecorator(RouteConfigAnnotation);
