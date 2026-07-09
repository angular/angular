/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import type {ComponentCompilationJob} from '../compilation';

/**
 * For each view that contains at least one `@defer` block with hydrate triggers,
 * insert a single `EnableIncrementalHydrationRuntime` op before the first such
 * `Defer` op. This results in a top-level `ɵɵenableIncrementalHydrationRuntime()`
 * instruction call being emitted once per "create" block, activating the
 * incremental hydration runtime regardless of how many hydrating defer blocks
 * are present in that view.
 */
export function insertIncrementalHydrationRuntime(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (
        op.kind === ir.OpKind.Defer &&
        op.flags !== null &&
        (op.flags & ir.TDeferDetailsFlags.HasHydrateTriggers) !== 0
      ) {
        ir.OpList.insertBefore<ir.CreateOp>(
          ir.createEnableIncrementalHydrationRuntimeOp(op.sourceSpan),
          op,
        );
        // Only the first hydrating defer in the view needs the activator.
        break;
      }
    }
  }
}
