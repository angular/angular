import { Url } from '../../url_parser';
import { RoutePath, GeneratedUrl, MatchedUrl } from './route_path';
/**
 * Parses a URL string using a given matcher DSL, and generates URLs from param maps
 */
export declare class ParamRoutePath implements RoutePath {
    routePath: string;
    specificity: string;
    terminal: boolean;
    hash: string;
    private _segments;
    /**
     * Takes a string representing the matcher DSL
     */
    constructor(routePath: string);
    matchUrl(url: Url): MatchedUrl;
    generateUrl(params: {
        [key: string]: any;
    }): GeneratedUrl;
    toString(): string;
    private _parsePathString(routePath);
    private _calculateSpecificity();
    private _calculateHash();
    private _assertValidPath(path);
    static RESERVED_CHARS: RegExp;
}
