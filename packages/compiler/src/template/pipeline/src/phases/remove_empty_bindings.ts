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
 * Binding with no content can be safely deleted.
 */
export function removeEmptyBindings(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.update) {
      switch (op.kind) {
        case ir.OpKind.Attribute:
        case ir.OpKind.Binding:
        case ir.OpKind.ClassProp:
        case ir.OpKind.ClassMap:
        case ir.OpKind.Property:
        case ir.OpKind.StyleProp:
        case ir.OpKind.StyleMap:
          if (op.expression instanceof ir.EmptyExpr) {
            ir.OpList.remove<ir.UpdateOp>(op);
          }
          break;
      }
    }
  }
}
