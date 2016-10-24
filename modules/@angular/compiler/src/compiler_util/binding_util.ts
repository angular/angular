/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Identifiers, resolveIdentifier} from '../identifiers';
import {ClassBuilder} from '../output/class_builder';
import * as o from '../output/output_ast';

import {ConvertPropertyBindingResult} from './expression_converter';

export class CheckBindingField {
  constructor(public expression: o.ReadPropExpr, public bindingId: string) {}
}

export function createCheckBindingField(builder: ClassBuilder): CheckBindingField {
  const bindingId = `${builder.fields.length}`;
  const fieldExpr = createBindFieldExpr(bindingId);
  // private is fine here as no child view will reference the cached value...
  builder.fields.push(new o.ClassField(fieldExpr.name, null, [o.StmtModifier.Private]));
  builder.ctorStmts.push(o.THIS_EXPR.prop(fieldExpr.name)
                             .set(o.importExpr(resolveIdentifier(Identifiers.UNINITIALIZED)))
                             .toStmt());
  return new CheckBindingField(fieldExpr, bindingId);
}

export function createCheckBindingStmt(
    evalResult: ConvertPropertyBindingResult, fieldExpr: o.ReadPropExpr,
    throwOnChangeVar: o.Expression, actions: o.Statement[]): o.Statement[] {
  var condition: o.Expression = o.importExpr(resolveIdentifier(Identifiers.checkBinding)).callFn([
    throwOnChangeVar, fieldExpr, evalResult.currValExpr
  ]);
  if (evalResult.forceUpdate) {
    condition = evalResult.forceUpdate.or(condition);
  }
  return [
    ...evalResult.stmts, new o.IfStmt(condition, actions.concat([
      <o.Statement>o.THIS_EXPR.prop(fieldExpr.name).set(evalResult.currValExpr).toStmt()
    ]))
  ];
}

function createBindFieldExpr(bindingId: string): o.ReadPropExpr {
  return o.THIS_EXPR.prop(`_expr_${bindingId}`);
}
