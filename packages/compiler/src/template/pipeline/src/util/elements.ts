/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import type {CompilationUnit} from '../compilation';

/**
 * Gets a map of all elements in the given view by their xref id.
 */
export function createOpXrefMap(unit: CompilationUnit):
    Map<ir.XrefId, ir.ConsumesSlotOpTrait&ir.CreateOp> {
  const map = new Map<ir.XrefId, ir.ConsumesSlotOpTrait&ir.CreateOp>();
  for (const op of unit.create) {
    if (!ir.hasConsumesSlotTrait(op)) {
      continue;
    }
    map.set(op.xref, op);
  }
  return map;
}
