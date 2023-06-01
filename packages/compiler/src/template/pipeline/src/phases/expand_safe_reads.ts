/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as core from '../../../../core';
import * as cdAst from '../../../../expression_parser/ast';
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {ElementAttributes} from '../../ir/src/element';
import {ComponentCompilation} from '../compilation';

/**
 * Finds all unresolved safe read expressions, and converts them into the appropriate output AST
 * reads, guarded by null checks.
 */
export function phaseExpandSafeReads(cpl: ComponentCompilation): void {
  for (const [_, view] of cpl.views) {
    for (const op of view.ops()) {
      ir.visitTopLevelExpressionsInOp(op, new ConvertSafeAccessVisitor(), {});
    }
  }
}

class LeftMostVisitor extends ir.NullExpressionVisitor {
  constructor(private convertExpressionMap:
                  Map<o.Expression|ir.Expression, o.Expression|ir.Expression>) {
    super();
  }

  private visitAndReplace(ast: o.Expression|ir.Expression, ctx: any): any {
    return (this.convertExpressionMap.get(ast) || ast).visitExpression(this, ctx);
  }

  override visitReadPropExpr = (ast: o.ReadPropExpr, ctx: any) =>
      this.visitAndReplace(ast.receiver, ctx);
  override visitReadKeyExpr = (ast: o.ReadKeyExpr, ctx: any) =>
      this.visitAndReplace(ast.receiver, ctx);
  override visitInvokeFunctionExpr = (ast: o.InvokeFunctionExpr, ctx: any) =>
      this.visitAndReplace(ast.receiver, ctx);
  override visitSafePropertyReadExpr = (ast: ir.SafePropertyReadExpr, ctx: any) =>
      this.visitAndReplace(ast.receiver, ctx) || ast;
  override visitSafeKeyedReadExpr = (ast: ir.SafeKeyedReadExpr, ctx: any) =>
      this.visitAndReplace(ast.receiver, ctx) || ast;
  override visitSafeInvokeFunctionExpr = (ast: ir.SafeInvokeFunctionExpr, ctx: any) =>
      this.visitAndReplace(ast.receiver, ctx) || ast;
}

type UnsafeRead = o.ReadPropExpr|o.ReadKeyExpr|o.InvokeFunctionExpr;
type SafeRead = ir.SafePropertyReadExpr|ir.SafeKeyedReadExpr|ir.SafeInvokeFunctionExpr;

class ConvertSafeAccessVisitor extends ir.EverythingVisitor {
  convertExpressionMap = new Map<o.Expression|ir.Expression, o.Expression|ir.Expression>();

  private visitWithReplacement(ast: o.Expression|ir.Expression, ctx: any): any {
    return (this.convertExpressionMap.get(ast) || ast).visitExpression(this, ctx);
  }

  private convertSafeAccess(ast: UnsafeRead|SafeRead, leftMostSafe: SafeRead, ctx: any): any {
    const guardedExpression = this.visitWithReplacement(leftMostSafe.receiver, ctx);
    const condition = guardedExpression.isBlank();
    if (leftMostSafe instanceof ir.SafePropertyReadExpr) {
      this.convertExpressionMap.set(
          leftMostSafe,
          new o.ReadPropExpr(
              leftMostSafe.receiver, leftMostSafe.name, leftMostSafe.type,
              leftMostSafe.sourceSpan));
    } else if (leftMostSafe instanceof ir.SafeKeyedReadExpr) {
      this.convertExpressionMap.set(
          leftMostSafe,
          new o.ReadKeyExpr(
              leftMostSafe.receiver, leftMostSafe.index, leftMostSafe.type,
              leftMostSafe.sourceSpan));
    } else if (leftMostSafe instanceof ir.SafeInvokeFunctionExpr) {
      this.convertExpressionMap.set(
          leftMostSafe,
          new o.InvokeFunctionExpr(
              leftMostSafe.receiver, leftMostSafe.args, leftMostSafe.type, leftMostSafe.sourceSpan,
              leftMostSafe.pure));
    } else {
      throw new Error('Cannot convert safe access of unsafe read');
    }
    const access = this.visitWithReplacement(ast, ctx);
    this.convertExpressionMap.delete(leftMostSafe);
    return condition.conditional(o.NULL_EXPR, access);
  }

  private leftMostSafeNode(ast: UnsafeRead|SafeRead, ctx: any): SafeRead|null {
    return ast.visitExpression(new LeftMostVisitor(this.convertExpressionMap), ctx);
  }

  override visitReadPropExpr = (ast: o.ReadPropExpr, ctx: any) => {
    const leftMostSafe = this.leftMostSafeNode(ast, ctx);
    if (leftMostSafe) {
      return this.convertSafeAccess(ast, leftMostSafe, ctx);
    }
    return this.visitWithReplacement(ast.receiver, ctx).prop(ast.name);
  };

  override visitReadKeyExpr = (ast: o.ReadKeyExpr, ctx: any) => {
    const leftMostSafe = this.leftMostSafeNode(ast, ctx);
    if (leftMostSafe) {
      return this.convertSafeAccess(ast, leftMostSafe, ctx);
    }
    return this.visitWithReplacement(ast.receiver, ctx)
        .key(this.visitWithReplacement(ast.index, ctx));
  };

  override visitInvokeFunctionExpr = (ast: o.InvokeFunctionExpr, ctx: any) => {
    const leftMostSafe = this.leftMostSafeNode(ast, ctx);
    if (leftMostSafe) {
      return this.convertSafeAccess(ast, leftMostSafe, ctx);
    }
    const convertedArgs = ast.args.map(arg => this.visitWithReplacement(arg, ctx));
    return this.visitWithReplacement(ast.receiver, ctx).callFn(convertedArgs);
  };

  override visitSafePropertyReadExpr = (ast: ir.SafePropertyReadExpr, ctx: any) =>
      this.convertSafeAccess(ast, this.leftMostSafeNode(ast, ctx)!, ctx);

  override visitSafeKeyedReadExpr =
      (ast: ir.SafeKeyedReadExpr, ctx: any) => {
        debugger;
        const leftMost = this.leftMostSafeNode(ast, ctx)!;
        return this.convertSafeAccess(ast, leftMost, ctx);
      }

  override visitSafeInvokeFunctionExpr = (ast: ir.SafeInvokeFunctionExpr, ctx: any) =>
      this.convertSafeAccess(ast, this.leftMostSafeNode(ast, ctx)!, ctx);
}
