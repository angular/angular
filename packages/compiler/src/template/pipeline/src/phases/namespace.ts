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
 * Change namespaces between HTML, SVG and MathML, depending on the next element.
 */
export function emitNamespaceChanges(job: CompilationJob): void {
  for (const unit of job.units) {
    let activeNamespace = ir.Namespace.HTML;

    for (const op of unit.create) {
      if (op.kind !== ir.OpKind.ElementStart) {
        continue;
      }
      if (op.namespace !== activeNamespace) {
        ir.OpList.insertBefore<ir.CreateOp>(ir.createNamespaceOp(op.namespace), op);
        activeNamespace = op.namespace;
      }
    }
  }
}
