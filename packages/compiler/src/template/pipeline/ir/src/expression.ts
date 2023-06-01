/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import type {ParseSourceSpan} from '../../../../parse_util';

import {ExpressionKind, OpKind} from './enums';
import {ConsumesVarsTrait, UsesSlotIndex, UsesSlotIndexTrait, UsesVarOffset, UsesVarOffsetTrait} from './traits';

import type {XrefId} from './operations';
import type {CreateOp} from './ops/create';
import type {UpdateOp} from './ops/update';

/**
 * Expressions defined by the intermediate representation, as opposed to an `o.Expression`.
 */
export type Expression = LexicalReadExpr|ReferenceExpr|ContextExpr|NextContextExpr|
    GetCurrentViewExpr|RestoreViewExpr|ResetViewExpr|ReadVariableExpr|PureFunctionExpr|
    PureFunctionParameterExpr|PipeBindingExpr|PipeBindingVariadicExpr;

/**
 * A supplemented version of the output expression visitor, which also allows us to visit IR
 * expressions.
 */
export interface ExpressionVisitor extends o.ExpressionVisitor {
  visitLexicalReadExpr(ast: LexicalReadExpr, context: any): any;
  visitReferenceExpr(ast: ReferenceExpr, context: any): any;
  visitContextExpr(ast: ContextExpr, context: any): any;
  visitNextContextExpr(ast: NextContextExpr, context: any): any;
  visitGetCurrentViewExpr(ast: GetCurrentViewExpr, context: any): any;
  visitRestoreViewExpr(ast: RestoreViewExpr, context: any): any;
  visitResetViewExpr(ast: ResetViewExpr, context: any): any;
  visitReadVariableExpr(ast: ReadVariableExpr, context: any): any;
  visitPureFunctionExpr(ast: PureFunctionExpr, context: any): any;
  visitPureFunctionParameterExpr(ast: PureFunctionParameterExpr, context: any): any;
  visitPipeBindingExpr(ast: PipeBindingExpr, context: any): any;
  visitPipeBindingVariadicExpr(ast: PipeBindingVariadicExpr, context: any): any;
}

/**
 * The following type assertion statically ensures that the `ExpressionVisitor` supports all of the
 * expressions described by the `Expression` type.
 */
type AllVisitableTypes = {
  [method in keyof ExpressionVisitor]: Parameters<ExpressionVisitor[method]>[0]
}[keyof ExpressionVisitor];
type VisitorComplete = Expression extends AllVisitableTypes ? true : false;
const visitorSupportsAllTypes = true satisfies VisitorComplete;

/**
 * An IR expression visitor where the result of visiting any AST node is null.
 */
export abstract class NullExpressionVisitor implements ExpressionVisitor {
  visitReadVarExpr = (ast: o.ReadVarExpr, context: any) => null;
  visitWriteVarExpr = (ast: o.WriteVarExpr, context: any) => null;
  visitWriteKeyExpr = (ast: o.WriteKeyExpr, context: any) => null;
  visitWritePropExpr = (ast: o.WritePropExpr, context: any) => null;
  visitInvokeFunctionExpr = (ast: o.InvokeFunctionExpr, context: any) => null;
  visitTaggedTemplateExpr = (ast: o.TaggedTemplateExpr, context: any) => null;
  visitInstantiateExpr = (ast: o.InstantiateExpr, context: any) => null;
  visitLiteralExpr = (ast: o.LiteralExpr, context: any) => null;
  visitLocalizedString = (ast: o.LocalizedString, context: any) => null;
  visitExternalExpr = (ast: o.ExternalExpr, context: any) => null;
  visitConditionalExpr = (ast: o.ConditionalExpr, context: any) => null;
  visitNotExpr = (ast: o.NotExpr, context: any) => null;
  visitFunctionExpr = (ast: o.FunctionExpr, context: any) => null;
  visitUnaryOperatorExpr = (ast: o.UnaryOperatorExpr, context: any) => null;
  visitBinaryOperatorExpr = (ast: o.BinaryOperatorExpr, context: any) => null;
  visitReadPropExpr = (ast: o.ReadPropExpr, context: any) => null;
  visitReadKeyExpr = (ast: o.ReadKeyExpr, context: any) => null;
  visitLiteralArrayExpr = (ast: o.LiteralArrayExpr, context: any) => null;
  visitLiteralMapExpr = (ast: o.LiteralMapExpr, context: any) => null;
  visitCommaExpr = (ast: o.CommaExpr, context: any) => null;
  visitWrappedNodeExpr = (ast: o.WrappedNodeExpr<any>, context: any) => null;
  visitTypeofExpr = (ast: o.TypeofExpr, context: any) => null;
  visitLexicalReadExpr = (ast: LexicalReadExpr, context: any) => null;
  visitReferenceExpr = (ast: ReferenceExpr, context: any) => null;
  visitContextExpr = (ast: ContextExpr, context: any) => null;
  visitNextContextExpr = (ast: NextContextExpr, context: any) => null;
  visitGetCurrentViewExpr = (ast: GetCurrentViewExpr, context: any) => null;
  visitRestoreViewExpr = (ast: RestoreViewExpr, context: any) => null;
  visitResetViewExpr = (ast: ResetViewExpr, context: any) => null;
  visitReadVariableExpr = (ast: ReadVariableExpr, context: any) => null;
  visitPureFunctionExpr = (ast: PureFunctionExpr, context: any) => null;
  visitPureFunctionParameterExpr = (ast: PureFunctionParameterExpr, context: any) => null;
  visitPipeBindingExpr = (ast: PipeBindingExpr, context: any) => null;
  visitPipeBindingVariadicExpr = (ast: PipeBindingVariadicExpr, context: any) => null;
}

/**
 * An IR expression visitor which recursively visits the entire tree. By default, returns the
 * identity expression. Accepts an optional argument, which causes each expression to be transformed
 * before it is returned.
 */
export class EverythingVisitor implements ExpressionVisitor {
  constructor(
      private transform: (e: o.Expression|Expression, ctx: any) => (o.Expression | Expression) =
          (e, context) => e) {}

  private visitAll(
      ast: Expression|o.Expression, context: any,
      ...subexpressions: Array<Expression|o.Expression|null>): Expression|o.Expression {
    for (const sub of subexpressions) {
      if (sub != null) {
        sub.visitExpression(this, context);
      }
    }
    return this.transform(ast, context);
  }
  // Output expression types.
  visitReadVarExpr = (ast: o.ReadVarExpr, context: any) => this.visitAll(ast, context);
  visitWriteVarExpr = (ast: o.WriteVarExpr, context: any) => this.visitAll(ast, context, ast.value);
  visitWriteKeyExpr = (ast: o.WriteKeyExpr, context: any) =>
      this.visitAll(ast, context, ast.receiver, ast.index, ast.value);
  visitWritePropExpr = (ast: o.WritePropExpr, context: any) =>
      this.visitAll(ast, context, ast.receiver, ast.value);
  visitInvokeFunctionExpr = (ast: o.InvokeFunctionExpr, context: any) =>
      this.visitAll(ast, context, ast.fn, ...ast.args);
  visitTaggedTemplateExpr = (ast: o.TaggedTemplateExpr, context: any) =>
      this.visitAll(ast, context, ast.tag, ...ast.template.expressions);  // TODO: this is correct?
  visitInstantiateExpr = (ast: o.InstantiateExpr, context: any) =>
      this.visitAll(ast, context, ast.classExpr, ...ast.args);
  visitLiteralExpr = (ast: o.LiteralExpr, context: any) => this.visitAll(ast, context);
  visitLocalizedString = (ast: o.LocalizedString, context: any) =>
      this.visitAll(ast, context, ...ast.expressions);
  visitExternalExpr = (ast: o.ExternalExpr, context: any) => this.visitAll(ast, context);
  visitConditionalExpr = (ast: o.ConditionalExpr, context: any) =>
      this.visitAll(ast, context, ast.condition, ast.trueCase, ast.falseCase);
  visitNotExpr = (ast: o.NotExpr, context: any) => this.visitAll(ast, context, ast.condition);
  visitFunctionExpr = (ast: o.FunctionExpr, context: any) => this.visitAll(ast, context);
  visitUnaryOperatorExpr = (ast: o.UnaryOperatorExpr, context: any) =>
      this.visitAll(ast, context, ast.expr);
  visitBinaryOperatorExpr = (ast: o.BinaryOperatorExpr, context: any) =>
      this.visitAll(ast, context, ast.lhs, ast.rhs);
  visitReadPropExpr = (ast: o.ReadPropExpr, context: any) =>
      this.visitAll(ast, context, ast.receiver);
  visitReadKeyExpr = (ast: o.ReadKeyExpr, context: any) =>
      this.visitAll(ast, context, ast.receiver, ast.index);
  visitLiteralArrayExpr = (ast: o.LiteralArrayExpr, context: any) =>
      this.visitAll(ast, context, ...ast.entries);
  visitLiteralMapExpr = (ast: o.LiteralMapExpr, context: any) =>
      this.visitAll(ast, context, ...ast.entries.map(e => e.value));
  visitCommaExpr = (ast: o.CommaExpr, context: any) => this.visitAll(ast, context, ...ast.parts);
  visitWrappedNodeExpr = (ast: o.WrappedNodeExpr<any>, context: any) => this.visitAll(ast, context);
  visitTypeofExpr = (ast: o.TypeofExpr, context: any) => this.visitAll(ast, context, ast.expr);
  // IR expression types.
  visitLexicalReadExpr = (ast: LexicalReadExpr, context: any) => this.visitAll(ast, context);
  visitReferenceExpr = (ast: ReferenceExpr, context: any) => this.visitAll(ast, context);
  visitContextExpr = (ast: ContextExpr, context: any) => this.visitAll(ast, context);
  visitNextContextExpr = (ast: NextContextExpr, context: any) => this.visitAll(ast, context);
  visitGetCurrentViewExpr = (ast: GetCurrentViewExpr, context: any) => this.visitAll(ast, context);
  visitRestoreViewExpr = (ast: RestoreViewExpr, context: any) =>
      typeof ast.view === 'number' ? ast : this.visitAll(ast, context, ast.view);
  visitResetViewExpr = (ast: ResetViewExpr, context: any) => this.visitAll(ast, context, ast.expr);
  visitReadVariableExpr = (ast: ReadVariableExpr, context: any) => this.visitAll(ast, context);
  visitPureFunctionExpr = (ast: PureFunctionExpr, context: any) =>
      this.visitAll(ast, context, ast.body, ...ast.args);
  visitPureFunctionParameterExpr = (ast: PureFunctionParameterExpr, context: any) =>
      this.visitAll(ast, context);
  visitPipeBindingExpr = (ast: PipeBindingExpr, context: any) =>
      this.visitAll(ast, context, ...ast.args);
  visitPipeBindingVariadicExpr = (ast: PipeBindingVariadicExpr, context: any) =>
      this.visitAll(ast, context, ast.args);
}

/**
 * Transformer type which converts `o.Expression`s into other `o.Expression`s (which may be an
 * identity transformation).
 */
export type ExpressionTransform = (expr: o.Expression, flags: VisitorContextFlag) => o.Expression;

/**
 * Check whether a given `o.Expression` is a logical IR expression type.
 */
export function isIrExpression(expr: o.Expression): expr is Expression {
  return expr instanceof ExpressionBase;
}

/**
 * Base type used for all logical IR expressions.
 */
export abstract class ExpressionBase extends o.Expression {
  abstract readonly kind: ExpressionKind;

  constructor(sourceSpan: ParseSourceSpan|null = null) {
    super(null, sourceSpan);
  }

  /**
   * Run the transformer against any nested expressions which may be present in this IR expression
   * subtype.
   */
  abstract transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag):
      void;

  abstract override visitExpression(visitor: ExpressionVisitor, context: any): any;
}

/**
 * Logical expression representing a lexical read of a variable name.
 */
export class LexicalReadExpr extends ExpressionBase {
  override readonly kind = ExpressionKind.LexicalRead;

  constructor(readonly name: string) {
    super();
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitLexicalReadExpr(this, context);
  }

  override isEquivalent(): boolean {
    return false;
  }

  override isConstant(): boolean {
    return false;
  }

  override transformInternalExpressions(): void {}
}

/**
 * Runtime operation to retrieve the value of a local reference.
 */
export class ReferenceExpr extends ExpressionBase implements UsesSlotIndexTrait {
  override readonly kind = ExpressionKind.Reference;

  readonly[UsesSlotIndex] = true;

  slot: number|null = null;

  constructor(readonly target: XrefId, readonly offset: number) {
    super();
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitReferenceExpr(this, context);
  }

  override isEquivalent(e: o.Expression): boolean {
    return e instanceof ReferenceExpr && e.target === this.target;
  }

  override isConstant(): boolean {
    return false;
  }

  override transformInternalExpressions(): void {}
}

/**
 * A reference to the current view context (usually the `ctx` variable in a template function).
 */
export class ContextExpr extends ExpressionBase {
  override readonly kind = ExpressionKind.Context;

  constructor(readonly view: XrefId) {
    super();
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitContextExpr(this, context);
  }

  override isEquivalent(e: o.Expression): boolean {
    return e instanceof ContextExpr && e.view === this.view;
  }

  override isConstant(): boolean {
    return false;
  }

  override transformInternalExpressions(): void {}
}

/**
 * Runtime operation to navigate to the next view context in the view hierarchy.
 */
export class NextContextExpr extends ExpressionBase {
  override readonly kind = ExpressionKind.NextContext;

  steps = 1;

  constructor() {
    super();
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitNextContextExpr(this, context);
  }

  override isEquivalent(e: o.Expression): boolean {
    return e instanceof NextContextExpr && e.steps === this.steps;
  }

  override isConstant(): boolean {
    return false;
  }

  override transformInternalExpressions(): void {}
}

/**
 * Runtime operation to snapshot the current view context.
 *
 * The result of this operation can be stored in a variable and later used with the `RestoreView`
 * operation.
 */
export class GetCurrentViewExpr extends ExpressionBase {
  override readonly kind = ExpressionKind.GetCurrentView;

  constructor() {
    super();
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitGetCurrentViewExpr(this, context);
  }

  override isEquivalent(e: o.Expression): boolean {
    return e instanceof GetCurrentViewExpr;
  }

  override isConstant(): boolean {
    return false;
  }

  override transformInternalExpressions(): void {}
}

/**
 * Runtime operation to restore a snapshotted view.
 */
export class RestoreViewExpr extends ExpressionBase {
  override readonly kind = ExpressionKind.RestoreView;

  constructor(public view: XrefId|o.Expression) {
    super();
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitRestoreViewExpr(this, context);
  }

  override isEquivalent(e: o.Expression): boolean {
    if (!(e instanceof RestoreViewExpr) || typeof e.view !== typeof this.view) {
      return false;
    }

    if (typeof this.view === 'number') {
      return this.view === e.view;
    } else {
      return this.view.isEquivalent(e.view as o.Expression);
    }
  }

  override isConstant(): boolean {
    return false;
  }

  override transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag):
      void {
    if (typeof this.view !== 'number') {
      this.view = transformExpressionsInExpression(this.view, transform, flags);
    }
  }
}

/**
 * Runtime operation to reset the current view context after `RestoreView`.
 */
export class ResetViewExpr extends ExpressionBase {
  override readonly kind = ExpressionKind.ResetView;

  constructor(public expr: o.Expression) {
    super();
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitResetViewExpr(this, context);
  }

  override isEquivalent(e: o.Expression): boolean {
    return e instanceof ResetViewExpr && this.expr.isEquivalent(e.expr);
  }

  override isConstant(): boolean {
    return false;
  }

  override transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag):
      void {
    this.expr = transformExpressionsInExpression(this.expr, transform, flags);
  }
}

/**
 * Read of a variable declared as an `ir.VariableOp` and referenced through its `ir.XrefId`.
 */
export class ReadVariableExpr extends ExpressionBase {
  override readonly kind = ExpressionKind.ReadVariable;
  name: string|null = null;
  constructor(readonly xref: XrefId) {
    super();
  }

  override visitExpression(visitor: ExpressionVisitor, context: any): any {
    return visitor.visitReadVariableExpr(this, context);
  }

  override isEquivalent(other: o.Expression): boolean {
    return other instanceof ReadVariableExpr && other.xref === this.xref;
  }

  override isConstant(): boolean {
    return false;
  }

  override transformInternalExpressions(): void {}
}

export class PureFunctionExpr extends ExpressionBase implements ConsumesVarsTrait,
                                                                UsesVarOffsetTrait {
  override readonly kind = ExpressionKind.PureFunctionExpr;
  readonly[ConsumesVarsTrait] = true;
  readonly[UsesVarOffset] = true;

  varOffset: number|null = null;

  /**
   * The expression which should be memoized as a pure computation.
   *
   * This expression contains internal `PureFunctionParameterExpr`s, which are placeholders for the
   * positional argument expressions in `args.
   */
  body: o.Expression|null;

  /**
   * Positional arguments to the pure function which will memoize the `body` expression, which act
   * as memoization keys.
   */
  args: o.Expression[];

  /**
   * Once extracted to the `ConstantPool`, a reference to the function which defines the computation
   * of `body`.
   */
  fn: o.Expression|null = null;

  constructor(expression: o.Expression, args: o.Expression[]) {
    super();
    this.body = expression;
    this.args = args;
  }

  override visitExpression(visitor: ExpressionVisitor, context: any) {
    visitor.visitPureFunctionExpr(this, context);
  }

  override isEquivalent(other: o.Expression): boolean {
    if (!(other instanceof PureFunctionExpr) || other.args.length !== this.args.length) {
      return false;
    }

    return other.body !== null && this.body !== null && other.body.isEquivalent(this.body) &&
        other.args.every((arg, idx) => arg.isEquivalent(this.args[idx]));
  }

  override isConstant(): boolean {
    return false;
  }

  override transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag):
      void {
    if (this.body !== null) {
      // TODO: figure out if this is the right flag to pass here.
      this.body = transformExpressionsInExpression(
          this.body, transform, flags | VisitorContextFlag.InChildOperation);
    } else if (this.fn !== null) {
      this.fn = transformExpressionsInExpression(this.fn, transform, flags);
    }

    for (let i = 0; i < this.args.length; i++) {
      this.args[i] = transformExpressionsInExpression(this.args[i], transform, flags);
    }
  }
}

export class PureFunctionParameterExpr extends ExpressionBase {
  override readonly kind = ExpressionKind.PureFunctionParameterExpr;

  constructor(public index: number) {
    super();
  }

  override visitExpression(visitor: ExpressionVisitor, context: any) {
    visitor.visitPureFunctionParameterExpr(this, context);
  }

  override isEquivalent(other: o.Expression): boolean {
    return other instanceof PureFunctionParameterExpr && other.index === this.index;
  }

  override isConstant(): boolean {
    return true;
  }

  override transformInternalExpressions(): void {}
}

export class PipeBindingExpr extends ExpressionBase implements UsesSlotIndexTrait,
                                                               ConsumesVarsTrait,
                                                               UsesVarOffsetTrait {
  override readonly kind = ExpressionKind.PipeBinding;
  readonly[UsesSlotIndex] = true;
  readonly[ConsumesVarsTrait] = true;
  readonly[UsesVarOffset] = true;

  slot: number|null = null;
  varOffset: number|null = null;

  constructor(readonly target: XrefId, readonly name: string, readonly args: o.Expression[]) {
    super();
  }

  override visitExpression(visitor: ExpressionVisitor, context: any) {
    visitor.visitPipeBindingExpr(this, context);
  }

  override isEquivalent(): boolean {
    return false;
  }

  override isConstant(): boolean {
    return false;
  }

  override transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag):
      void {
    for (let idx = 0; idx < this.args.length; idx++) {
      this.args[idx] = transformExpressionsInExpression(this.args[idx], transform, flags);
    }
  }
}

export class PipeBindingVariadicExpr extends ExpressionBase implements UsesSlotIndexTrait,
                                                                       ConsumesVarsTrait,
                                                                       UsesVarOffsetTrait {
  override readonly kind = ExpressionKind.PipeBindingVariadic;
  readonly[UsesSlotIndex] = true;
  readonly[ConsumesVarsTrait] = true;
  readonly[UsesVarOffset] = true;

  slot: number|null = null;
  varOffset: number|null = null;

  constructor(
      readonly target: XrefId, readonly name: string, public args: o.Expression,
      public numArgs: number) {
    super();
  }

  override visitExpression(visitor: ExpressionVisitor, context: any) {
    visitor.visitPipeBindingVariadicExpr(this, context);
  }

  override isEquivalent(): boolean {
    return false;
  }

  override isConstant(): boolean {
    return false;
  }

  override transformInternalExpressions(transform: ExpressionTransform, flags: VisitorContextFlag):
      void {
    this.args = transformExpressionsInExpression(this.args, transform, flags);
  }
}

export enum VisitorContextFlag {
  None = 0b0000,
  InChildOperation = 0b0001,
}

/**
 * Using a full-blown `Visitor` class, visit only the top-level expressions of this op.
 * Note that unlike the other functions exported from this file, this function accepts a Visitor
 * *class*, not a visitor *function*. This provides more customizable behavior than a plain
 * `ExpressionTransform`, but unlike the other exported functions, you are responsible for
 * recursively exploring the tree of expressions yourself.
 */
export function visitTopLevelExpressionsInOp(
    op: CreateOp|UpdateOp, visitor: ExpressionVisitor, ctx: any) {
  switch (op.kind) {
    case OpKind.Property:
      op.expression = op.expression.visitExpression(visitor, ctx);
      break;
    case OpKind.Statement:
      if (op instanceof o.ExpressionStatement) {
        op.expr = op.expr.visitExpression(visitor, ctx);
      } else if (op instanceof o.ReturnStatement) {
        op.value = op.value.visitExpression(visitor, ctx);
      } else {
        throw new Error(`Unhandled statement kind: ${op.constructor.name}`);
      }
      break;
    case OpKind.Variable:
      op.initializer = op.initializer.visitExpression(visitor, ctx);
      break;
    case OpKind.InterpolateText:
      for (let i = 0; i < op.expressions.length; i++) {
        op.expressions[i] = op.expressions[i].visitExpression(visitor, ctx);
      }
      break;
    case OpKind.Listener:
      let currFlags: VisitorContextFlag = ctx.flags ?
          ctx.flags | VisitorContextFlag.InChildOperation :
          VisitorContextFlag.InChildOperation;
      for (const innerOp of op.handlerOps) {
        visitTopLevelExpressionsInOp(innerOp, visitor, {flags: currFlags});
      }
      break;
    case OpKind.Element:
    case OpKind.ElementStart:
    case OpKind.ElementEnd:
    case OpKind.Container:
    case OpKind.ContainerStart:
    case OpKind.ContainerEnd:
    case OpKind.Template:
    case OpKind.Text:
    case OpKind.Advance:
      // These operations contain no expressions.
      break;
    default:
      throw new Error(`AssertionError: expressionsInOp doesn't handle ${OpKind[op.kind]}`);
  }
}

/**
 * Applies a `visitor` function to all `Expression`s in the AST.
 */
export function visitExpressionsInOp(
    op: CreateOp|UpdateOp, visitor: (expr: o.Expression, flags: VisitorContextFlag) => void): void {
  transformExpressionsInOp(op, (expr, flags) => {
    visitor(expr, flags);
    return expr;
  }, VisitorContextFlag.None);
}

/**
 * Transform all `Expression`s in the AST of `op` with the `transform` function.
 *
 * All such operations will be replaced with the result of applying `transform`, which may be an
 * identity transformation.
 */
export function transformExpressionsInOp(
    op: CreateOp|UpdateOp, transform: ExpressionTransform, flags: VisitorContextFlag): void {
  switch (op.kind) {
    case OpKind.Property:
      op.expression = transformExpressionsInExpression(op.expression, transform, flags);
      break;
    case OpKind.InterpolateProperty:
      for (let i = 0; i < op.expressions.length; i++) {
        op.expressions[i] = transformExpressionsInExpression(op.expressions[i], transform, flags);
      }
      break;
    case OpKind.Statement:
      transformExpressionsInStatement(op.statement, transform, flags);
      break;
    case OpKind.Variable:
      op.initializer = transformExpressionsInExpression(op.initializer, transform, flags);
      break;
    case OpKind.InterpolateText:
      for (let i = 0; i < op.expressions.length; i++) {
        op.expressions[i] = transformExpressionsInExpression(op.expressions[i], transform, flags);
      }
      break;
    case OpKind.Listener:
      for (const innerOp of op.handlerOps) {
        transformExpressionsInOp(innerOp, transform, flags | VisitorContextFlag.InChildOperation);
      }
      break;
    case OpKind.Element:
    case OpKind.ElementStart:
    case OpKind.ElementEnd:
    case OpKind.Container:
    case OpKind.ContainerStart:
    case OpKind.ContainerEnd:
    case OpKind.Template:
    case OpKind.Text:
    case OpKind.Pipe:
    case OpKind.Advance:
      // These operations contain no expressions.
      break;
    default:
      throw new Error(`AssertionError: transformExpressionsInOp doesn't handle ${OpKind[op.kind]}`);
  }
}

/**
 * Transform all `Expression`s in the AST of `expr` with the `transform` function.
 *
 * All such operations will be replaced with the result of applying `transform`, which may be an
 * identity transformation.
 */
export function transformExpressionsInExpression(
    expr: o.Expression, transform: ExpressionTransform, flags: VisitorContextFlag): o.Expression {
  if (expr instanceof ExpressionBase) {
    expr.transformInternalExpressions(transform, flags);
  } else if (expr instanceof o.BinaryOperatorExpr) {
    expr.lhs = transformExpressionsInExpression(expr.lhs, transform, flags);
    expr.rhs = transformExpressionsInExpression(expr.rhs, transform, flags);
  } else if (expr instanceof o.ReadPropExpr) {
    expr.receiver = transformExpressionsInExpression(expr.receiver, transform, flags);
  } else if (expr instanceof o.ReadKeyExpr) {
    expr.receiver = transformExpressionsInExpression(expr.receiver, transform, flags);
    expr.index = transformExpressionsInExpression(expr.index, transform, flags);
  } else if (expr instanceof o.WritePropExpr) {
    expr.receiver = transformExpressionsInExpression(expr.receiver, transform, flags);
    expr.value = transformExpressionsInExpression(expr.value, transform, flags);
  } else if (expr instanceof o.WriteKeyExpr) {
    expr.receiver = transformExpressionsInExpression(expr.receiver, transform, flags);
    expr.index = transformExpressionsInExpression(expr.index, transform, flags);
    expr.value = transformExpressionsInExpression(expr.value, transform, flags);
  } else if (expr instanceof o.InvokeFunctionExpr) {
    expr.fn = transformExpressionsInExpression(expr.fn, transform, flags);
    for (let i = 0; i < expr.args.length; i++) {
      expr.args[i] = transformExpressionsInExpression(expr.args[i], transform, flags);
    }
  } else if (expr instanceof o.LiteralArrayExpr) {
    for (let i = 0; i < expr.entries.length; i++) {
      expr.entries[i] = transformExpressionsInExpression(expr.entries[i], transform, flags);
    }
  } else if (expr instanceof o.LiteralMapExpr) {
    for (let i = 0; i < expr.entries.length; i++) {
      expr.entries[i].value =
          transformExpressionsInExpression(expr.entries[i].value, transform, flags);
    }
  } else if (expr instanceof o.ConditionalExpr) {
    expr.condition = transformExpressionsInExpression(expr.condition, transform, flags);
    expr.trueCase = transformExpressionsInExpression(expr.trueCase, transform, flags);
    if (expr.falseCase !== null) {
      expr.falseCase = transformExpressionsInExpression(expr.falseCase, transform, flags);
    }
  } else if (
      expr instanceof o.ReadVarExpr || expr instanceof o.ExternalExpr ||
      expr instanceof o.LiteralExpr) {
    // No action for these types.
  } else {
    throw new Error(`Unhandled expression kind: ${expr.constructor.name}`);
  }
  return transform(expr, flags);
}

/**
 * Transform all `Expression`s in the AST of `stmt` with the `transform` function.
 *
 * All such operations will be replaced with the result of applying `transform`, which may be an
 * identity transformation.
 */
export function transformExpressionsInStatement(
    stmt: o.Statement, transform: ExpressionTransform, flags: VisitorContextFlag): void {
  if (stmt instanceof o.ExpressionStatement) {
    stmt.expr = transformExpressionsInExpression(stmt.expr, transform, flags);
  } else if (stmt instanceof o.ReturnStatement) {
    stmt.value = transformExpressionsInExpression(stmt.value, transform, flags);
  } else {
    throw new Error(`Unhandled statement kind: ${stmt.constructor.name}`);
  }
}
