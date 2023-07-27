/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {CompilationJob, HostBindingCompilationJob} from '../compilation';

export function phaseBindingSpecialization(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.update) {
      if (op.kind !== ir.OpKind.Binding) {
        continue;
      }

      switch (op.bindingKind) {
        case ir.BindingKind.Attribute:
          ir.OpList.replace<ir.UpdateOp>(
              op,
              ir.createAttributeOp(
                  op.target, op.name, op.expression, op.isTemplate, op.sourceSpan));
          break;
        case ir.BindingKind.Property:
          if (job instanceof HostBindingCompilationJob) {
            ir.OpList.replace<ir.UpdateOp>(
                op, ir.createHostPropertyOp(op.name, op.expression, op.sourceSpan));
          } else {
            ir.OpList.replace<ir.UpdateOp>(
                op,
                ir.createPropertyOp(
                    op.target, op.name, op.expression, op.isTemplate, op.sourceSpan));
          }

          break;
        case ir.BindingKind.I18n:
        case ir.BindingKind.ClassName:
        case ir.BindingKind.StyleProperty:
          throw new Error(`Unhandled binding of kind ${ir.BindingKind[op.bindingKind]}`);
      }
    }
  }
}
