/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {ComponentCompilationJob} from '../compilation';

/**
 * Create extracted deps functions for defer ops.
 */
export function createDeferDepsFns(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.Defer) {
        if (op.metadata.deps.length === 0) {
          continue;
        }
        if (op.resolverFn !== null) {
          continue;
        }
        const dependencies: o.Expression[] = [];
        for (const dep of op.metadata.deps) {
          if (dep.isDeferrable) {
            // Callback function, e.g. `m () => m.MyCmp;`.
            const innerFn = o.arrowFn(
                // Default imports are always accessed through the `default` property.
                [new o.FnParam('m', o.DYNAMIC_TYPE)],
                o.variable('m').prop(dep.isDefaultImport ? 'default' : dep.symbolName));

            // Dynamic import, e.g. `import('./a').then(...)`.
            const importExpr =
                (new o.DynamicImportExpr(dep.importPath!)).prop('then').callFn([innerFn]);
            dependencies.push(importExpr);
          } else {
            // Non-deferrable symbol, just use a reference to the type.
            dependencies.push(dep.type);
          }
        }
        const depsFnExpr = o.arrowFn([], o.literalArr(dependencies));
        if (op.handle.slot === null) {
          throw new Error(
              'AssertionError: slot must be assigned bfore extracting defer deps functions');
        }
        const fullPathName = unit.fnName?.replace(`_Template`, ``);
        op.resolverFn = job.pool.getSharedFunctionReference(
            depsFnExpr, `${fullPathName}_Defer_${op.handle.slot}_DepsFn`,
            /* Don't use unique names for TDB compatibility */ false);
      }
    }
  }
}
