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
import {ComponentCompilationJob} from '../compilation';

/**
 * Parses extracted style attributes into separate ExtractedAttributeOps per style property.
 */
export function phaseParseExtractedStyles(cpl: ComponentCompilationJob) {
  for (const [_, view] of cpl.views) {
    for (const op of view.create) {
      if (op.kind === ir.OpKind.ExtractedAttribute && op.bindingKind === ir.BindingKind.Attribute) {
        if (op.name === 'style') {
          if (ir.isStringLiteral(op.expression!)) {
            const parsedStyles = parseStyle(op.expression.value);
            for (let i = 0; i < parsedStyles.length - 1; i += 2) {
              ir.OpList.insertBefore<ir.CreateOp>(
                  ir.createExtractedAttributeOp(
                      op.target, ir.BindingKind.StyleProperty, parsedStyles[i],
                      o.literal(parsedStyles[i + 1])),
                  op);
            }
            ir.OpList.remove<ir.CreateOp>(op);
          }
        }
      }
    }
  }
}
