/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import {parse as parseStyle} from '../../../../render3/view/style_parser';
import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

/**
 * Parses extracted style and class attributes into separate ExtractedAttributeOps per style or
 * class property.
 */
export function parseExtractedStyles(job: CompilationJob) {
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.ExtractedAttribute && op.bindingKind === ir.BindingKind.Attribute &&
          ir.isStringLiteral(op.expression!)) {
        if (op.name === 'style') {
          const parsedStyles = parseStyle(op.expression.value);
          for (let i = 0; i < parsedStyles.length - 1; i += 2) {
            ir.OpList.insertBefore<ir.CreateOp>(
                ir.createExtractedAttributeOp(
                    op.target, ir.BindingKind.StyleProperty, parsedStyles[i],
                    o.literal(parsedStyles[i + 1]), null),
                op);
          }
          ir.OpList.remove<ir.CreateOp>(op);
        } else if (op.name === 'class') {
          const parsedClasses = op.expression.value.trim().split(/\s+/g);
          for (const parsedClass of parsedClasses) {
            ir.OpList.insertBefore<ir.CreateOp>(
                ir.createExtractedAttributeOp(
                    op.target, ir.BindingKind.ClassName, parsedClass, null, null),
                op);
          }
          ir.OpList.remove<ir.CreateOp>(op);
        }
      }
    }
  }
}
