export {RouteConfig as RouteConfigAnnotation} from './route_config_impl';


import {makeDecorator, makeParamDecorator} from 'angular2/src/util/decorators';

export var RouteConfig = makeDecorator(RouteConfig);
