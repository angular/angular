/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import type {ComponentCompilationJob} from '../compilation';
import {literalOrArrayLiteral} from '../conversion';

/**
 * Defer instructions take a configuration array, which should be collected into the component
 * consts. This phase finds the config options, and creates the corresponding const array.
 */
export function configureDeferInstructions(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind !== ir.OpKind.Defer) {
        continue;
      }

      if (op.placeholderMinimumTime !== null) {
        op.placeholderConfig = new ir.ConstCollectedExpr(
          literalOrArrayLiteral([op.placeholderMinimumTime]),
        );
      }
      if (op.loadingMinimumTime !== null || op.loadingAfterTime !== null) {
        op.loadingConfig = new ir.ConstCollectedExpr(
          literalOrArrayLiteral([op.loadingMinimumTime, op.loadingAfterTime]),
        );
      }
    }
  }
}
