import { Promise } from 'angular2/src/facade/promise';
import { RouteHandler } from './route_handler';
import { Url } from './url_parser';
import { ComponentInstruction } from './instruction';
export declare abstract class RouteMatch {
}
export interface AbstractRecognizer {
    hash: string;
    path: string;
    recognize(beginningSegment: Url): Promise<RouteMatch>;
    generate(params: {
        [key: string]: any;
    }): ComponentInstruction;
}
export declare class PathMatch extends RouteMatch {
    instruction: ComponentInstruction;
    remaining: Url;
    remainingAux: Url[];
    constructor(instruction: ComponentInstruction, remaining: Url, remainingAux: Url[]);
}
export declare class RedirectMatch extends RouteMatch {
    redirectTo: any[];
    specificity: any;
    constructor(redirectTo: any[], specificity: any);
}
export declare class RedirectRecognizer implements AbstractRecognizer {
    path: string;
    redirectTo: any[];
    private _pathRecognizer;
    hash: string;
    constructor(path: string, redirectTo: any[]);
    /**
     * Returns `null` or a `ParsedUrl` representing the new path to match
     */
    recognize(beginningSegment: Url): Promise<RouteMatch>;
    generate(params: {
        [key: string]: any;
    }): ComponentInstruction;
}
export declare class RouteRecognizer implements AbstractRecognizer {
    path: string;
    handler: RouteHandler;
    specificity: string;
    terminal: boolean;
    hash: string;
    private _cache;
    private _pathRecognizer;
    constructor(path: string, handler: RouteHandler);
    recognize(beginningSegment: Url): Promise<RouteMatch>;
    generate(params: {
        [key: string]: any;
    }): ComponentInstruction;
    generateComponentPathValues(params: {
        [key: string]: any;
    }): {
        [key: string]: any;
    };
    private _getInstruction(urlPath, urlParams, params);
}
