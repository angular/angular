/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
export function generatePureLiteralStructures(job) {
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
function transformLiteralArray(expr) {
  const derivedEntries = [];
  const nonConstantArgs = [];
  for (const entry of expr.entries) {
    if (entry.isConstant()) {
      derivedEntries.push(entry);
    } else {
      const idx = nonConstantArgs.length;
      nonConstantArgs.push(entry);
      derivedEntries.push(new ir.PureFunctionParameterExpr(idx));
    }
  }
  return new ir.PureFunctionExpr(o.literalArr(derivedEntries), nonConstantArgs);
}
function transformLiteralMap(expr) {
  let derivedEntries = [];
  const nonConstantArgs = [];
  for (const entry of expr.entries) {
    if (entry.value.isConstant()) {
      derivedEntries.push(entry);
    } else {
      const idx = nonConstantArgs.length;
      nonConstantArgs.push(entry.value);
      derivedEntries.push(
        new o.LiteralMapEntry(entry.key, new ir.PureFunctionParameterExpr(idx), entry.quoted),
      );
    }
  }
  return new ir.PureFunctionExpr(o.literalMap(derivedEntries), nonConstantArgs);
}
//# sourceMappingURL=pure_literal_structures.js.map
