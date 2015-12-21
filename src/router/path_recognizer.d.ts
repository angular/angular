import { Url } from './url_parser';
/**
 * Parses a URL string using a given matcher DSL, and generates URLs from param maps
 */
export declare class PathRecognizer {
    path: string;
    private _segments;
    specificity: string;
    terminal: boolean;
    hash: string;
    constructor(path: string);
    recognize(beginningSegment: Url): {
        [key: string]: any;
    };
    generate(params: {
        [key: string]: any;
    }): {
        [key: string]: any;
    };
}
