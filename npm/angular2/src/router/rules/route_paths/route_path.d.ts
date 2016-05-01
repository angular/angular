import { Url } from '../../url_parser';
export declare class MatchedUrl {
    urlPath: string;
    urlParams: string[];
    allParams: {
        [key: string]: any;
    };
    auxiliary: Url[];
    rest: Url;
    constructor(urlPath: string, urlParams: string[], allParams: {
        [key: string]: any;
    }, auxiliary: Url[], rest: Url);
}
export declare class GeneratedUrl {
    urlPath: string;
    urlParams: {
        [key: string]: any;
    };
    constructor(urlPath: string, urlParams: {
        [key: string]: any;
    });
}
export interface RoutePath {
    specificity: string;
    terminal: boolean;
    hash: string;
    matchUrl(url: Url): MatchedUrl;
    generateUrl(params: {
        [key: string]: any;
    }): GeneratedUrl;
    toString(): string;
}
