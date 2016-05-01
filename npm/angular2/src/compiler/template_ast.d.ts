import { AST } from './expression_parser/ast';
import { CompileDirectiveMetadata, CompileTokenMetadata, CompileProviderMetadata } from './compile_metadata';
import { ParseSourceSpan } from './parse_util';
/**
 * An Abstract Syntax Tree node representing part of a parsed Angular template.
 */
export interface TemplateAst {
    /**
     * The source span from which this node was parsed.
     */
    sourceSpan: ParseSourceSpan;
    /**
     * Visit this node and possibly transform it.
     */
    visit(visitor: TemplateAstVisitor, context: any): any;
}
/**
 * A segment of text within the template.
 */
export declare class TextAst implements TemplateAst {
    value: string;
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
    constructor(value: string, ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
/**
 * A bound expression within the text of a template.
 */
export declare class BoundTextAst implements TemplateAst {
    value: AST;
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
    constructor(value: AST, ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
/**
 * A plain attribute on an element.
 */
export declare class AttrAst implements TemplateAst {
    name: string;
    value: string;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, value: string, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
/**
 * A binding for an element property (e.g. `[property]="expression"`).
 */
export declare class BoundElementPropertyAst implements TemplateAst {
    name: string;
    type: PropertyBindingType;
    value: AST;
    unit: string;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, type: PropertyBindingType, value: AST, unit: string, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
/**
 * A binding for an element event (e.g. `(event)="handler()"`).
 */
export declare class BoundEventAst implements TemplateAst {
    name: string;
    target: string;
    handler: AST;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, target: string, handler: AST, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
    fullName: string;
}
/**
 * A reference declaration on an element (e.g. `let someName="expression"`).
 */
export declare class ReferenceAst implements TemplateAst {
    name: string;
    value: CompileTokenMetadata;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, value: CompileTokenMetadata, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
/**
 * A variable declaration on a <template> (e.g. `var-someName="someLocalName"`).
 */
export declare class VariableAst implements TemplateAst {
    name: string;
    value: string;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, value: string, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
/**
 * An element declaration in a template.
 */
export declare class ElementAst implements TemplateAst {
    name: string;
    attrs: AttrAst[];
    inputs: BoundElementPropertyAst[];
    outputs: BoundEventAst[];
    references: ReferenceAst[];
    directives: DirectiveAst[];
    providers: ProviderAst[];
    hasViewContainer: boolean;
    children: TemplateAst[];
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
    constructor(name: string, attrs: AttrAst[], inputs: BoundElementPropertyAst[], outputs: BoundEventAst[], references: ReferenceAst[], directives: DirectiveAst[], providers: ProviderAst[], hasViewContainer: boolean, children: TemplateAst[], ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
/**
 * A `<template>` element included in an Angular template.
 */
export declare class EmbeddedTemplateAst implements TemplateAst {
    attrs: AttrAst[];
    outputs: BoundEventAst[];
    references: ReferenceAst[];
    variables: VariableAst[];
    directives: DirectiveAst[];
    providers: ProviderAst[];
    hasViewContainer: boolean;
    children: TemplateAst[];
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
    constructor(attrs: AttrAst[], outputs: BoundEventAst[], references: ReferenceAst[], variables: VariableAst[], directives: DirectiveAst[], providers: ProviderAst[], hasViewContainer: boolean, children: TemplateAst[], ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
/**
 * A directive property with a bound value (e.g. `*ngIf="condition").
 */
export declare class BoundDirectivePropertyAst implements TemplateAst {
    directiveName: string;
    templateName: string;
    value: AST;
    sourceSpan: ParseSourceSpan;
    constructor(directiveName: string, templateName: string, value: AST, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
/**
 * A directive declared on an element.
 */
export declare class DirectiveAst implements TemplateAst {
    directive: CompileDirectiveMetadata;
    inputs: BoundDirectivePropertyAst[];
    hostProperties: BoundElementPropertyAst[];
    hostEvents: BoundEventAst[];
    sourceSpan: ParseSourceSpan;
    constructor(directive: CompileDirectiveMetadata, inputs: BoundDirectivePropertyAst[], hostProperties: BoundElementPropertyAst[], hostEvents: BoundEventAst[], sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
/**
 * A provider declared on an element
 */
export declare class ProviderAst implements TemplateAst {
    token: CompileTokenMetadata;
    multiProvider: boolean;
    eager: boolean;
    providers: CompileProviderMetadata[];
    providerType: ProviderAstType;
    sourceSpan: ParseSourceSpan;
    constructor(token: CompileTokenMetadata, multiProvider: boolean, eager: boolean, providers: CompileProviderMetadata[], providerType: ProviderAstType, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
export declare enum ProviderAstType {
    PublicService = 0,
    PrivateService = 1,
    Component = 2,
    Directive = 3,
    Builtin = 4,
}
/**
 * Position where content is to be projected (instance of `<ng-content>` in a template).
 */
export declare class NgContentAst implements TemplateAst {
    index: number;
    ngContentIndex: number;
    sourceSpan: ParseSourceSpan;
    constructor(index: number, ngContentIndex: number, sourceSpan: ParseSourceSpan);
    visit(visitor: TemplateAstVisitor, context: any): any;
}
/**
 * Enumeration of types of property bindings.
 */
export declare enum PropertyBindingType {
    /**
     * A normal binding to a property (e.g. `[property]="expression"`).
     */
    Property = 0,
    /**
     * A binding to an element attribute (e.g. `[attr.name]="expression"`).
     */
    Attribute = 1,
    /**
     * A binding to a CSS class (e.g. `[class.name]="condition"`).
     */
    Class = 2,
    /**
     * A binding to a style rule (e.g. `[style.rule]="expression"`).
     */
    Style = 3,
}
/**
 * A visitor for {@link TemplateAst} trees that will process each node.
 */
export interface TemplateAstVisitor {
    visitNgContent(ast: NgContentAst, context: any): any;
    visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any;
    visitElement(ast: ElementAst, context: any): any;
    visitReference(ast: ReferenceAst, context: any): any;
    visitVariable(ast: VariableAst, context: any): any;
    visitEvent(ast: BoundEventAst, context: any): any;
    visitElementProperty(ast: BoundElementPropertyAst, context: any): any;
    visitAttr(ast: AttrAst, context: any): any;
    visitBoundText(ast: BoundTextAst, context: any): any;
    visitText(ast: TextAst, context: any): any;
    visitDirective(ast: DirectiveAst, context: any): any;
    visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any;
}
/**
 * Visit every node in a list of {@link TemplateAst}s with the given {@link TemplateAstVisitor}.
 */
export declare function templateVisitAll(visitor: TemplateAstVisitor, asts: TemplateAst[], context?: any): any[];
