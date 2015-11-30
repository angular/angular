import { RouteHandler } from './route_handler';
import { Promise } from 'angular2/src/facade/async';
import { Type } from 'angular2/src/facade/lang';
export declare class AsyncRouteHandler implements RouteHandler {
    private _loader;
    data: {
        [key: string]: any;
    };
    componentType: Type;
    constructor(_loader: Function, data?: {
        [key: string]: any;
    });
    resolveComponentType(): Promise<any>;
}
