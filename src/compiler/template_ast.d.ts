import { AST } from 'angular2/src/core/change_detection/change_detection';
import { CompileDirectiveMetadata } from './directive_metadata';
export interface TemplateAst {
    sourceInfo: string;
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class TextAst implements TemplateAst {
    value: string;
    ngContentIndex: number;
    sourceInfo: string;
    constructor(value: string, ngContentIndex: number, sourceInfo: string);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class BoundTextAst implements TemplateAst {
    value: AST;
    ngContentIndex: number;
    sourceInfo: string;
    constructor(value: AST, ngContentIndex: number, sourceInfo: string);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class AttrAst implements TemplateAst {
    name: string;
    value: string;
    sourceInfo: string;
    constructor(name: string, value: string, sourceInfo: string);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class BoundElementPropertyAst implements TemplateAst {
    name: string;
    type: PropertyBindingType;
    value: AST;
    unit: string;
    sourceInfo: string;
    constructor(name: string, type: PropertyBindingType, value: AST, unit: string, sourceInfo: string);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class BoundEventAst implements TemplateAst {
    name: string;
    target: string;
    handler: AST;
    sourceInfo: string;
    constructor(name: string, target: string, handler: AST, sourceInfo: string);
    visit(visitor: TemplateAstVisitor, context: any): any;
    fullName: string;
}
export declare class VariableAst implements TemplateAst {
    name: string;
    value: string;
    sourceInfo: string;
    constructor(name: string, value: string, sourceInfo: string);
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
    sourceInfo: string;
    constructor(name: string, attrs: AttrAst[], inputs: BoundElementPropertyAst[], outputs: BoundEventAst[], exportAsVars: VariableAst[], directives: DirectiveAst[], children: TemplateAst[], ngContentIndex: number, sourceInfo: string);
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
    sourceInfo: string;
    constructor(attrs: AttrAst[], outputs: BoundEventAst[], vars: VariableAst[], directives: DirectiveAst[], children: TemplateAst[], ngContentIndex: number, sourceInfo: string);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class BoundDirectivePropertyAst implements TemplateAst {
    directiveName: string;
    templateName: string;
    value: AST;
    sourceInfo: string;
    constructor(directiveName: string, templateName: string, value: AST, sourceInfo: string);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class DirectiveAst implements TemplateAst {
    directive: CompileDirectiveMetadata;
    inputs: BoundDirectivePropertyAst[];
    hostProperties: BoundElementPropertyAst[];
    hostEvents: BoundEventAst[];
    exportAsVars: VariableAst[];
    sourceInfo: string;
    constructor(directive: CompileDirectiveMetadata, inputs: BoundDirectivePropertyAst[], hostProperties: BoundElementPropertyAst[], hostEvents: BoundEventAst[], exportAsVars: VariableAst[], sourceInfo: string);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare class NgContentAst implements TemplateAst {
    index: number;
    ngContentIndex: number;
    sourceInfo: string;
    constructor(index: number, ngContentIndex: number, sourceInfo: string);
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
