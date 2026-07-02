/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

/**
 * Transforms special-case bindings with 'style' or 'class' in their names. Must run before the
 * main binding specialization pass.
 */
export function specializeStyleBindings(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.update) {
      if (op.kind !== ir.OpKind.Binding) {
        continue;
      }

      switch (op.bindingKind) {
        case ir.BindingKind.ClassName:
          if (op.expression instanceof ir.Interpolation) {
            throw new Error(`Unexpected interpolation in ClassName binding`);
          }
          ir.OpList.replace<ir.UpdateOp>(
            op,
            ir.createClassPropOp(op.target, op.name, op.expression, op.sourceSpan),
          );
          break;
        case ir.BindingKind.StyleProperty:
          ir.OpList.replace<ir.UpdateOp>(
            op,
            ir.createStylePropOp(op.target, op.name, op.expression, op.unit, op.sourceSpan),
          );
          break;
        case ir.BindingKind.Property:
        case ir.BindingKind.Template:
          if (op.name === 'style') {
            ir.OpList.replace<ir.UpdateOp>(
              op,
              ir.createStyleMapOp(op.target, op.expression, op.sourceSpan),
            );
          } else if (op.name === 'class') {
            ir.OpList.replace<ir.UpdateOp>(
              op,
              ir.createClassMapOp(op.target, op.expression, op.sourceSpan),
            );
          }
          break;
      }
    }
  }
}
