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
import {UsesSlotIndex, UsesSlotIndexTrait} from './traits';

import type {XrefId} from './operations';
import type {CreateOp} from './ops/create';
import type {UpdateOp} from './ops/update';

/**
 * An `o.Expression` subtype representing a logical expression in the intermediate representation.
 */
export type Expression = LexicalReadExpr|ReferenceExpr|ContextExpr|NextContextExpr|
    GetCurrentViewExpr|RestoreViewExpr|ResetViewExpr|ReadVariableExpr;

/**
 * Transformer type which converts IR expressions into general `o.Expression`s (which may be an
 * identity transformation).
 */
export type ExpressionTransform = (expr: Expression, flags: VisitorContextFlag) => o.Expression;

/**
 * Check whether a given `o.Expression` is a logical IR expression type.
 */
export function isIrExpression(expr: o.Expression): boolean {
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
}

/**
 * Logical expression representing a lexical read of a variable name.
 */
export class LexicalReadExpr extends ExpressionBase {
  override readonly kind = ExpressionKind.LexicalRead;

  constructor(readonly name: string) {
    super();
  }

  override visitExpression(visitor: o.ExpressionVisitor, context: any): void {}

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

  override visitExpression(): void {}

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

  override visitExpression(): void {}

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

  override visitExpression(): void {}

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

  override visitExpression(): void {}

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

  override visitExpression(visitor: o.ExpressionVisitor, context: any): void {
    if (typeof this.view !== 'number') {
      this.view.visitExpression(visitor, context);
    }
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

  override visitExpression(visitor: o.ExpressionVisitor, context: any): any {
    this.expr.visitExpression(visitor, context);
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

  override visitExpression(): void {}

  override isEquivalent(other: o.Expression): boolean {
    return other instanceof ReadVariableExpr && other.xref === this.xref;
  }

  override isConstant(): boolean {
    return false;
  }

  override transformInternalExpressions(): void {}
}

/**
 * Visits all `Expression`s in the AST of `op` with the `visitor` function.
 */
export function visitExpressionsInOp(
    op: CreateOp|UpdateOp, visitor: (expr: Expression, flags: VisitorContextFlag) => void): void {
  transformExpressionsInOp(op, (expr, flags) => {
    visitor(expr, flags);
    return expr;
  }, VisitorContextFlag.None);
}

export enum VisitorContextFlag {
  None = 0b0000,
  InChildOperation = 0b0001,
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
    case OpKind.Template:
    case OpKind.Text:
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
    return transform(expr as Expression, flags);
  } else if (expr instanceof o.BinaryOperatorExpr) {
    expr.lhs = transformExpressionsInExpression(expr.lhs, transform, flags);
    expr.rhs = transformExpressionsInExpression(expr.rhs, transform, flags);
  } else if (expr instanceof o.ReadPropExpr) {
    expr.receiver = transformExpressionsInExpression(expr.receiver, transform, flags);
  } else if (expr instanceof o.InvokeFunctionExpr) {
    expr.fn = transformExpressionsInExpression(expr.fn, transform, flags);
    for (let i = 0; i < expr.args.length; i++) {
      expr.args[i] = transformExpressionsInExpression(expr.args[i], transform, flags);
    }
  } else if (
      expr instanceof o.ReadVarExpr || expr instanceof o.ExternalExpr ||
      expr instanceof o.LiteralExpr) {
    // No action for these types.
  } else {
    throw new Error(`Unhandled expression kind: ${expr.constructor.name}`);
  }
  return expr;
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
