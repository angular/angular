/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';

import type {ComponentCompilation, ViewCompilation} from '../compilation';

/**
 * Generate names for functions and variables across all views.
 *
 * This includes propagating those names into any `ir.ReadVariableExpr`s of those variables, so that
 * the reads can be emitted correctly.
 */
export function phaseNaming(cpl: ComponentCompilation): void {
  addNamesToView(cpl.root, cpl.componentName, {index: 0});
}

function addNamesToView(view: ViewCompilation, baseName: string, state: {index: number}): void {
  if (view.fnName === null) {
    view.fnName = `${baseName}_Template`;
  }

  // Keep track of the names we assign to variables in the view. We'll need to propagate these
  // into reads of those variables afterwards.
  const varNames = new Map<ir.XrefId, string>();

  for (const op of view.ops()) {
    switch (op.kind) {
      case ir.OpKind.Listener:
        if (op.handlerFnName === null) {
          // TODO(alxhub): convert this temporary name to match how the
          // `TemplateDefinitionBuilder` names listener functions.
          if (op.slot === null) {
            throw new Error(`Expected a slot to be assigned`);
          }
          op.handlerFnName = `${view.fnName}_${op.tag}_${op.name}_${op.slot}_listener`;
        }
        break;
      case ir.OpKind.Variable:
        varNames.set(op.xref, getVariableName(op.variable, state));
        break;
      case ir.OpKind.Template:
        const childView = view.tpl.views.get(op.xref)!;
        if (op.slot === null) {
          throw new Error(`Expected slot to be assigned`);
        }
        // TODO: properly escape the tag name.
        const safeTagName = op.tag.replace('-', '_');
        addNamesToView(childView, `${baseName}_${safeTagName}_${op.slot}`, state);
        break;
    }
  }

  // Having named all variables declared in the view, now we can push those names into the
  // `ir.ReadVariableExpr` expressions which represent reads of those variables.
  for (const op of view.ops()) {
    ir.visitExpressionsInOp(op, expr => {
      if (!(expr instanceof ir.ReadVariableExpr) || expr.name !== null) {
        return;
      }
      if (!varNames.has(expr.xref)) {
        throw new Error(`Variable ${expr.xref} not yet named`);
      }
      expr.name = varNames.get(expr.xref)!;
    });
  }
}

function getVariableName(variable: ir.SemanticVariable, state: {index: number}): string {
  if (variable.name === null) {
    switch (variable.kind) {
      case ir.SemanticVariableKind.Identifier:
        variable.name = `${variable.identifier}_${state.index++}`;
        break;
      default:
        variable.name = `_r${state.index++}`;
        break;
    }
  }
  return variable.name;
}
