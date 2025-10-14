/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../../../output/output_ast';
import type { ParseSourceSpan } from '../../../../parse_util';
import * as t from '../../../../render3/r3_ast';
import { ExpressionKind } from './enums';
import { SlotHandle } from './handle';
import type { XrefId } from './operations';
import type { CreateOp } from './ops/create';
import { type UpdateOp } from './ops/update';
import { ConsumesVarsTrait, DependsOnSlotContext, DependsOnSlotContextOpTrait, UsesVarOffset, UsesVarOffsetTrait } from './traits';
/**
 * An `o.Expression` subtype representing a logical expression in the intermediate representation.
 */
export type Expression = LexicalReadExpr | ReferenceExpr | ContextExpr | NextContextExpr | GetCurrentViewExpr | RestoreViewExpr | ResetViewExpr | ReadVariableExpr | PureFunctionExpr | PureFunctionParameterExpr | PipeBindingExpr | PipeBindingVariadicExpr | SafePropertyReadExpr | SafeKeyedReadExpr | SafeInvokeFunctionExpr | EmptyExpr | AssignTemporaryExpr | ReadTemporaryExpr | SlotLiteralExpr | ConditionalCaseExpr | ConstCollectedExpr | TwoWayBindingSetExpr | ContextLetReferenceExpr | StoreLetExpr | TrackContextExpr;
/**
 * Transformer type which converts expressions into general `o.Expression`s (which may be an
 * identity transformation).
 */
export type ExpressionTransform = (expr: o.Expression, flags: VisitorContextFlag) => o.Expression;
/**
 * Check whether a given `o.Expression` is a logical IR expression type.
 */
export declare function isIrExpression(expr: o.Expression): expr is Expression;
/**
 * Base type used for all logical IR expressions.
 */
export declare abstract class ExpressionBase extends o.Expression {
    abstract readonly kind: ExpressionKind;
    constructor(sourceSpan?: ParseSourceSpan | null);
    /**
     * Run the transformer against any nested expressions which may be present in this IR expression
     * subtype.
     */
    abstract transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag): void;
}
/**
 * Logical expression representing a lexical read of a variable name.
 */
export declare class LexicalReadExpr extends ExpressionBase {
    readonly name: string;
    readonly kind = ExpressionKind.LexicalRead;
    constructor(name: string);
    visitExpression(visitor: o.ExpressionVisitor, context: any): void;
    isEquivalent(other: LexicalReadExpr): boolean;
    isConstant(): boolean;
    transformInternalExpressions(): void;
    clone(): LexicalReadExpr;
}
/**
 * Runtime operation to retrieve the value of a local reference.
 */
export declare class ReferenceExpr extends ExpressionBase {
    readonly target: XrefId;
    readonly targetSlot: SlotHandle;
    readonly offset: number;
    readonly kind = ExpressionKind.Reference;
    constructor(target: XrefId, targetSlot: SlotHandle, offset: number);
    visitExpression(): void;
    isEquivalent(e: o.Expression): boolean;
    isConstant(): boolean;
    transformInternalExpressions(): void;
    clone(): ReferenceExpr;
}
export declare class StoreLetExpr extends ExpressionBase implements ConsumesVarsTrait, DependsOnSlotContextOpTrait {
    readonly target: XrefId;
    value: o.Expression;
    sourceSpan: ParseSourceSpan;
    readonly kind = ExpressionKind.StoreLet;
    readonly [ConsumesVarsTrait] = true;
    readonly [DependsOnSlotContext] = true;
    constructor(target: XrefId, value: o.Expression, sourceSpan: ParseSourceSpan);
    visitExpression(): void;
    isEquivalent(e: o.Expression): boolean;
    isConstant(): boolean;
    transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag): void;
    clone(): StoreLetExpr;
}
export declare class ContextLetReferenceExpr extends ExpressionBase {
    readonly target: XrefId;
    readonly targetSlot: SlotHandle;
    readonly kind = ExpressionKind.ContextLetReference;
    constructor(target: XrefId, targetSlot: SlotHandle);
    visitExpression(): void;
    isEquivalent(e: o.Expression): boolean;
    isConstant(): boolean;
    transformInternalExpressions(): void;
    clone(): ContextLetReferenceExpr;
}
/**
 * A reference to the current view context (usually the `ctx` variable in a template function).
 */
export declare class ContextExpr extends ExpressionBase {
    readonly view: XrefId;
    readonly kind = ExpressionKind.Context;
    constructor(view: XrefId);
    visitExpression(): void;
    isEquivalent(e: o.Expression): boolean;
    isConstant(): boolean;
    transformInternalExpressions(): void;
    clone(): ContextExpr;
}
/**
 * A reference to the current view context inside a track function.
 */
export declare class TrackContextExpr extends ExpressionBase {
    readonly view: XrefId;
    readonly kind = ExpressionKind.TrackContext;
    constructor(view: XrefId);
    visitExpression(): void;
    isEquivalent(e: o.Expression): boolean;
    isConstant(): boolean;
    transformInternalExpressions(): void;
    clone(): TrackContextExpr;
}
/**
 * Runtime operation to navigate to the next view context in the view hierarchy.
 */
export declare class NextContextExpr extends ExpressionBase {
    readonly kind = ExpressionKind.NextContext;
    steps: number;
    constructor();
    visitExpression(): void;
    isEquivalent(e: o.Expression): boolean;
    isConstant(): boolean;
    transformInternalExpressions(): void;
    clone(): NextContextExpr;
}
/**
 * Runtime operation to snapshot the current view context.
 *
 * The result of this operation can be stored in a variable and later used with the `RestoreView`
 * operation.
 */
export declare class GetCurrentViewExpr extends ExpressionBase {
    readonly kind = ExpressionKind.GetCurrentView;
    constructor();
    visitExpression(): void;
    isEquivalent(e: o.Expression): boolean;
    isConstant(): boolean;
    transformInternalExpressions(): void;
    clone(): GetCurrentViewExpr;
}
/**
 * Runtime operation to restore a snapshotted view.
 */
export declare class RestoreViewExpr extends ExpressionBase {
    view: XrefId | o.Expression;
    readonly kind = ExpressionKind.RestoreView;
    constructor(view: XrefId | o.Expression);
    visitExpression(visitor: o.ExpressionVisitor, context: any): void;
    isEquivalent(e: o.Expression): boolean;
    isConstant(): boolean;
    transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag): void;
    clone(): RestoreViewExpr;
}
/**
 * Runtime operation to reset the current view context after `RestoreView`.
 */
export declare class ResetViewExpr extends ExpressionBase {
    expr: o.Expression;
    readonly kind = ExpressionKind.ResetView;
    constructor(expr: o.Expression);
    visitExpression(visitor: o.ExpressionVisitor, context: any): any;
    isEquivalent(e: o.Expression): boolean;
    isConstant(): boolean;
    transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag): void;
    clone(): ResetViewExpr;
}
export declare class TwoWayBindingSetExpr extends ExpressionBase {
    target: o.Expression;
    value: o.Expression;
    readonly kind = ExpressionKind.TwoWayBindingSet;
    constructor(target: o.Expression, value: o.Expression);
    visitExpression(visitor: o.ExpressionVisitor, context: any): void;
    isEquivalent(other: TwoWayBindingSetExpr): boolean;
    isConstant(): boolean;
    transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag): void;
    clone(): TwoWayBindingSetExpr;
}
/**
 * Read of a variable declared as an `ir.VariableOp` and referenced through its `ir.XrefId`.
 */
export declare class ReadVariableExpr extends ExpressionBase {
    readonly xref: XrefId;
    readonly kind = ExpressionKind.ReadVariable;
    name: string | null;
    constructor(xref: XrefId);
    visitExpression(): void;
    isEquivalent(other: o.Expression): boolean;
    isConstant(): boolean;
    transformInternalExpressions(): void;
    clone(): ReadVariableExpr;
}
export declare class PureFunctionExpr extends ExpressionBase implements ConsumesVarsTrait, UsesVarOffsetTrait {
    readonly kind = ExpressionKind.PureFunctionExpr;
    readonly [ConsumesVarsTrait] = true;
    readonly [UsesVarOffset] = true;
    varOffset: number | null;
    /**
     * The expression which should be memoized as a pure computation.
     *
     * This expression contains internal `PureFunctionParameterExpr`s, which are placeholders for the
     * positional argument expressions in `args.
     */
    body: o.Expression | null;
    /**
     * Positional arguments to the pure function which will memoize the `body` expression, which act
     * as memoization keys.
     */
    args: o.Expression[];
    /**
     * Once extracted to the `ConstantPool`, a reference to the function which defines the computation
     * of `body`.
     */
    fn: o.Expression | null;
    constructor(expression: o.Expression | null, args: o.Expression[]);
    visitExpression(visitor: o.ExpressionVisitor, context: any): void;
    isEquivalent(other: o.Expression): boolean;
    isConstant(): boolean;
    transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag): void;
    clone(): PureFunctionExpr;
}
export declare class PureFunctionParameterExpr extends ExpressionBase {
    index: number;
    readonly kind = ExpressionKind.PureFunctionParameterExpr;
    constructor(index: number);
    visitExpression(): void;
    isEquivalent(other: o.Expression): boolean;
    isConstant(): boolean;
    transformInternalExpressions(): void;
    clone(): PureFunctionParameterExpr;
}
export declare class PipeBindingExpr extends ExpressionBase implements ConsumesVarsTrait, UsesVarOffsetTrait {
    readonly target: XrefId;
    readonly targetSlot: SlotHandle;
    readonly name: string;
    readonly args: o.Expression[];
    readonly kind = ExpressionKind.PipeBinding;
    readonly [ConsumesVarsTrait] = true;
    readonly [UsesVarOffset] = true;
    varOffset: number | null;
    constructor(target: XrefId, targetSlot: SlotHandle, name: string, args: o.Expression[]);
    visitExpression(visitor: o.ExpressionVisitor, context: any): void;
    isEquivalent(): boolean;
    isConstant(): boolean;
    transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag): void;
    clone(): PipeBindingExpr;
}
export declare class PipeBindingVariadicExpr extends ExpressionBase implements ConsumesVarsTrait, UsesVarOffsetTrait {
    readonly target: XrefId;
    readonly targetSlot: SlotHandle;
    readonly name: string;
    args: o.Expression;
    numArgs: number;
    readonly kind = ExpressionKind.PipeBindingVariadic;
    readonly [ConsumesVarsTrait] = true;
    readonly [UsesVarOffset] = true;
    varOffset: number | null;
    constructor(target: XrefId, targetSlot: SlotHandle, name: string, args: o.Expression, numArgs: number);
    visitExpression(visitor: o.ExpressionVisitor, context: any): void;
    isEquivalent(): boolean;
    isConstant(): boolean;
    transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag): void;
    clone(): PipeBindingVariadicExpr;
}
export declare class SafePropertyReadExpr extends ExpressionBase {
    receiver: o.Expression;
    name: string;
    readonly kind = ExpressionKind.SafePropertyRead;
    constructor(receiver: o.Expression, name: string);
    get index(): string;
    visitExpression(visitor: o.ExpressionVisitor, context: any): any;
    isEquivalent(): boolean;
    isConstant(): boolean;
    transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag): void;
    clone(): SafePropertyReadExpr;
}
export declare class SafeKeyedReadExpr extends ExpressionBase {
    receiver: o.Expression;
    index: o.Expression;
    readonly kind = ExpressionKind.SafeKeyedRead;
    constructor(receiver: o.Expression, index: o.Expression, sourceSpan: ParseSourceSpan | null);
    visitExpression(visitor: o.ExpressionVisitor, context: any): any;
    isEquivalent(): boolean;
    isConstant(): boolean;
    transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag): void;
    clone(): SafeKeyedReadExpr;
}
export declare class SafeInvokeFunctionExpr extends ExpressionBase {
    receiver: o.Expression;
    args: o.Expression[];
    readonly kind = ExpressionKind.SafeInvokeFunction;
    constructor(receiver: o.Expression, args: o.Expression[]);
    visitExpression(visitor: o.ExpressionVisitor, context: any): any;
    isEquivalent(): boolean;
    isConstant(): boolean;
    transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag): void;
    clone(): SafeInvokeFunctionExpr;
}
export declare class SafeTernaryExpr extends ExpressionBase {
    guard: o.Expression;
    expr: o.Expression;
    readonly kind = ExpressionKind.SafeTernaryExpr;
    constructor(guard: o.Expression, expr: o.Expression);
    visitExpression(visitor: o.ExpressionVisitor, context: any): any;
    isEquivalent(): boolean;
    isConstant(): boolean;
    transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag): void;
    clone(): SafeTernaryExpr;
}
export declare class EmptyExpr extends ExpressionBase {
    readonly kind = ExpressionKind.EmptyExpr;
    visitExpression(visitor: o.ExpressionVisitor, context: any): any;
    isEquivalent(e: Expression): boolean;
    isConstant(): boolean;
    clone(): EmptyExpr;
    transformInternalExpressions(): void;
}
export declare class AssignTemporaryExpr extends ExpressionBase {
    expr: o.Expression;
    xref: XrefId;
    readonly kind = ExpressionKind.AssignTemporaryExpr;
    name: string | null;
    constructor(expr: o.Expression, xref: XrefId);
    visitExpression(visitor: o.ExpressionVisitor, context: any): any;
    isEquivalent(): boolean;
    isConstant(): boolean;
    transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag): void;
    clone(): AssignTemporaryExpr;
}
export declare class ReadTemporaryExpr extends ExpressionBase {
    xref: XrefId;
    readonly kind = ExpressionKind.ReadTemporaryExpr;
    name: string | null;
    constructor(xref: XrefId);
    visitExpression(visitor: o.ExpressionVisitor, context: any): any;
    isEquivalent(): boolean;
    isConstant(): boolean;
    transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag): void;
    clone(): ReadTemporaryExpr;
}
export declare class SlotLiteralExpr extends ExpressionBase {
    readonly slot: SlotHandle;
    readonly kind = ExpressionKind.SlotLiteralExpr;
    constructor(slot: SlotHandle);
    visitExpression(visitor: o.ExpressionVisitor, context: any): any;
    isEquivalent(e: Expression): boolean;
    isConstant(): boolean;
    clone(): SlotLiteralExpr;
    transformInternalExpressions(): void;
}
export declare class ConditionalCaseExpr extends ExpressionBase {
    expr: o.Expression | null;
    readonly target: XrefId;
    readonly targetSlot: SlotHandle;
    readonly alias: t.Variable | null;
    readonly kind = ExpressionKind.ConditionalCase;
    /**
     * Create an expression for one branch of a conditional.
     * @param expr The expression to be tested for this case. Might be null, as in an `else` case.
     * @param target The Xref of the view to be displayed if this condition is true.
     */
    constructor(expr: o.Expression | null, target: XrefId, targetSlot: SlotHandle, alias?: t.Variable | null);
    visitExpression(visitor: o.ExpressionVisitor, context: any): any;
    isEquivalent(e: Expression): boolean;
    isConstant(): boolean;
    clone(): ConditionalCaseExpr;
    transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag): void;
}
export declare class ConstCollectedExpr extends ExpressionBase {
    expr: o.Expression;
    readonly kind = ExpressionKind.ConstCollected;
    constructor(expr: o.Expression);
    transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag): void;
    visitExpression(visitor: o.ExpressionVisitor, context: any): void;
    isEquivalent(e: o.Expression): boolean;
    isConstant(): boolean;
    clone(): ConstCollectedExpr;
}
/**
 * Visits all `Expression`s in the AST of `op` with the `visitor` function.
 */
export declare function visitExpressionsInOp(op: CreateOp | UpdateOp, visitor: (expr: o.Expression, flags: VisitorContextFlag) => void): void;
export declare enum VisitorContextFlag {
    None = 0,
    InChildOperation = 1
}
/**
 * Transform all `Expression`s in the AST of `op` with the `transform` function.
 *
 * All such operations will be replaced with the result of applying `transform`, which may be an
 * identity transformation.
 */
export declare function transformExpressionsInOp(op: CreateOp | UpdateOp, transform: ExpressionTransform, flags: VisitorContextFlag): void;
/**
 * Transform all `Expression`s in the AST of `expr` with the `transform` function.
 *
 * All such operations will be replaced with the result of applying `transform`, which may be an
 * identity transformation.
 */
export declare function transformExpressionsInExpression(expr: o.Expression, transform: ExpressionTransform, flags: VisitorContextFlag): o.Expression;
/**
 * Transform all `Expression`s in the AST of `stmt` with the `transform` function.
 *
 * All such operations will be replaced with the result of applying `transform`, which may be an
 * identity transformation.
 */
export declare function transformExpressionsInStatement(stmt: o.Statement, transform: ExpressionTransform, flags: VisitorContextFlag): void;
/**
 * Checks whether the given expression is a string literal.
 */
export declare function isStringLiteral(expr: o.Expression): expr is o.LiteralExpr & {
    value: string;
};
