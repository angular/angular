import { AST } from 'angular2/src/core/change_detection/change_detection';
import { CompileDirectiveMetadata } from './directive_metadata';
import { ParseSourceSpan } from './parse_util';
export interface TemplateAst {
    sourceSpan: ParseSourceSpan;
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class TextAst implements TemplateAst {
    value: string;
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
    constructor(value: string, ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class BoundTextAst implements TemplateAst {
    value: AST;
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
    constructor(value: AST, ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class AttrAst implements TemplateAst {
    name: string;
    value: string;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, value: string, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class BoundElementPropertyAst implements TemplateAst {
    name: string;
    type: PropertyBindingType;
    value: AST;
    unit: string;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, type: PropertyBindingType, value: AST, unit: string, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class BoundEventAst implements TemplateAst {
    name: string;
    target: string;
    handler: AST;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, target: string, handler: AST, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
    fullName: string;
}
export declare class VariableAst implements TemplateAst {
    name: string;
    value: string;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, value: string, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class ElementAst implements TemplateAst {
    name: string;
    attrs: AttrAst[];
    inputs: BoundElementPropertyAst[];
    outputs: BoundEventAst[];
    exportAsVars: VariableAst[];
    directives: DirectiveAst[];
    children: TemplateAst[];
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, attrs: AttrAst[], inputs: BoundElementPropertyAst[], outputs: BoundEventAst[], exportAsVars: VariableAst[], directives: DirectiveAst[], children: TemplateAst[], ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
    isBound(): boolean;
    getComponent(): CompileDirectiveMetadata;
}
export declare class EmbeddedTemplateAst implements TemplateAst {
    attrs: AttrAst[];
    outputs: BoundEventAst[];
    vars: VariableAst[];
    directives: DirectiveAst[];
    children: TemplateAst[];
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
    constructor(attrs: AttrAst[], outputs: BoundEventAst[], vars: VariableAst[], directives: DirectiveAst[], children: TemplateAst[], ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class BoundDirectivePropertyAst implements TemplateAst {
    directiveName: string;
    templateName: string;
    value: AST;
    sourceSpan: ParseSourceSpan;
    constructor(directiveName: string, templateName: string, value: AST, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class DirectiveAst implements TemplateAst {
    directive: CompileDirectiveMetadata;
    inputs: BoundDirectivePropertyAst[];
    hostProperties: BoundElementPropertyAst[];
    hostEvents: BoundEventAst[];
    exportAsVars: VariableAst[];
    sourceSpan: ParseSourceSpan;
    constructor(directive: CompileDirectiveMetadata, inputs: BoundDirectivePropertyAst[], hostProperties: BoundElementPropertyAst[], hostEvents: BoundEventAst[], exportAsVars: VariableAst[], sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class NgContentAst implements TemplateAst {
    index: number;
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
    constructor(index: number, ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare enum PropertyBindingType {
    Property = 0,
    Attribute = 1,
    Class = 2,
    Style = 3,
}
export interface TemplateAstVisitor {
    visitNgContent(ast: NgContentAst, context: any): any;
    visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any;
    visitElement(ast: ElementAst, context: any): any;
    visitVariable(ast: VariableAst, context: any): any;
    visitEvent(ast: BoundEventAst, context: any): any;
    visitElementProperty(ast: BoundElementPropertyAst, context: any): any;
    visitAttr(ast: AttrAst, context: any): any;
    visitBoundText(ast: BoundTextAst, context: any): any;
    visitText(ast: TextAst, context: any): any;
    visitDirective(ast: DirectiveAst, context: any): any;
    visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any;
}
export declare function templateVisitAll(visitor: TemplateAstVisitor, asts: TemplateAst[], context?: any): any[];
