import { HtmlAst } from './html_ast';
import { ParseError, ParseLocation } from './parse_util';
export declare class HtmlTreeError extends ParseError {
    elementName: string;
    static create(elementName: string, location: ParseLocation, msg: string): HtmlTreeError;
    constructor(elementName: string, location: ParseLocation, msg: string);
}
export declare class HtmlParseTreeResult {
    rootNodes: HtmlAst[];
    errors: ParseError[];
    constructor(rootNodes: HtmlAst[], errors: ParseError[]);
}
export declare class HtmlParser {
    parse(sourceContent: string, sourceUrl: string): HtmlParseTreeResult;
}
