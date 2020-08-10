/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';

/**
 * Base class for all IR `o.Expression`s.
 *
 * The IR defines several new kinds of expression nodes, all of which can exist within an
 * `o.Expression` AST (for example, pure function expressions). This base class provides a
 * foundation which bridges the `o.Expression` abstraction with the IR abstraction, and allows for
 * visitors and transformers which specifically understand IR expression nodes (like the
 * `ExpressionTransformer` defined below).
 *
 * IR `Expression`s cannot be output during code generation, and an exception will be thrown if one
 * is left in an `o.Expression` AST and passed to the code generator. `Expression`s should be
 * converted into a non-IR `o.Expression` via `toFinalExpression` prior to code generation.
 */
export abstract class Expression extends o.Expression {
  constructor() {
    super(/* type */ undefined);
  }

  visitExpression(visitor: ExpressionVisitor, ctx: any): o.Expression {
    // IR expressions can only be visited by a visitor which implements `visitIrExpression`.
    if (visitor.visitIrExpression !== undefined) {
      return visitor.visitIrExpression(this, ctx);
    } else {
      throw new Error('ir.Expression cannot be used in this context: ' + this.kind);
    }
  }

  isEquivalent(): boolean {
    throw new Error(`Comparisons of ir.Expressions are not supported.`);
  }

  isConstant(): boolean {
    return false;
  }

  abstract readonly kind: string;

  /**
   * Visit any `o.Expression`s which are stored in the current `Expression` with the given visitor.
   */
  abstract visitChildren(visitor: o.ExpressionVisitor, ctx?: any): void;

  /**
   * Finalize this expression into a non-IR `o.Expression` suitable for code generation.
   */
  abstract toFinalExpression(): o.Expression;
}

/**
 * An `o.ExpressionVisitor` which is potentially capable of visiting IR `Expression` nodes.
 *
 * This interface is directly compatible with `o.ExpressionVisitor` as the `visitIrExpression`
 * method is optional.
 */
export interface ExpressionVisitor<C = unknown> extends o.ExpressionVisitor {
  /**
   * Visit an IR `Expression`.
   */
  visitIrExpression?(node: Expression, ctx: C): any;
}

/**
 * A base class for transformers which process `o.Expression` ASTs that include embedded IR
 * `Expression`s.
 */
export abstract class ExpressionTransformer<C = unknown> implements ExpressionVisitor {
  visitIrExpression(expr: Expression, ctx: C): o.Expression {
    expr.visitChildren(this, ctx);
    return expr;
  }

  visitReadVarExpr(ast: o.ReadVarExpr, ctx: C): o.Expression {
    return ast;
  }

  visitWriteVarExpr(expr: o.WriteVarExpr, ctx: C): o.Expression {
    expr.value = expr.value.visitExpression(this, ctx);
    return expr;
  }

  visitWriteKeyExpr(expr: o.WriteKeyExpr, ctx: C): o.Expression {
    expr.receiver = expr.receiver.visitExpression(this, ctx);
    expr.value = expr.value.visitExpression(this, ctx);
    return expr;
  }

  visitWritePropExpr(expr: o.WritePropExpr, ctx: C): o.Expression {
    expr.receiver = expr.receiver.visitExpression(this, ctx);
    expr.value = expr.value.visitExpression(this, ctx);
    return expr;
  }

  visitInvokeMethodExpr(ast: o.InvokeMethodExpr, ctx: C): o.Expression {
    ast.receiver = ast.receiver.visitExpression(this, ctx);
    for (let i = 0; i < ast.args.length; i++) {
      ast.args[i] = ast.args[i].visitExpression(this, ctx);
    }
    return ast;
  }

  visitInvokeFunctionExpr(ast: o.InvokeFunctionExpr, ctx: C): o.Expression {
    ast.fn = ast.fn.visitExpression(this, ctx);
    for (let i = 0; i < ast.args.length; i++) {
      ast.args[i] = ast.args[i].visitExpression(this, ctx);
    }
    return ast;
  }

  visitInstantiateExpr(ast: o.InstantiateExpr, ctx: C): o.Expression {
    ast.classExpr = ast.classExpr.visitExpression(this, ctx);
    for (let i = 0; i < ast.args.length; i++) {
      ast.args[i] = ast.args[i].visitExpression(this, ctx);
    }
    return ast;
  }

  visitLiteralExpr(ast: o.LiteralExpr, ctx: C): o.Expression {
    return ast;
  }

  visitLocalizedString(ast: o.LocalizedString, ctx: C): o.Expression {
    for (let i = 0; i < ast.expressions.length; i++) {
      ast.expressions[i] = ast.expressions[i].visitExpression(this, ctx);
    }
    return ast;
  }

  visitExternalExpr(ast: o.ExternalExpr, ctx: C): o.Expression {
    return ast;
  }

  visitConditionalExpr(ast: o.ConditionalExpr, ctx: C): o.Expression {
    ast.condition = ast.condition.visitExpression(this, ctx);
    ast.trueCase = ast.trueCase.visitExpression(this, ctx);
    ast.falseCase = ast.falseCase?.visitExpression(this, ctx);
    return ast;
  }

  visitNotExpr(ast: o.NotExpr, ctx: C): o.Expression {
    ast.condition = ast.condition.visitExpression(this, ctx);
    return ast;
  }

  visitAssertNotNullExpr(ast: o.AssertNotNull, ctx: C): o.Expression {
    ast.condition = ast.condition.visitExpression(this, ctx);
    return ast;
  }

  visitCastExpr(ast: o.CastExpr, ctx: C): o.Expression {
    ast.value = ast.value.visitExpression(this, ctx);
    return ast;
  }

  visitFunctionExpr(ast: o.FunctionExpr, ctx: C): o.Expression {
    throw new Error('unsupported in this context');
  }

  visitBinaryOperatorExpr(ast: o.BinaryOperatorExpr, ctx: C): o.Expression {
    ast.lhs = ast.lhs.visitExpression(this, ctx);
    ast.rhs = ast.rhs.visitExpression(this, ctx);
    return ast;
  }

  visitReadPropExpr(ast: o.ReadPropExpr, ctx: C): o.Expression {
    ast.receiver = ast.receiver.visitExpression(this, ctx);
    return ast;
  }

  visitReadKeyExpr(ast: o.ReadKeyExpr, ctx: C): o.Expression {
    ast.receiver = ast.receiver.visitExpression(this, ctx);
    return ast;
  }

  visitLiteralArrayExpr(ast: o.LiteralArrayExpr, ctx: C): o.Expression {
    for (let i = 0; i < ast.entries.length; i++) {
      ast.entries[i] = ast.entries[i].visitExpression(this, ctx);
    }
    return ast;
  }

  visitLiteralMapExpr(ast: o.LiteralMapExpr, ctx: C): o.Expression {
    for (let i = 0; i < ast.entries.length; i++) {
      ast.entries[i].value = ast.entries[i].value.visitExpression(this, ctx);
    }
    return ast;
  }

  visitCommaExpr(ast: o.CommaExpr, ctx: C): o.Expression {
    for (let i = 0; i < ast.parts.length; i++) {
      ast.parts[i] = ast.parts[i].visitExpression(this, ctx);
    }
    return ast;
  }

  visitWrappedNodeExpr(ast: o.WrappedNodeExpr<any>, ctx: C): o.Expression {
    return ast;
  }

  visitTypeofExpr(ast: o.TypeofExpr, ctx: C): o.Expression {
    ast.expr = ast.expr.visitExpression(this, ctx);
    return ast;
  }
}
