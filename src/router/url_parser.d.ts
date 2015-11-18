/**
 * This class represents a parsed URL
 */
export declare class Url {
    path: string;
    child: Url;
    auxiliary: Url[];
    params: {
        [key: string]: any;
    };
    constructor(path: string, child?: Url, auxiliary?: Url[], params?: {
        [key: string]: any;
    });
    toString(): string;
    segmentToString(): string;
    private _matrixParamsToString();
}
export declare class RootUrl extends Url {
    constructor(path: string, child?: Url, auxiliary?: Url[], params?: {
        [key: string]: any;
    });
    toString(): string;
    segmentToString(): string;
    private _queryParamsToString();
}
export declare function pathSegmentsToUrl(pathSegments: string[]): Url;
export declare class UrlParser {
    private _remaining;
    peekStartsWith(str: string): boolean;
    capture(str: string): void;
    parse(url: string): Url;
    parseRoot(): Url;
    parseSegment(): Url;
    parseQueryParams(): {
        [key: string]: any;
    };
    parseMatrixParams(): {
        [key: string]: any;
    };
    parseParam(params: {
        [key: string]: any;
    }): void;
    parseAuxiliaryRoutes(): Url[];
}
export declare var parser: UrlParser;
export declare function serializeParams(paramMap: {
    [key: string]: any;
}): string[];
