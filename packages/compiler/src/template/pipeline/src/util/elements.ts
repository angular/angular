/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import type {CompilationUnit} from '../compilation';

/**
 * Gets a map of all elements in the given view by their xref id.
 */
export function createOpXrefMap(
  unit: CompilationUnit,
): Map<ir.XrefId, ir.ConsumesSlotOpTrait & ir.CreateOp> {
  const map = new Map<ir.XrefId, ir.ConsumesSlotOpTrait & ir.CreateOp>();
  for (const op of unit.create) {
    if (!ir.hasConsumesSlotTrait(op)) {
      continue;
    }
    map.set(op.xref, op);

    // TODO(dylhunn): `@for` loops with `@empty` blocks need to be special-cased here,
    // because the slot consumer trait currently only supports one slot per consumer and we
    // need two. This should be revisited when making the refactors mentioned in:
    // https://github.com/angular/angular/pull/53620#discussion_r1430918822
    if (op.kind === ir.OpKind.RepeaterCreate && op.emptyView !== null) {
      map.set(op.emptyView, op);
    }
  }
  return map;
}
