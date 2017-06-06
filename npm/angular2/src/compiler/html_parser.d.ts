import { HtmlAst } from './html_ast';
import { ParseError, ParseSourceSpan } from './parse_util';
export declare class HtmlTreeError extends ParseError {
    elementName: string;
    static create(elementName: string, span: ParseSourceSpan, msg: string): HtmlTreeError;
    constructor(elementName: string, span: ParseSourceSpan, msg: string);
}
export declare class HtmlParseTreeResult {
    rootNodes: HtmlAst[];
    errors: ParseError[];
    constructor(rootNodes: HtmlAst[], errors: ParseError[]);
}
export declare class HtmlParser {
    parse(sourceContent: string, sourceUrl: string, parseExpansionForms?: boolean): HtmlParseTreeResult;
}
