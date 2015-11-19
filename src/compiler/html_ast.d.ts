import { ParseSourceSpan } from './parse_util';
export interface HtmlAst {
    sourceSpan: ParseSourceSpan;
    visit(visitor: HtmlAstVisitor, context: any): any;
}
export declare class HtmlTextAst implements HtmlAst {
    value: string;
    sourceSpan: ParseSourceSpan;
    constructor(value: string, sourceSpan: ParseSourceSpan);
    visit(visitor: HtmlAstVisitor, context: any): any;
}
export declare class HtmlAttrAst implements HtmlAst {
    name: string;
    value: string;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, value: string, sourceSpan: ParseSourceSpan);
    visit(visitor: HtmlAstVisitor, context: any): any;
}
export declare class HtmlElementAst implements HtmlAst {
    name: string;
    attrs: HtmlAttrAst[];
    children: HtmlAst[];
    sourceSpan: ParseSourceSpan;
    constructor(name: string, attrs: HtmlAttrAst[], children: HtmlAst[], sourceSpan: ParseSourceSpan);
    visit(visitor: HtmlAstVisitor, context: any): any;
}
export interface HtmlAstVisitor {
    visitElement(ast: HtmlElementAst, context: any): any;
    visitAttr(ast: HtmlAttrAst, context: any): any;
    visitText(ast: HtmlTextAst, context: any): any;
}
export declare function htmlVisitAll(visitor: HtmlAstVisitor, asts: HtmlAst[], context?: any): any[];
