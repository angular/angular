import { TemplateAstVisitor, ElementAst, BoundDirectivePropertyAst, DirectiveAst } from 'angular2/compiler';
import { AST } from 'angular2/src/core/change_detection/parser/ast';
import { Parser } from 'angular2/src/core/change_detection/parser/parser';
export declare function parseRouterLinkExpression(parser: Parser, exp: string): AST;
/**
 * A compiler plugin that implements the router link DSL.
 */
export declare class RouterLinkTransform implements TemplateAstVisitor {
    private astTransformer;
    constructor(parser: Parser);
    visitNgContent(ast: any, context: any): any;
    visitEmbeddedTemplate(ast: any, context: any): any;
    visitElement(ast: ElementAst, context: any): any;
    visitVariable(ast: any, context: any): any;
    visitEvent(ast: any, context: any): any;
    visitElementProperty(ast: any, context: any): any;
    visitAttr(ast: any, context: any): any;
    visitBoundText(ast: any, context: any): any;
    visitText(ast: any, context: any): any;
    visitDirective(ast: DirectiveAst, context: any): any;
    visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any;
}
