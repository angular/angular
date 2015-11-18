import { RouteHandler } from './route_handler';
import { Url } from './url_parser';
import { ComponentInstruction } from './instruction';
export declare class PathMatch {
    instruction: ComponentInstruction;
    remaining: Url;
    remainingAux: Url[];
    constructor(instruction: ComponentInstruction, remaining: Url, remainingAux: Url[]);
}
export declare class PathRecognizer {
    path: string;
    handler: RouteHandler;
    private _segments;
    specificity: number;
    terminal: boolean;
    hash: string;
    private _cache;
    constructor(path: string, handler: RouteHandler);
    recognize(beginningSegment: Url): PathMatch;
    generate(params: {
        [key: string]: any;
    }): ComponentInstruction;
    private _getInstruction(urlPath, urlParams, _recognizer, params);
}
