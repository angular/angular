import { RouteHandler } from './route_handler';
import { Promise } from 'angular2/src/facade/async';
import { Type } from 'angular2/src/facade/lang';
export declare class SyncRouteHandler implements RouteHandler {
    componentType: Type;
    data: {
        [key: string]: any;
    };
    constructor(componentType: Type, data?: {
        [key: string]: any;
    });
    resolveComponentType(): Promise<any>;
}
