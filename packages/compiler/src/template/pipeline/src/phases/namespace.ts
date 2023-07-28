/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {ComponentCompilationJob} from '../compilation';

/**
 * Change namespaces between HTML, SVG and MathML, depending on the next element.
 */
export function phaseNamespace(job: ComponentCompilationJob): void {
  for (const [_, view] of job.views) {
    let activeNamespace = ir.Namespace.HTML;

    for (const op of view.create) {
      if (op.kind !== ir.OpKind.Element && op.kind !== ir.OpKind.ElementStart) {
        continue;
      }
      if (op.namespace !== activeNamespace) {
        ir.OpList.insertBefore<ir.CreateOp>(ir.createNamespaceOp(op.namespace), op);
        activeNamespace = op.namespace;
      }
    }
  }
}
