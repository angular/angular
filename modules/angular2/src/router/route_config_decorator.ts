import {RouteConfig as RouteConfigAnnotation} from './route_config_impl';
import {makeDecorator} from 'angular2/src/util/decorators';

export var RouteConfig = makeDecorator(RouteConfigAnnotation);
