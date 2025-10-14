/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ir from '../../ir';
/**
 * Resolve the dependency function of a deferred block.
 */
export function resolveDeferDepsFns(job) {
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.Defer) {
        if (op.resolverFn !== null) {
          continue;
        }
        if (op.ownResolverFn !== null) {
          if (op.handle.slot === null) {
            throw new Error(
              'AssertionError: slot must be assigned before extracting defer deps functions',
            );
          }
          const fullPathName = unit.fnName?.replace('_Template', '');
          op.resolverFn = job.pool.getSharedFunctionReference(
            op.ownResolverFn,
            `${fullPathName}_Defer_${op.handle.slot}_DepsFn`,
            /* Don't use unique names for TDB compatibility */ false,
          );
        }
      }
    }
  }
}
//# sourceMappingURL=resolve_defer_deps_fns.js.map
