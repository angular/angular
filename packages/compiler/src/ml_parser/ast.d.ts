/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { I18nMeta } from '../i18n/i18n_ast';
import { ParseSourceSpan } from '../parse_util';
import { InterpolatedAttributeToken, InterpolatedTextToken } from './tokens';
interface BaseNode {
    sourceSpan: ParseSourceSpan;
    visit(visitor: Visitor, context: any): any;
}
export type Node = Attribute | Comment | Element | Expansion | ExpansionCase | Text | Block | BlockParameter | Component | Directive;
export declare abstract class NodeWithI18n implements BaseNode {
    sourceSpan: ParseSourceSpan;
    i18n?: I18nMeta | undefined;
    constructor(sourceSpan: ParseSourceSpan, i18n?: I18nMeta | undefined);
    abstract visit(visitor: Visitor, context: any): any;
}
export declare class Text extends NodeWithI18n {
    value: string;
    tokens: InterpolatedTextToken[];
    constructor(value: string, sourceSpan: ParseSourceSpan, tokens: InterpolatedTextToken[], i18n?: I18nMeta);
    visit(visitor: Visitor, context: any): any;
}
export declare class Expansion extends NodeWithI18n {
    switchValue: string;
    type: string;
    cases: ExpansionCase[];
    switchValueSourceSpan: ParseSourceSpan;
    constructor(switchValue: string, type: string, cases: ExpansionCase[], sourceSpan: ParseSourceSpan, switchValueSourceSpan: ParseSourceSpan, i18n?: I18nMeta);
    visit(visitor: Visitor, context: any): any;
}
export declare class ExpansionCase implements BaseNode {
    value: string;
    expression: Node[];
    sourceSpan: ParseSourceSpan;
    valueSourceSpan: ParseSourceSpan;
    expSourceSpan: ParseSourceSpan;
    constructor(value: string, expression: Node[], sourceSpan: ParseSourceSpan, valueSourceSpan: ParseSourceSpan, expSourceSpan: ParseSourceSpan);
    visit(visitor: Visitor, context: any): any;
}
export declare class Attribute extends NodeWithI18n {
    name: string;
    value: string;
    readonly keySpan: ParseSourceSpan | undefined;
    valueSpan: ParseSourceSpan | undefined;
    valueTokens: InterpolatedAttributeToken[] | undefined;
    constructor(name: string, value: string, sourceSpan: ParseSourceSpan, keySpan: ParseSourceSpan | undefined, valueSpan: ParseSourceSpan | undefined, valueTokens: InterpolatedAttributeToken[] | undefined, i18n: I18nMeta | undefined);
    visit(visitor: Visitor, context: any): any;
}
export declare class Element extends NodeWithI18n {
    name: string;
    attrs: Attribute[];
    readonly directives: Directive[];
    children: Node[];
    readonly isSelfClosing: boolean;
    startSourceSpan: ParseSourceSpan;
    endSourceSpan: ParseSourceSpan | null;
    readonly isVoid: boolean;
    constructor(name: string, attrs: Attribute[], directives: Directive[], children: Node[], isSelfClosing: boolean, sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: (ParseSourceSpan | null) | undefined, isVoid: boolean, i18n?: I18nMeta);
    visit(visitor: Visitor, context: any): any;
}
export declare class Comment implements BaseNode {
    value: string | null;
    sourceSpan: ParseSourceSpan;
    constructor(value: string | null, sourceSpan: ParseSourceSpan);
    visit(visitor: Visitor, context: any): any;
}
export declare class Block extends NodeWithI18n {
    name: string;
    parameters: BlockParameter[];
    children: Node[];
    nameSpan: ParseSourceSpan;
    startSourceSpan: ParseSourceSpan;
    endSourceSpan: ParseSourceSpan | null;
    constructor(name: string, parameters: BlockParameter[], children: Node[], sourceSpan: ParseSourceSpan, nameSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan?: ParseSourceSpan | null, i18n?: I18nMeta);
    visit(visitor: Visitor, context: any): any;
}
export declare class Component extends NodeWithI18n {
    readonly componentName: string;
    readonly tagName: string | null;
    readonly fullName: string;
    attrs: Attribute[];
    readonly directives: Directive[];
    readonly children: Node[];
    readonly isSelfClosing: boolean;
    readonly startSourceSpan: ParseSourceSpan;
    endSourceSpan: ParseSourceSpan | null;
    constructor(componentName: string, tagName: string | null, fullName: string, attrs: Attribute[], directives: Directive[], children: Node[], isSelfClosing: boolean, sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan?: ParseSourceSpan | null, i18n?: I18nMeta);
    visit(visitor: Visitor, context: any): any;
}
export declare class Directive implements BaseNode {
    readonly name: string;
    readonly attrs: Attribute[];
    readonly sourceSpan: ParseSourceSpan;
    readonly startSourceSpan: ParseSourceSpan;
    readonly endSourceSpan: ParseSourceSpan | null;
    constructor(name: string, attrs: Attribute[], sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan?: ParseSourceSpan | null);
    visit(visitor: Visitor, context: any): any;
}
export declare class BlockParameter implements BaseNode {
    expression: string;
    sourceSpan: ParseSourceSpan;
    constructor(expression: string, sourceSpan: ParseSourceSpan);
    visit(visitor: Visitor, context: any): any;
}
export declare class LetDeclaration implements BaseNode {
    name: string;
    value: string;
    sourceSpan: ParseSourceSpan;
    readonly nameSpan: ParseSourceSpan;
    valueSpan: ParseSourceSpan;
    constructor(name: string, value: string, sourceSpan: ParseSourceSpan, nameSpan: ParseSourceSpan, valueSpan: ParseSourceSpan);
    visit(visitor: Visitor, context: any): any;
}
export interface Visitor {
    visit?(node: Node, context: any): any;
    visitElement(element: Element, context: any): any;
    visitAttribute(attribute: Attribute, context: any): any;
    visitText(text: Text, context: any): any;
    visitComment(comment: Comment, context: any): any;
    visitExpansion(expansion: Expansion, context: any): any;
    visitExpansionCase(expansionCase: ExpansionCase, context: any): any;
    visitBlock(block: Block, context: any): any;
    visitBlockParameter(parameter: BlockParameter, context: any): any;
    visitLetDeclaration(decl: LetDeclaration, context: any): any;
    visitComponent(component: Component, context: any): any;
    visitDirective(directive: Directive, context: any): any;
}
export declare function visitAll(visitor: Visitor, nodes: Node[], context?: any): any[];
export declare class RecursiveVisitor implements Visitor {
    constructor();
    visitElement(ast: Element, context: any): any;
    visitAttribute(ast: Attribute, context: any): any;
    visitText(ast: Text, context: any): any;
    visitComment(ast: Comment, context: any): any;
    visitExpansion(ast: Expansion, context: any): any;
    visitExpansionCase(ast: ExpansionCase, context: any): any;
    visitBlock(block: Block, context: any): any;
    visitBlockParameter(ast: BlockParameter, context: any): any;
    visitLetDeclaration(decl: LetDeclaration, context: any): void;
    visitComponent(component: Component, context: any): void;
    visitDirective(directive: Directive, context: any): void;
    private visitChildren;
}
export {};
