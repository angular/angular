/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';

import type {CompilationJob} from '../compilation';

/**
 * Generate track functions that need to be extracted to the constant pool. This entails wrapping
 * them in an arrow (or traditional) function, replacing context reads with `this.`, and storing
 * them in the constant pool.
 *
 * Note that, if a track function was previously optimized, it will not need to be extracted, and
 * this phase is a no-op.
 */
export function generateTrackFns(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind !== ir.OpKind.RepeaterCreate) {
        continue;
      }
      if (op.trackByFn !== null) {
        // The final track function was already set, probably because it was optimized.
        continue;
      }

      // Find all component context reads.
      let usesComponentContext = false;
      op.track = ir.transformExpressionsInExpression(op.track, expr => {
        if (expr instanceof ir.PipeBindingExpr || expr instanceof ir.PipeBindingVariadicExpr) {
          throw new Error(`Illegal State: Pipes are not allowed in this context`);
        }
        if (expr instanceof ir.TrackContextExpr) {
          usesComponentContext = true;
          return o.variable('this');
        }
        return expr;
      }, ir.VisitorContextFlag.None);

      let fn: o.FunctionExpr|o.ArrowFunctionExpr;

      const fnParams = [new o.FnParam('$index'), new o.FnParam('$item')];
      if (usesComponentContext) {
        fn = new o.FunctionExpr(fnParams, [new o.ReturnStatement(op.track)]);
      } else {
        fn = o.arrowFn(fnParams, op.track);
      }

      op.trackByFn = job.pool.getSharedFunctionReference(fn, '_forTrack');
    }
  }
}
