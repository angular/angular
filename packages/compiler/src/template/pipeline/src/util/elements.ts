/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {ViewCompilationUnit} from '../compilation';

/**
 * Gets a map of all elements in the given view by their xref id.
 */
export function getElementsByXrefId(view: ViewCompilationUnit) {
  const elements = new Map<ir.XrefId, ir.ElementOrContainerOps>();
  for (const op of view.create) {
    if (!ir.isElementOrContainerOp(op)) {
      continue;
    }
    elements.set(op.xref, op);
  }
  return elements;
}
