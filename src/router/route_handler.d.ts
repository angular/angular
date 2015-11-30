import { Promise } from 'angular2/src/facade/async';
import { Type } from 'angular2/src/facade/lang';
export interface RouteHandler {
    componentType: Type;
    resolveComponentType(): Promise<any>;
    data?: {
        [key: string]: any;
    };
}
