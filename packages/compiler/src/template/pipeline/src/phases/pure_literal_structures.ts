/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

export function generatePureLiteralStructures(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.update) {
      ir.transformExpressionsInOp(
        op,
        (expr, flags) => {
          if (flags & ir.VisitorContextFlag.InChildOperation) {
            return expr;
          }

          if (expr instanceof o.LiteralArrayExpr) {
            return transformLiteralArray(expr);
          } else if (expr instanceof o.LiteralMapExpr) {
            return transformLiteralMap(expr);
          }

          return expr;
        },
        ir.VisitorContextFlag.None,
      );
    }
  }
}

function transformLiteralArray(expr: o.LiteralArrayExpr): o.Expression {
  const derivedEntries: o.Expression[] = [];
  const nonConstantArgs: o.Expression[] = [];
  for (const entry of expr.entries) {
    if (entry instanceof o.SpreadElementExpr) {
      if (entry.expression.isConstant()) {
        derivedEntries.push(entry);
      } else {
        const idx = nonConstantArgs.length;
        nonConstantArgs.push(entry.expression);
        derivedEntries.push(new o.SpreadElementExpr(new ir.PureFunctionParameterExpr(idx)));
      }
      continue;
    }

    if (entry.isConstant()) {
      derivedEntries.push(entry);
    } else {
      const idx = nonConstantArgs.length;
      nonConstantArgs.push(entry);
      derivedEntries.push(new ir.PureFunctionParameterExpr(idx));
    }
  }
  const pureExpr = new ir.PureFunctionExpr(o.literalArr(derivedEntries), nonConstantArgs);
  pureExpr.isFlatArrayLiteral = isFlatLiteral(expr);
  return pureExpr;
}

function transformLiteralMap(expr: o.LiteralMapExpr): o.Expression {
  let derivedEntries: o.LiteralMapEntry[] = [];
  const nonConstantArgs: o.Expression[] = [];
  for (const entry of expr.entries) {
    if (entry instanceof o.LiteralMapSpreadAssignment) {
      if (entry.expression.isConstant()) {
        derivedEntries.push(entry);
      } else {
        const idx = nonConstantArgs.length;
        nonConstantArgs.push(entry.expression);
        derivedEntries.push(
          new o.LiteralMapSpreadAssignment(new ir.PureFunctionParameterExpr(idx)),
        );
      }
      continue;
    }

    if (entry.value.isConstant()) {
      derivedEntries.push(entry);
    } else {
      const idx = nonConstantArgs.length;
      nonConstantArgs.push(entry.value);
      derivedEntries.push(
        new o.LiteralMapPropertyAssignment(
          entry.key,
          new ir.PureFunctionParameterExpr(idx),
          entry.quoted,
        ),
      );
    }
  }
  const pureExpr = new ir.PureFunctionExpr(new o.LiteralMapExpr(derivedEntries), nonConstantArgs);
  pureExpr.isFlatObjectLiteral = isFlatLiteral(expr);
  return pureExpr;
}

/**
 * Verifies whether an object or array literal expression is completely flat (contains no nested
 * object/array literals or spread operations).
 *
 * Flat static literals can be safely cloned at runtime using `ɵɵcloneObject` or `ɵɵcloneArray`
 * without risking inner reference sharing. Deeply nested literals automatically fall back to
 * unique factory function generation to guarantee reference sandboxing across component instances.
 */
function isFlatLiteral(expr: o.Expression): boolean {
  if (expr instanceof o.LiteralArrayExpr) {
    return expr.entries.every(
      (entry) =>
        !(
          entry instanceof o.SpreadElementExpr ||
          entry instanceof o.LiteralArrayExpr ||
          entry instanceof o.LiteralMapExpr
        ),
    );
  } else if (expr instanceof o.LiteralMapExpr) {
    return expr.entries.every(
      (entry) =>
        !(
          entry instanceof o.LiteralMapSpreadAssignment ||
          entry.value instanceof o.LiteralArrayExpr ||
          entry.value instanceof o.LiteralMapExpr
        ),
    );
  }
  return true;
}
