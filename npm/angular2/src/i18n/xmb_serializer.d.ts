import { HtmlAst } from 'angular2/src/compiler/html_ast';
import { Message } from './message';
import { ParseSourceSpan, ParseError } from 'angular2/src/compiler/parse_util';
export declare function serializeXmb(messages: Message[]): string;
export declare class XmbDeserializationResult {
    content: string;
    messages: {
        [key: string]: HtmlAst[];
    };
    errors: ParseError[];
    constructor(content: string, messages: {
        [key: string]: HtmlAst[];
    }, errors: ParseError[]);
}
export declare class XmbDeserializationError extends ParseError {
    constructor(span: ParseSourceSpan, msg: string);
}
export declare function deserializeXmb(content: string, url: string): XmbDeserializationResult;
