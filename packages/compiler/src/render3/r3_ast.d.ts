/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { SecurityContext } from '../core';
import { AST, ASTWithSource, BindingType, BoundElementProperty, ParsedEvent, ParsedEventType } from '../expression_parser/ast';
import { I18nMeta } from '../i18n/i18n_ast';
import { ParseSourceSpan } from '../parse_util';
export interface Node {
    sourceSpan: ParseSourceSpan;
    visit<Result>(visitor: Visitor<Result>): Result;
}
/**
 * This is an R3 `Node`-like wrapper for a raw `html.Comment` node. We do not currently
 * require the implementation of a visitor for Comments as they are only collected at
 * the top-level of the R3 AST, and only if `Render3ParseOptions['collectCommentNodes']`
 * is true.
 */
export declare class Comment implements Node {
    value: string;
    sourceSpan: ParseSourceSpan;
    constructor(value: string, sourceSpan: ParseSourceSpan);
    visit<Result>(_visitor: Visitor<Result>): Result;
}
export declare class Text implements Node {
    value: string;
    sourceSpan: ParseSourceSpan;
    constructor(value: string, sourceSpan: ParseSourceSpan);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class BoundText implements Node {
    value: AST;
    sourceSpan: ParseSourceSpan;
    i18n?: I18nMeta | undefined;
    constructor(value: AST, sourceSpan: ParseSourceSpan, i18n?: I18nMeta | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
/**
 * Represents a text attribute in the template.
 *
 * `valueSpan` may not be present in cases where there is no value `<div a></div>`.
 * `keySpan` may also not be present for synthetic attributes from ICU expansions.
 */
export declare class TextAttribute implements Node {
    name: string;
    value: string;
    sourceSpan: ParseSourceSpan;
    readonly keySpan: ParseSourceSpan | undefined;
    valueSpan?: ParseSourceSpan | undefined;
    i18n?: I18nMeta | undefined;
    constructor(name: string, value: string, sourceSpan: ParseSourceSpan, keySpan: ParseSourceSpan | undefined, valueSpan?: ParseSourceSpan | undefined, i18n?: I18nMeta | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class BoundAttribute implements Node {
    name: string;
    type: BindingType;
    securityContext: SecurityContext;
    value: AST;
    unit: string | null;
    sourceSpan: ParseSourceSpan;
    readonly keySpan: ParseSourceSpan;
    valueSpan: ParseSourceSpan | undefined;
    i18n: I18nMeta | undefined;
    constructor(name: string, type: BindingType, securityContext: SecurityContext, value: AST, unit: string | null, sourceSpan: ParseSourceSpan, keySpan: ParseSourceSpan, valueSpan: ParseSourceSpan | undefined, i18n: I18nMeta | undefined);
    static fromBoundElementProperty(prop: BoundElementProperty, i18n?: I18nMeta): BoundAttribute;
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class BoundEvent implements Node {
    name: string;
    type: ParsedEventType;
    handler: AST;
    target: string | null;
    phase: string | null;
    sourceSpan: ParseSourceSpan;
    handlerSpan: ParseSourceSpan;
    readonly keySpan: ParseSourceSpan;
    constructor(name: string, type: ParsedEventType, handler: AST, target: string | null, phase: string | null, sourceSpan: ParseSourceSpan, handlerSpan: ParseSourceSpan, keySpan: ParseSourceSpan);
    static fromParsedEvent(event: ParsedEvent): BoundEvent;
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class Element implements Node {
    name: string;
    attributes: TextAttribute[];
    inputs: BoundAttribute[];
    outputs: BoundEvent[];
    directives: Directive[];
    children: Node[];
    references: Reference[];
    isSelfClosing: boolean;
    sourceSpan: ParseSourceSpan;
    startSourceSpan: ParseSourceSpan;
    endSourceSpan: ParseSourceSpan | null;
    readonly isVoid: boolean;
    i18n?: I18nMeta | undefined;
    constructor(name: string, attributes: TextAttribute[], inputs: BoundAttribute[], outputs: BoundEvent[], directives: Directive[], children: Node[], references: Reference[], isSelfClosing: boolean, sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan | null, isVoid: boolean, i18n?: I18nMeta | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare abstract class DeferredTrigger implements Node {
    nameSpan: ParseSourceSpan | null;
    sourceSpan: ParseSourceSpan;
    prefetchSpan: ParseSourceSpan | null;
    whenOrOnSourceSpan: ParseSourceSpan | null;
    hydrateSpan: ParseSourceSpan | null;
    constructor(nameSpan: ParseSourceSpan | null, sourceSpan: ParseSourceSpan, prefetchSpan: ParseSourceSpan | null, whenOrOnSourceSpan: ParseSourceSpan | null, hydrateSpan: ParseSourceSpan | null);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class BoundDeferredTrigger extends DeferredTrigger {
    value: AST;
    constructor(value: AST, sourceSpan: ParseSourceSpan, prefetchSpan: ParseSourceSpan | null, whenSourceSpan: ParseSourceSpan, hydrateSpan: ParseSourceSpan | null);
}
export declare class NeverDeferredTrigger extends DeferredTrigger {
}
export declare class IdleDeferredTrigger extends DeferredTrigger {
}
export declare class ImmediateDeferredTrigger extends DeferredTrigger {
}
export declare class HoverDeferredTrigger extends DeferredTrigger {
    reference: string | null;
    constructor(reference: string | null, nameSpan: ParseSourceSpan, sourceSpan: ParseSourceSpan, prefetchSpan: ParseSourceSpan | null, onSourceSpan: ParseSourceSpan | null, hydrateSpan: ParseSourceSpan | null);
}
export declare class TimerDeferredTrigger extends DeferredTrigger {
    delay: number;
    constructor(delay: number, nameSpan: ParseSourceSpan, sourceSpan: ParseSourceSpan, prefetchSpan: ParseSourceSpan | null, onSourceSpan: ParseSourceSpan | null, hydrateSpan: ParseSourceSpan | null);
}
export declare class InteractionDeferredTrigger extends DeferredTrigger {
    reference: string | null;
    constructor(reference: string | null, nameSpan: ParseSourceSpan, sourceSpan: ParseSourceSpan, prefetchSpan: ParseSourceSpan | null, onSourceSpan: ParseSourceSpan | null, hydrateSpan: ParseSourceSpan | null);
}
export declare class ViewportDeferredTrigger extends DeferredTrigger {
    reference: string | null;
    constructor(reference: string | null, nameSpan: ParseSourceSpan, sourceSpan: ParseSourceSpan, prefetchSpan: ParseSourceSpan | null, onSourceSpan: ParseSourceSpan | null, hydrateSpan: ParseSourceSpan | null);
}
export declare class BlockNode {
    nameSpan: ParseSourceSpan;
    sourceSpan: ParseSourceSpan;
    startSourceSpan: ParseSourceSpan;
    endSourceSpan: ParseSourceSpan | null;
    constructor(nameSpan: ParseSourceSpan, sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan | null);
}
export declare class DeferredBlockPlaceholder extends BlockNode implements Node {
    children: Node[];
    minimumTime: number | null;
    i18n?: I18nMeta | undefined;
    constructor(children: Node[], minimumTime: number | null, nameSpan: ParseSourceSpan, sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan | null, i18n?: I18nMeta | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class DeferredBlockLoading extends BlockNode implements Node {
    children: Node[];
    afterTime: number | null;
    minimumTime: number | null;
    i18n?: I18nMeta | undefined;
    constructor(children: Node[], afterTime: number | null, minimumTime: number | null, nameSpan: ParseSourceSpan, sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan | null, i18n?: I18nMeta | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class DeferredBlockError extends BlockNode implements Node {
    children: Node[];
    i18n?: I18nMeta | undefined;
    constructor(children: Node[], nameSpan: ParseSourceSpan, sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan | null, i18n?: I18nMeta | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export interface DeferredBlockTriggers {
    when?: BoundDeferredTrigger;
    idle?: IdleDeferredTrigger;
    immediate?: ImmediateDeferredTrigger;
    hover?: HoverDeferredTrigger;
    timer?: TimerDeferredTrigger;
    interaction?: InteractionDeferredTrigger;
    viewport?: ViewportDeferredTrigger;
    never?: NeverDeferredTrigger;
}
export declare class DeferredBlock extends BlockNode implements Node {
    children: Node[];
    placeholder: DeferredBlockPlaceholder | null;
    loading: DeferredBlockLoading | null;
    error: DeferredBlockError | null;
    mainBlockSpan: ParseSourceSpan;
    i18n?: I18nMeta | undefined;
    readonly triggers: Readonly<DeferredBlockTriggers>;
    readonly prefetchTriggers: Readonly<DeferredBlockTriggers>;
    readonly hydrateTriggers: Readonly<DeferredBlockTriggers>;
    private readonly definedTriggers;
    private readonly definedPrefetchTriggers;
    private readonly definedHydrateTriggers;
    constructor(children: Node[], triggers: DeferredBlockTriggers, prefetchTriggers: DeferredBlockTriggers, hydrateTriggers: DeferredBlockTriggers, placeholder: DeferredBlockPlaceholder | null, loading: DeferredBlockLoading | null, error: DeferredBlockError | null, nameSpan: ParseSourceSpan, sourceSpan: ParseSourceSpan, mainBlockSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan | null, i18n?: I18nMeta | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
    visitAll(visitor: Visitor<unknown>): void;
    private visitTriggers;
}
export declare class SwitchBlock extends BlockNode implements Node {
    expression: AST;
    cases: SwitchBlockCase[];
    /**
     * These blocks are only captured to allow for autocompletion in the language service. They
     * aren't meant to be processed in any other way.
     */
    unknownBlocks: UnknownBlock[];
    constructor(expression: AST, cases: SwitchBlockCase[], 
    /**
     * These blocks are only captured to allow for autocompletion in the language service. They
     * aren't meant to be processed in any other way.
     */
    unknownBlocks: UnknownBlock[], sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan | null, nameSpan: ParseSourceSpan);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class SwitchBlockCase extends BlockNode implements Node {
    expression: AST | null;
    children: Node[];
    i18n?: I18nMeta | undefined;
    constructor(expression: AST | null, children: Node[], sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan | null, nameSpan: ParseSourceSpan, i18n?: I18nMeta | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class ForLoopBlock extends BlockNode implements Node {
    item: Variable;
    expression: ASTWithSource;
    trackBy: ASTWithSource;
    trackKeywordSpan: ParseSourceSpan;
    contextVariables: Variable[];
    children: Node[];
    empty: ForLoopBlockEmpty | null;
    mainBlockSpan: ParseSourceSpan;
    i18n?: I18nMeta | undefined;
    constructor(item: Variable, expression: ASTWithSource, trackBy: ASTWithSource, trackKeywordSpan: ParseSourceSpan, contextVariables: Variable[], children: Node[], empty: ForLoopBlockEmpty | null, sourceSpan: ParseSourceSpan, mainBlockSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan | null, nameSpan: ParseSourceSpan, i18n?: I18nMeta | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class ForLoopBlockEmpty extends BlockNode implements Node {
    children: Node[];
    i18n?: I18nMeta | undefined;
    constructor(children: Node[], sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan | null, nameSpan: ParseSourceSpan, i18n?: I18nMeta | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class IfBlock extends BlockNode implements Node {
    branches: IfBlockBranch[];
    constructor(branches: IfBlockBranch[], sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan | null, nameSpan: ParseSourceSpan);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class IfBlockBranch extends BlockNode implements Node {
    expression: AST | null;
    children: Node[];
    expressionAlias: Variable | null;
    i18n?: I18nMeta | undefined;
    constructor(expression: AST | null, children: Node[], expressionAlias: Variable | null, sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan | null, nameSpan: ParseSourceSpan, i18n?: I18nMeta | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class UnknownBlock implements Node {
    name: string;
    sourceSpan: ParseSourceSpan;
    nameSpan: ParseSourceSpan;
    constructor(name: string, sourceSpan: ParseSourceSpan, nameSpan: ParseSourceSpan);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class LetDeclaration implements Node {
    name: string;
    value: AST;
    sourceSpan: ParseSourceSpan;
    nameSpan: ParseSourceSpan;
    valueSpan: ParseSourceSpan;
    constructor(name: string, value: AST, sourceSpan: ParseSourceSpan, nameSpan: ParseSourceSpan, valueSpan: ParseSourceSpan);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class Component implements Node {
    componentName: string;
    tagName: string | null;
    fullName: string;
    attributes: TextAttribute[];
    inputs: BoundAttribute[];
    outputs: BoundEvent[];
    directives: Directive[];
    children: Node[];
    references: Reference[];
    isSelfClosing: boolean;
    sourceSpan: ParseSourceSpan;
    startSourceSpan: ParseSourceSpan;
    endSourceSpan: ParseSourceSpan | null;
    i18n?: I18nMeta | undefined;
    constructor(componentName: string, tagName: string | null, fullName: string, attributes: TextAttribute[], inputs: BoundAttribute[], outputs: BoundEvent[], directives: Directive[], children: Node[], references: Reference[], isSelfClosing: boolean, sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan | null, i18n?: I18nMeta | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class Directive implements Node {
    name: string;
    attributes: TextAttribute[];
    inputs: BoundAttribute[];
    outputs: BoundEvent[];
    references: Reference[];
    sourceSpan: ParseSourceSpan;
    startSourceSpan: ParseSourceSpan;
    endSourceSpan: ParseSourceSpan | null;
    i18n?: I18nMeta | undefined;
    constructor(name: string, attributes: TextAttribute[], inputs: BoundAttribute[], outputs: BoundEvent[], references: Reference[], sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan | null, i18n?: I18nMeta | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class Template implements Node {
    tagName: string | null;
    attributes: TextAttribute[];
    inputs: BoundAttribute[];
    outputs: BoundEvent[];
    directives: Directive[];
    templateAttrs: (BoundAttribute | TextAttribute)[];
    children: Node[];
    references: Reference[];
    variables: Variable[];
    isSelfClosing: boolean;
    sourceSpan: ParseSourceSpan;
    startSourceSpan: ParseSourceSpan;
    endSourceSpan: ParseSourceSpan | null;
    i18n?: I18nMeta | undefined;
    constructor(tagName: string | null, attributes: TextAttribute[], inputs: BoundAttribute[], outputs: BoundEvent[], directives: Directive[], templateAttrs: (BoundAttribute | TextAttribute)[], children: Node[], references: Reference[], variables: Variable[], isSelfClosing: boolean, sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan | null, i18n?: I18nMeta | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class Content implements Node {
    selector: string;
    attributes: TextAttribute[];
    children: Node[];
    isSelfClosing: boolean;
    sourceSpan: ParseSourceSpan;
    startSourceSpan: ParseSourceSpan;
    endSourceSpan: ParseSourceSpan | null;
    i18n?: I18nMeta | undefined;
    readonly name = "ng-content";
    constructor(selector: string, attributes: TextAttribute[], children: Node[], isSelfClosing: boolean, sourceSpan: ParseSourceSpan, startSourceSpan: ParseSourceSpan, endSourceSpan: ParseSourceSpan | null, i18n?: I18nMeta | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class Variable implements Node {
    name: string;
    value: string;
    sourceSpan: ParseSourceSpan;
    readonly keySpan: ParseSourceSpan;
    valueSpan?: ParseSourceSpan | undefined;
    constructor(name: string, value: string, sourceSpan: ParseSourceSpan, keySpan: ParseSourceSpan, valueSpan?: ParseSourceSpan | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class Reference implements Node {
    name: string;
    value: string;
    sourceSpan: ParseSourceSpan;
    readonly keySpan: ParseSourceSpan;
    valueSpan?: ParseSourceSpan | undefined;
    constructor(name: string, value: string, sourceSpan: ParseSourceSpan, keySpan: ParseSourceSpan, valueSpan?: ParseSourceSpan | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
export declare class Icu implements Node {
    vars: {
        [name: string]: BoundText;
    };
    placeholders: {
        [name: string]: Text | BoundText;
    };
    sourceSpan: ParseSourceSpan;
    i18n?: I18nMeta | undefined;
    constructor(vars: {
        [name: string]: BoundText;
    }, placeholders: {
        [name: string]: Text | BoundText;
    }, sourceSpan: ParseSourceSpan, i18n?: I18nMeta | undefined);
    visit<Result>(visitor: Visitor<Result>): Result;
}
/**
 * AST node that represents the host element of a directive.
 * This node is used only for type checking purposes and cannot be produced from a user's template.
 */
export declare class HostElement implements Node {
    readonly tagNames: string[];
    readonly bindings: BoundAttribute[];
    readonly listeners: BoundEvent[];
    readonly sourceSpan: ParseSourceSpan;
    constructor(tagNames: string[], bindings: BoundAttribute[], listeners: BoundEvent[], sourceSpan: ParseSourceSpan);
    visit<Result>(): Result;
}
export interface Visitor<Result = any> {
    visit?(node: Node): Result;
    visitElement(element: Element): Result;
    visitTemplate(template: Template): Result;
    visitContent(content: Content): Result;
    visitVariable(variable: Variable): Result;
    visitReference(reference: Reference): Result;
    visitTextAttribute(attribute: TextAttribute): Result;
    visitBoundAttribute(attribute: BoundAttribute): Result;
    visitBoundEvent(attribute: BoundEvent): Result;
    visitText(text: Text): Result;
    visitBoundText(text: BoundText): Result;
    visitIcu(icu: Icu): Result;
    visitDeferredBlock(deferred: DeferredBlock): Result;
    visitDeferredBlockPlaceholder(block: DeferredBlockPlaceholder): Result;
    visitDeferredBlockError(block: DeferredBlockError): Result;
    visitDeferredBlockLoading(block: DeferredBlockLoading): Result;
    visitDeferredTrigger(trigger: DeferredTrigger): Result;
    visitSwitchBlock(block: SwitchBlock): Result;
    visitSwitchBlockCase(block: SwitchBlockCase): Result;
    visitForLoopBlock(block: ForLoopBlock): Result;
    visitForLoopBlockEmpty(block: ForLoopBlockEmpty): Result;
    visitIfBlock(block: IfBlock): Result;
    visitIfBlockBranch(block: IfBlockBranch): Result;
    visitUnknownBlock(block: UnknownBlock): Result;
    visitLetDeclaration(decl: LetDeclaration): Result;
    visitComponent(component: Component): Result;
    visitDirective(directive: Directive): Result;
}
export declare class RecursiveVisitor implements Visitor<void> {
    visitElement(element: Element): void;
    visitTemplate(template: Template): void;
    visitDeferredBlock(deferred: DeferredBlock): void;
    visitDeferredBlockPlaceholder(block: DeferredBlockPlaceholder): void;
    visitDeferredBlockError(block: DeferredBlockError): void;
    visitDeferredBlockLoading(block: DeferredBlockLoading): void;
    visitSwitchBlock(block: SwitchBlock): void;
    visitSwitchBlockCase(block: SwitchBlockCase): void;
    visitForLoopBlock(block: ForLoopBlock): void;
    visitForLoopBlockEmpty(block: ForLoopBlockEmpty): void;
    visitIfBlock(block: IfBlock): void;
    visitIfBlockBranch(block: IfBlockBranch): void;
    visitContent(content: Content): void;
    visitComponent(component: Component): void;
    visitDirective(directive: Directive): void;
    visitVariable(variable: Variable): void;
    visitReference(reference: Reference): void;
    visitTextAttribute(attribute: TextAttribute): void;
    visitBoundAttribute(attribute: BoundAttribute): void;
    visitBoundEvent(attribute: BoundEvent): void;
    visitText(text: Text): void;
    visitBoundText(text: BoundText): void;
    visitIcu(icu: Icu): void;
    visitDeferredTrigger(trigger: DeferredTrigger): void;
    visitUnknownBlock(block: UnknownBlock): void;
    visitLetDeclaration(decl: LetDeclaration): void;
}
export declare function visitAll<Result>(visitor: Visitor<Result>, nodes: Node[]): Result[];
