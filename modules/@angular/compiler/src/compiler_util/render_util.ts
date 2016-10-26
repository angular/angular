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

export function writeToRenderer(
    view: o.Expression, boundProp: BoundElementPropertyAst, renderNode: o.Expression,
    renderValue: o.Expression, logBindingUpdate: boolean): o.Statement[] {
  const updateStmts: o.Statement[] = [];
  const renderer = view.prop('renderer');
  renderValue = sanitizedValue(view, boundProp, renderValue);
  switch (boundProp.type) {
    case PropertyBindingType.Property:
      if (logBindingUpdate) {
        updateStmts.push(o.importExpr(resolveIdentifier(Identifiers.setBindingDebugInfo))
                             .callFn([renderer, renderNode, o.literal(boundProp.name), renderValue])
                             .toStmt());
      }
      updateStmts.push(
          renderer
              .callMethod(
                  'setElementProperty', [renderNode, o.literal(boundProp.name), renderValue])
              .toStmt());
      break;
    case PropertyBindingType.Attribute:
      renderValue =
          renderValue.isBlank().conditional(o.NULL_EXPR, renderValue.callMethod('toString', []));
      updateStmts.push(
          renderer
              .callMethod(
                  'setElementAttribute', [renderNode, o.literal(boundProp.name), renderValue])
              .toStmt());
      break;
    case PropertyBindingType.Class:
      updateStmts.push(
          renderer
              .callMethod('setElementClass', [renderNode, o.literal(boundProp.name), renderValue])
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
              .callMethod('setElementStyle', [renderNode, o.literal(boundProp.name), renderValue])
              .toStmt());
      break;
    case PropertyBindingType.Animation:
      throw new Error('Illegal state: Should not come here!');
  }
  return updateStmts;
}

function sanitizedValue(
    view: o.Expression, boundProp: BoundElementPropertyAst,
    renderValue: o.Expression): o.Expression {
  let enumValue: string;
  switch (boundProp.securityContext) {
    case SecurityContext.NONE:
      return renderValue;  // No sanitization needed.
    case SecurityContext.HTML:
      enumValue = 'HTML';
      break;
    case SecurityContext.STYLE:
      enumValue = 'STYLE';
      break;
    case SecurityContext.SCRIPT:
      enumValue = 'SCRIPT';
      break;
    case SecurityContext.URL:
      enumValue = 'URL';
      break;
    case SecurityContext.RESOURCE_URL:
      enumValue = 'RESOURCE_URL';
      break;
    default:
      throw new Error(`internal error, unexpected SecurityContext ${boundProp.securityContext}.`);
  }
  let ctx = view.prop('viewUtils').prop('sanitizer');
  let args =
      [o.importExpr(resolveIdentifier(Identifiers.SecurityContext)).prop(enumValue), renderValue];
  return ctx.callMethod('sanitize', args);
}
