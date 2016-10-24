/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SecurityContext} from '@angular/core';

import {isPresent} from '../facade/lang';
import {Identifiers, resolveIdentifier} from '../identifiers';
import * as o from '../output/output_ast';
import {BoundElementPropertyAst, PropertyBindingType} from '../template_parser/template_ast';

import {createEnumExpression} from './identifier_util';

export function writeToRenderer(
    view: o.Expression, boundProp: BoundElementPropertyAst, renderElement: o.Expression,
    renderValue: o.Expression, logBindingUpdate: boolean,
    securityContextExpression?: o.Expression): o.Statement[] {
  const updateStmts: o.Statement[] = [];
  const renderer = view.prop('renderer');
  renderValue = sanitizedValue(view, boundProp, renderValue, securityContextExpression);
  switch (boundProp.type) {
    case PropertyBindingType.Property:
      if (logBindingUpdate) {
        updateStmts.push(
            o.importExpr(resolveIdentifier(Identifiers.setBindingDebugInfo))
                .callFn([renderer, renderElement, o.literal(boundProp.name), renderValue])
                .toStmt());
      }
      updateStmts.push(
          renderer
              .callMethod(
                  'setElementProperty', [renderElement, o.literal(boundProp.name), renderValue])
              .toStmt());
      break;
    case PropertyBindingType.Attribute:
      renderValue =
          renderValue.isBlank().conditional(o.NULL_EXPR, renderValue.callMethod('toString', []));
      updateStmts.push(
          renderer
              .callMethod(
                  'setElementAttribute', [renderElement, o.literal(boundProp.name), renderValue])
              .toStmt());
      break;
    case PropertyBindingType.Class:
      updateStmts.push(
          renderer
              .callMethod(
                  'setElementClass', [renderElement, o.literal(boundProp.name), renderValue])
              .toStmt());
      break;
    case PropertyBindingType.Style:
      var strValue: o.Expression = renderValue.callMethod('toString', []);
      if (isPresent(boundProp.unit)) {
        strValue = strValue.plus(o.literal(boundProp.unit));
      }

      renderValue = renderValue.isBlank().conditional(o.NULL_EXPR, strValue);
      updateStmts.push(
          renderer
              .callMethod(
                  'setElementStyle', [renderElement, o.literal(boundProp.name), renderValue])
              .toStmt());
      break;
    case PropertyBindingType.Animation:
      throw new Error('Illegal state: Should not come here!');
  }
  return updateStmts;
}

function sanitizedValue(
    view: o.Expression, boundProp: BoundElementPropertyAst, renderValue: o.Expression,
    securityContextExpression?: o.Expression): o.Expression {
  if (boundProp.securityContext === SecurityContext.NONE) {
    return renderValue;  // No sanitization needed.
  }
  if (!boundProp.needsRuntimeSecurityContext) {
    securityContextExpression =
        createEnumExpression(Identifiers.SecurityContext, boundProp.securityContext);
  }
  if (!securityContextExpression) {
    throw new Error(`internal error, no SecurityContext given ${boundProp.name}`);
  }
  let ctx = view.prop('viewUtils').prop('sanitizer');
  let args = [securityContextExpression, renderValue];
  return ctx.callMethod('sanitize', args);
}
