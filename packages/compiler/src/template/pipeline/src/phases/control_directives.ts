/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import type {ComponentCompilationJob, ViewCompilationUnit} from '../compilation';

const ELIGIBLE_CONTROL_PROPERTIES = new Set(['formField']);

export function specializeControlProperties(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    processView(unit);
  }
}

function processView(view: ViewCompilationUnit): void {
  for (const op of view.update) {
    if (op.kind !== ir.OpKind.Property) {
      continue;
    }

    if (ELIGIBLE_CONTROL_PROPERTIES.has(op.name)) {
      addControlInstruction(view, op);
    }
  }
}

function addControlInstruction(view: ViewCompilationUnit, propertyOp: ir.PropertyOp): void {
  // First, add a `ControlCreate` instruction following the element definition for this property.
  for (const createOp of view.create) {
    if (createOp.kind !== ir.OpKind.Element && createOp.kind !== ir.OpKind.ElementStart) {
      continue;
    }

    if (createOp.xref !== propertyOp.target) {
      continue;
    }

    const controlCreateOp = ir.createControlCreateOp(propertyOp.sourceSpan);
    ir.OpList.insertAfter<ir.CreateOp>(controlCreateOp, createOp);
    ir.OpList.insertAfter<ir.UpdateOp>(
      ir.createControlOp(propertyOp.target, propertyOp.sourceSpan),
      propertyOp,
    );
    return;
  }
}
