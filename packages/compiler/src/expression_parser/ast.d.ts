/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { SecurityContext } from '../core';
import { ParseError, ParseSourceSpan } from '../parse_util';
export declare class ParseSpan {
    start: number;
    end: number;
    constructor(start: number, end: number);
    toAbsolute(absoluteOffset: number): AbsoluteSourceSpan;
}
export declare abstract class AST {
    span: ParseSpan;
    /**
     * Absolute location of the expression AST in a source code file.
     */
    sourceSpan: AbsoluteSourceSpan;
    constructor(span: ParseSpan, 
    /**
     * Absolute location of the expression AST in a source code file.
     */
    sourceSpan: AbsoluteSourceSpan);
    abstract visit(visitor: AstVisitor, context?: any): any;
    toString(): string;
}
export declare abstract class ASTWithName extends AST {
    nameSpan: AbsoluteSourceSpan;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, nameSpan: AbsoluteSourceSpan);
}
export declare class EmptyExpr extends AST {
    visit(visitor: AstVisitor, context?: any): void;
}
export declare class ImplicitReceiver extends AST {
    visit(visitor: AstVisitor, context?: any): any;
}
/**
 * Receiver when something is accessed through `this` (e.g. `this.foo`). Note that this class
 * inherits from `ImplicitReceiver`, because accessing something through `this` is treated the
 * same as accessing it implicitly inside of an Angular template (e.g. `[attr.title]="this.title"`
 * is the same as `[attr.title]="title"`.). Inheriting allows for the `this` accesses to be treated
 * the same as implicit ones, except for a couple of exceptions like `$event` and `$any`.
 * TODO: we should find a way for this class not to extend from `ImplicitReceiver` in the future.
 */
export declare class ThisReceiver extends ImplicitReceiver {
    visit(visitor: AstVisitor, context?: any): any;
}
/**
 * Multiple expressions separated by a semicolon.
 */
export declare class Chain extends AST {
    expressions: any[];
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, expressions: any[]);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class Conditional extends AST {
    condition: AST;
    trueExp: AST;
    falseExp: AST;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, condition: AST, trueExp: AST, falseExp: AST);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class PropertyRead extends ASTWithName {
    receiver: AST;
    name: string;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, nameSpan: AbsoluteSourceSpan, receiver: AST, name: string);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class SafePropertyRead extends ASTWithName {
    receiver: AST;
    name: string;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, nameSpan: AbsoluteSourceSpan, receiver: AST, name: string);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class KeyedRead extends AST {
    receiver: AST;
    key: AST;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, receiver: AST, key: AST);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class SafeKeyedRead extends AST {
    receiver: AST;
    key: AST;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, receiver: AST, key: AST);
    visit(visitor: AstVisitor, context?: any): any;
}
/** Possible types for a pipe. */
export declare enum BindingPipeType {
    /**
     * Pipe is being referenced by its name, for example:
     * `@Pipe({name: 'foo'}) class FooPipe` and `{{123 | foo}}`.
     */
    ReferencedByName = 0,
    /**
     * Pipe is being referenced by its class name, for example:
     * `@Pipe() class FooPipe` and `{{123 | FooPipe}}`.
     */
    ReferencedDirectly = 1
}
export declare class BindingPipe extends ASTWithName {
    exp: AST;
    name: string;
    args: any[];
    readonly type: BindingPipeType;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, exp: AST, name: string, args: any[], type: BindingPipeType, nameSpan: AbsoluteSourceSpan);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class LiteralPrimitive extends AST {
    value: any;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, value: any);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class LiteralArray extends AST {
    expressions: any[];
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, expressions: any[]);
    visit(visitor: AstVisitor, context?: any): any;
}
export type LiteralMapKey = {
    key: string;
    quoted: boolean;
    isShorthandInitialized?: boolean;
};
export declare class LiteralMap extends AST {
    keys: LiteralMapKey[];
    values: any[];
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, keys: LiteralMapKey[], values: any[]);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class Interpolation extends AST {
    strings: string[];
    expressions: AST[];
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, strings: string[], expressions: AST[]);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class Binary extends AST {
    operation: string;
    left: AST;
    right: AST;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, operation: string, left: AST, right: AST);
    visit(visitor: AstVisitor, context?: any): any;
    static isAssignmentOperation(op: string): boolean;
}
/**
 * For backwards compatibility reasons, `Unary` inherits from `Binary` and mimics the binary AST
 * node that was originally used. This inheritance relation can be deleted in some future major,
 * after consumers have been given a chance to fully support Unary.
 */
export declare class Unary extends Binary {
    operator: string;
    expr: AST;
    left: never;
    right: never;
    operation: never;
    /**
     * Creates a unary minus expression "-x", represented as `Binary` using "0 - x".
     */
    static createMinus(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, expr: AST): Unary;
    /**
     * Creates a unary plus expression "+x", represented as `Binary` using "x - 0".
     */
    static createPlus(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, expr: AST): Unary;
    /**
     * During the deprecation period this constructor is private, to avoid consumers from creating
     * a `Unary` with the fallback properties for `Binary`.
     */
    private constructor();
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class PrefixNot extends AST {
    expression: AST;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, expression: AST);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class TypeofExpression extends AST {
    expression: AST;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, expression: AST);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class VoidExpression extends AST {
    expression: AST;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, expression: AST);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class NonNullAssert extends AST {
    expression: AST;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, expression: AST);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class Call extends AST {
    receiver: AST;
    args: AST[];
    argumentSpan: AbsoluteSourceSpan;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, receiver: AST, args: AST[], argumentSpan: AbsoluteSourceSpan);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class SafeCall extends AST {
    receiver: AST;
    args: AST[];
    argumentSpan: AbsoluteSourceSpan;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, receiver: AST, args: AST[], argumentSpan: AbsoluteSourceSpan);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class TaggedTemplateLiteral extends AST {
    tag: AST;
    template: TemplateLiteral;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, tag: AST, template: TemplateLiteral);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class TemplateLiteral extends AST {
    elements: TemplateLiteralElement[];
    expressions: AST[];
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, elements: TemplateLiteralElement[], expressions: AST[]);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class TemplateLiteralElement extends AST {
    text: string;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, text: string);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class ParenthesizedExpression extends AST {
    expression: AST;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, expression: AST);
    visit(visitor: AstVisitor, context?: any): any;
}
export declare class RegularExpressionLiteral extends AST {
    readonly body: string;
    readonly flags: string | null;
    constructor(span: ParseSpan, sourceSpan: AbsoluteSourceSpan, body: string, flags: string | null);
    visit(visitor: AstVisitor, context?: any): any;
}
/**
 * Records the absolute position of a text span in a source file, where `start` and `end` are the
 * starting and ending byte offsets, respectively, of the text span in a source file.
 */
export declare class AbsoluteSourceSpan {
    readonly start: number;
    readonly end: number;
    constructor(start: number, end: number);
}
export declare class ASTWithSource<T extends AST = AST> extends AST {
    ast: T;
    source: string | null;
    location: string;
    errors: ParseError[];
    constructor(ast: T, source: string | null, location: string, absoluteOffset: number, errors: ParseError[]);
    visit(visitor: AstVisitor, context?: any): any;
    toString(): string;
}
/**
 * TemplateBinding refers to a particular key-value pair in a microsyntax
 * expression. A few examples are:
 *
 *   |---------------------|--------------|---------|--------------|
 *   |     expression      |     key      |  value  | binding type |
 *   |---------------------|--------------|---------|--------------|
 *   | 1. let item         |    item      |  null   |   variable   |
 *   | 2. of items         |   ngForOf    |  items  |  expression  |
 *   | 3. let x = y        |      x       |    y    |   variable   |
 *   | 4. index as i       |      i       |  index  |   variable   |
 *   | 5. trackBy: func    | ngForTrackBy |   func  |  expression  |
 *   | 6. *ngIf="cond"     |     ngIf     |   cond  |  expression  |
 *   |---------------------|--------------|---------|--------------|
 *
 * (6) is a notable exception because it is a binding from the template key in
 * the LHS of a HTML attribute to the expression in the RHS. All other bindings
 * in the example above are derived solely from the RHS.
 */
export type TemplateBinding = VariableBinding | ExpressionBinding;
export declare class VariableBinding {
    readonly sourceSpan: AbsoluteSourceSpan;
    readonly key: TemplateBindingIdentifier;
    readonly value: TemplateBindingIdentifier | null;
    /**
     * @param sourceSpan entire span of the binding.
     * @param key name of the LHS along with its span.
     * @param value optional value for the RHS along with its span.
     */
    constructor(sourceSpan: AbsoluteSourceSpan, key: TemplateBindingIdentifier, value: TemplateBindingIdentifier | null);
}
export declare class ExpressionBinding {
    readonly sourceSpan: AbsoluteSourceSpan;
    readonly key: TemplateBindingIdentifier;
    readonly value: ASTWithSource | null;
    /**
     * @param sourceSpan entire span of the binding.
     * @param key binding name, like ngForOf, ngForTrackBy, ngIf, along with its
     * span. Note that the length of the span may not be the same as
     * `key.source.length`. For example,
     * 1. key.source = ngFor, key.span is for "ngFor"
     * 2. key.source = ngForOf, key.span is for "of"
     * 3. key.source = ngForTrackBy, key.span is for "trackBy"
     * @param value optional expression for the RHS.
     */
    constructor(sourceSpan: AbsoluteSourceSpan, key: TemplateBindingIdentifier, value: ASTWithSource | null);
}
export interface TemplateBindingIdentifier {
    source: string;
    span: AbsoluteSourceSpan;
}
export interface AstVisitor {
    /**
     * The `visitUnary` method is declared as optional for backwards compatibility. In an upcoming
     * major release, this method will be made required.
     */
    visitUnary?(ast: Unary, context: any): any;
    visitBinary(ast: Binary, context: any): any;
    visitChain(ast: Chain, context: any): any;
    visitConditional(ast: Conditional, context: any): any;
    /**
     * The `visitThisReceiver` method is declared as optional for backwards compatibility.
     * In an upcoming major release, this method will be made required.
     */
    visitThisReceiver?(ast: ThisReceiver, context: any): any;
    visitImplicitReceiver(ast: ImplicitReceiver, context: any): any;
    visitInterpolation(ast: Interpolation, context: any): any;
    visitKeyedRead(ast: KeyedRead, context: any): any;
    visitLiteralArray(ast: LiteralArray, context: any): any;
    visitLiteralMap(ast: LiteralMap, context: any): any;
    visitLiteralPrimitive(ast: LiteralPrimitive, context: any): any;
    visitPipe(ast: BindingPipe, context: any): any;
    visitPrefixNot(ast: PrefixNot, context: any): any;
    visitTypeofExpression(ast: TypeofExpression, context: any): any;
    visitVoidExpression(ast: TypeofExpression, context: any): any;
    visitNonNullAssert(ast: NonNullAssert, context: any): any;
    visitPropertyRead(ast: PropertyRead, context: any): any;
    visitSafePropertyRead(ast: SafePropertyRead, context: any): any;
    visitSafeKeyedRead(ast: SafeKeyedRead, context: any): any;
    visitCall(ast: Call, context: any): any;
    visitSafeCall(ast: SafeCall, context: any): any;
    visitTemplateLiteral(ast: TemplateLiteral, context: any): any;
    visitTemplateLiteralElement(ast: TemplateLiteralElement, context: any): any;
    visitTaggedTemplateLiteral(ast: TaggedTemplateLiteral, context: any): any;
    visitParenthesizedExpression(ast: ParenthesizedExpression, context: any): any;
    visitRegularExpressionLiteral(ast: RegularExpressionLiteral, context: any): any;
    visitASTWithSource?(ast: ASTWithSource, context: any): any;
    /**
     * This function is optionally defined to allow classes that implement this
     * interface to selectively decide if the specified `ast` should be visited.
     * @param ast node to visit
     * @param context context that gets passed to the node and all its children
     */
    visit?(ast: AST, context?: any): any;
}
export declare class RecursiveAstVisitor implements AstVisitor {
    visit(ast: AST, context?: any): any;
    visitUnary(ast: Unary, context: any): any;
    visitBinary(ast: Binary, context: any): any;
    visitChain(ast: Chain, context: any): any;
    visitConditional(ast: Conditional, context: any): any;
    visitPipe(ast: BindingPipe, context: any): any;
    visitImplicitReceiver(ast: ThisReceiver, context: any): any;
    visitThisReceiver(ast: ThisReceiver, context: any): any;
    visitInterpolation(ast: Interpolation, context: any): any;
    visitKeyedRead(ast: KeyedRead, context: any): any;
    visitLiteralArray(ast: LiteralArray, context: any): any;
    visitLiteralMap(ast: LiteralMap, context: any): any;
    visitLiteralPrimitive(ast: LiteralPrimitive, context: any): any;
    visitPrefixNot(ast: PrefixNot, context: any): any;
    visitTypeofExpression(ast: TypeofExpression, context: any): void;
    visitVoidExpression(ast: VoidExpression, context: any): void;
    visitNonNullAssert(ast: NonNullAssert, context: any): any;
    visitPropertyRead(ast: PropertyRead, context: any): any;
    visitSafePropertyRead(ast: SafePropertyRead, context: any): any;
    visitSafeKeyedRead(ast: SafeKeyedRead, context: any): any;
    visitCall(ast: Call, context: any): any;
    visitSafeCall(ast: SafeCall, context: any): any;
    visitTemplateLiteral(ast: TemplateLiteral, context: any): void;
    visitTemplateLiteralElement(ast: TemplateLiteralElement, context: any): void;
    visitTaggedTemplateLiteral(ast: TaggedTemplateLiteral, context: any): void;
    visitParenthesizedExpression(ast: ParenthesizedExpression, context: any): void;
    visitRegularExpressionLiteral(ast: RegularExpressionLiteral, context: any): void;
    visitAll(asts: AST[], context: any): any;
}
export declare class ParsedProperty {
    name: string;
    expression: ASTWithSource;
    type: ParsedPropertyType;
    sourceSpan: ParseSourceSpan;
    readonly keySpan: ParseSourceSpan;
    valueSpan: ParseSourceSpan | undefined;
    readonly isLiteral: boolean;
    readonly isLegacyAnimation: boolean;
    readonly isAnimation: boolean;
    constructor(name: string, expression: ASTWithSource, type: ParsedPropertyType, sourceSpan: ParseSourceSpan, keySpan: ParseSourceSpan, valueSpan: ParseSourceSpan | undefined);
}
export declare enum ParsedPropertyType {
    DEFAULT = 0,
    LITERAL_ATTR = 1,
    LEGACY_ANIMATION = 2,
    TWO_WAY = 3,
    ANIMATION = 4
}
export declare enum ParsedEventType {
    Regular = 0,
    LegacyAnimation = 1,
    TwoWay = 2,
    Animation = 3
}
export declare class ParsedEvent {
    name: string;
    targetOrPhase: string | null;
    type: ParsedEventType;
    handler: ASTWithSource;
    sourceSpan: ParseSourceSpan;
    handlerSpan: ParseSourceSpan;
    readonly keySpan: ParseSourceSpan;
    constructor(name: string, targetOrPhase: string | null, type: ParsedEventType.TwoWay, handler: ASTWithSource<NonNullAssert | PropertyRead | KeyedRead>, sourceSpan: ParseSourceSpan, handlerSpan: ParseSourceSpan, keySpan: ParseSourceSpan);
    constructor(name: string, targetOrPhase: string | null, type: ParsedEventType, handler: ASTWithSource, sourceSpan: ParseSourceSpan, handlerSpan: ParseSourceSpan, keySpan: ParseSourceSpan);
}
/**
 * ParsedVariable represents a variable declaration in a microsyntax expression.
 */
export declare class ParsedVariable {
    readonly name: string;
    readonly value: string;
    readonly sourceSpan: ParseSourceSpan;
    readonly keySpan: ParseSourceSpan;
    readonly valueSpan?: ParseSourceSpan | undefined;
    constructor(name: string, value: string, sourceSpan: ParseSourceSpan, keySpan: ParseSourceSpan, valueSpan?: ParseSourceSpan | undefined);
}
export declare enum BindingType {
    Property = 0,
    Attribute = 1,
    Class = 2,
    Style = 3,
    LegacyAnimation = 4,
    TwoWay = 5,
    Animation = 6
}
export declare class BoundElementProperty {
    name: string;
    type: BindingType;
    securityContext: SecurityContext;
    value: ASTWithSource;
    unit: string | null;
    sourceSpan: ParseSourceSpan;
    readonly keySpan: ParseSourceSpan | undefined;
    valueSpan: ParseSourceSpan | undefined;
    constructor(name: string, type: BindingType, securityContext: SecurityContext, value: ASTWithSource, unit: string | null, sourceSpan: ParseSourceSpan, keySpan: ParseSourceSpan | undefined, valueSpan: ParseSourceSpan | undefined);
}
