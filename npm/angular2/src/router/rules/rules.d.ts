import { RouteHandler } from './route_handlers/route_handler';
import { Url } from '../url_parser';
import { ComponentInstruction } from '../instruction';
import { RoutePath, GeneratedUrl } from './route_paths/route_path';
export declare abstract class RouteMatch {
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
export interface AbstractRule {
    hash: string;
    path: string;
    recognize(beginningSegment: Url): Promise<RouteMatch>;
    generate(params: {
        [key: string]: any;
    }): ComponentInstruction;
}
export declare class RedirectRule implements AbstractRule {
    private _pathRecognizer;
    redirectTo: any[];
    hash: string;
    constructor(_pathRecognizer: RoutePath, redirectTo: any[]);
    path: string;
    /**
     * Returns `null` or a `ParsedUrl` representing the new path to match
     */
    recognize(beginningSegment: Url): Promise<RouteMatch>;
    generate(params: {
        [key: string]: any;
    }): ComponentInstruction;
}
export declare class RouteRule implements AbstractRule {
    private _routePath;
    handler: RouteHandler;
    private _routeName;
    specificity: string;
    terminal: boolean;
    hash: string;
    private _cache;
    constructor(_routePath: RoutePath, handler: RouteHandler, _routeName: string);
    path: string;
    recognize(beginningSegment: Url): Promise<RouteMatch>;
    generate(params: {
        [key: string]: any;
    }): ComponentInstruction;
    generateComponentPathValues(params: {
        [key: string]: any;
    }): GeneratedUrl;
    private _getInstruction(urlPath, urlParams, params);
}
