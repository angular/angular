/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {CompilationJob, CompilationUnit} from '../compilation';

/**
 * Phase that moves specialized `Property` operations to the creation
 * block if the compilation job targets is signal based. Also removes
 * all superfluous binding signal placeholders.
 *
 * This phase exists as we want to avoid having to the repeat binding specialization
 * logic for property bindings, but rather re-use the already-specialized information.
 */
export function phaseSignalBindings(cpl: CompilationJob): void {
  for (const unit of cpl.units) {
    processUnit(unit);
  }
}

function processUnit(unit: CompilationUnit) {
  const placeholders = new Map<ir.XrefId, ir.BindingSignalPlaceholder>();
  for (const op of unit.create) {
    if (op.kind === ir.OpKind.BindingSignalPlaceholder) {
      placeholders.set(op.bindingXref, op);
    }
  }

  // For signal jobs, we move:
  //  - property operations into the create block.
  if (unit.job.isSignal) {
    for (const op of unit.update) {
      if (op.kind === ir.OpKind.Property) {
        const placeholderOp = placeholders.get(op.bindingXref);
        if (placeholderOp === undefined) {
          throw new Error(
              'Expected binding placeholder operation to exist for property operation.');
        }

        // Signal property bindings, do not maintain a separate instruction for property
        // interpolations as the expression is wrapped is `computed` anyway. Instead, we
        // generate an interpolation template literal expression.
        const expression = op.expression instanceof ir.Interpolation ?
            new ir.InterpolationTemplateExpr(op.expression.strings, op.expression.expressions) :
            op.expression;
        const createOp = ir.createPropertyCreateOp(
            op.bindingXref, op.target, op.name, expression, op.isAnimationTrigger,
            op.securityContext, op.isTemplate, op.sourceSpan);

        // Replace the placeholder with the new instruction.
        ir.OpList.replace<ir.CreateOp>(placeholderOp, createOp);
        placeholders.delete(op.bindingXref);

        // Remove the property update operation, as we have the create operation now.
        ir.OpList.remove<ir.UpdateOp>(op);
      }
    }
  }

  // Remove all remaining placeholders. Not all binding operations
  // end up in the create block, even for signal jobs. For non-signal
  // jobs we remove all placeholder operations.
  for (const op of placeholders.values()) {
    ir.OpList.remove<ir.CreateOp>(op);
  }
}
