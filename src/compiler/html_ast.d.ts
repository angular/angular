export interface HtmlAst {
    sourceInfo: string;
    visit(visitor: HtmlAstVisitor, context: any): any;
}
export declare class HtmlTextAst implements HtmlAst {
    value: string;
    sourceInfo: string;
    constructor(value: string, sourceInfo: string);
    visit(visitor: HtmlAstVisitor, context: any): any;
}
export declare class HtmlAttrAst implements HtmlAst {
    name: string;
    value: string;
    sourceInfo: string;
    constructor(name: string, value: string, sourceInfo: string);
    visit(visitor: HtmlAstVisitor, context: any): any;
}
export declare class HtmlElementAst implements HtmlAst {
    name: string;
    attrs: HtmlAttrAst[];
    children: HtmlAst[];
    sourceInfo: string;
    constructor(name: string, attrs: HtmlAttrAst[], children: HtmlAst[], sourceInfo: string);
    visit(visitor: HtmlAstVisitor, context: any): any;
}
export interface HtmlAstVisitor {
    visitElement(ast: HtmlElementAst, context: any): any;
    visitAttr(ast: HtmlAttrAst, context: any): any;
    visitText(ast: HtmlTextAst, context: any): any;
}
export declare function htmlVisitAll(visitor: HtmlAstVisitor, asts: HtmlAst[], context?: any): any[];
