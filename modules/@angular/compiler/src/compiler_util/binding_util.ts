/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassBuilder} from '../output/class_builder';
import * as o from '../output/output_ast';

export class CheckBindingField {
  constructor(public expression: o.ReadPropExpr, public bindingId: string) {}
}

export function createCheckBindingField(builder: ClassBuilder): CheckBindingField {
  const bindingId = `${builder.fields.length}`;
  const fieldExpr = createBindFieldExpr(bindingId);
  // private is fine here as no child view will reference the cached value...
  builder.fields.push(new o.ClassField(fieldExpr.name, null, [o.StmtModifier.Private]));
  builder.ctorStmts.push(o.THIS_EXPR.prop(fieldExpr.name).set(o.literal(undefined)).toStmt());
  return new CheckBindingField(fieldExpr, bindingId);
}

function createBindFieldExpr(bindingId: string): o.ReadPropExpr {
  return o.THIS_EXPR.prop(`_expr_${bindingId}`);
}

export function isFirstViewCheck(view: o.Expression): o.Expression {
  return o.not(view.prop('numberOfChecks'));
}