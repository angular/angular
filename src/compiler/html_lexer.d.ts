import { ParseLocation, ParseError, ParseSourceSpan } from './parse_util';
export declare enum HtmlTokenType {
    TAG_OPEN_START = 0,
    TAG_OPEN_END = 1,
    TAG_OPEN_END_VOID = 2,
    TAG_CLOSE = 3,
    TEXT = 4,
    ESCAPABLE_RAW_TEXT = 5,
    RAW_TEXT = 6,
    COMMENT_START = 7,
    COMMENT_END = 8,
    CDATA_START = 9,
    CDATA_END = 10,
    ATTR_NAME = 11,
    ATTR_VALUE = 12,
    DOC_TYPE = 13,
    EOF = 14,
}
export declare class HtmlToken {
    type: HtmlTokenType;
    parts: string[];
    sourceSpan: ParseSourceSpan;
    constructor(type: HtmlTokenType, parts: string[], sourceSpan: ParseSourceSpan);
}
export declare class HtmlTokenError extends ParseError {
    tokenType: HtmlTokenType;
    constructor(errorMsg: string, tokenType: HtmlTokenType, location: ParseLocation);
}
export declare class HtmlTokenizeResult {
    tokens: HtmlToken[];
    errors: HtmlTokenError[];
    constructor(tokens: HtmlToken[], errors: HtmlTokenError[]);
}
export declare function tokenizeHtml(sourceContent: string, sourceUrl: string): HtmlTokenizeResult;
