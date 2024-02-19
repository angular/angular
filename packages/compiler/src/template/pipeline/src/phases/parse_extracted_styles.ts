/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SecurityContext} from '../../../../core';
import * as o from '../../../../output/output_ast';
import {parse as parseStyle} from '../../../../render3/view/style_parser';
import * as ir from '../../ir';

import type {CompilationJob} from '../compilation';

/**
 * Parses extracted style and class attributes into separate ExtractedAttributeOps per style or
 * class property.
 */
export function parseExtractedStyles(job: CompilationJob) {
  const elements = new Map<ir.XrefId, ir.CreateOp>();

  for (const unit of job.units) {
    for (const op of unit.create) {
      if (ir.isElementOrContainerOp(op)) {
        elements.set(op.xref, op);
      }
    }
  }

  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.ExtractedAttribute && op.bindingKind === ir.BindingKind.Attribute &&
          ir.isStringLiteral(op.expression!)) {
        const target = elements.get(op.target)!;

        if (target !== undefined && target.kind === ir.OpKind.Template &&
            target.templateKind === ir.TemplateKind.Structural) {
          // TemplateDefinitionBuilder will not apply class and style bindings to structural
          // directives; instead, it will leave them as attributes.
          // (It's not clear what that would mean, anyway -- classes and styles on a structural
          // element should probably be a parse error.)
          // TODO: We may be able to remove this once Template Pipeline is the default.
          continue;
        }

        if (op.name === 'style') {
          const parsedStyles = parseStyle(op.expression.value);
          for (let i = 0; i < parsedStyles.length - 1; i += 2) {
            ir.OpList.insertBefore<ir.CreateOp>(
                ir.createExtractedAttributeOp(
                    op.target, ir.BindingKind.StyleProperty, null, parsedStyles[i],
                    o.literal(parsedStyles[i + 1]), null, null, SecurityContext.STYLE),
                op);
          }
          ir.OpList.remove<ir.CreateOp>(op);
        } else if (op.name === 'class') {
          const parsedClasses = op.expression.value.trim().split(/\s+/g);
          for (const parsedClass of parsedClasses) {
            ir.OpList.insertBefore<ir.CreateOp>(
                ir.createExtractedAttributeOp(
                    op.target, ir.BindingKind.ClassName, null, parsedClass, null, null, null,
                    SecurityContext.NONE),
                op);
          }
          ir.OpList.remove<ir.CreateOp>(op);
        }
      }
    }
  }
}
