import { ParseSourceSpan, ParseError } from 'angular2/src/compiler/parse_util';
import { HtmlAst, HtmlElementAst, HtmlAttrAst, HtmlTextAst } from 'angular2/src/compiler/html_ast';
import { Message } from './message';
import { Parser } from 'angular2/src/compiler/expression_parser/parser';
export declare const I18N_ATTR: string;
export declare const I18N_ATTR_PREFIX: string;
/**
 * An i18n error.
 */
export declare class I18nError extends ParseError {
    constructor(span: ParseSourceSpan, msg: string);
}
export declare function partition(nodes: HtmlAst[], errors: ParseError[]): Part[];
export declare class Part {
    rootElement: HtmlElementAst;
    rootTextNode: HtmlTextAst;
    children: HtmlAst[];
    i18n: string;
    hasI18n: boolean;
    constructor(rootElement: HtmlElementAst, rootTextNode: HtmlTextAst, children: HtmlAst[], i18n: string, hasI18n: boolean);
    sourceSpan: ParseSourceSpan;
    createMessage(parser: Parser): Message;
}
export declare function meaning(i18n: string): string;
export declare function description(i18n: string): string;
export declare function messageFromAttribute(parser: Parser, p: HtmlElementAst, attr: HtmlAttrAst): Message;
export declare function removeInterpolation(value: string, source: ParseSourceSpan, parser: Parser): string;
export declare function getPhNameFromBinding(input: string, index: number): string;
export declare function dedupePhName(usedNames: Map<string, number>, name: string): string;
export declare function stringifyNodes(nodes: HtmlAst[], parser: Parser): string;
