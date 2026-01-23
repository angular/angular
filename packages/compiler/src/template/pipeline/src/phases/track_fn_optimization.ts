/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import {Identifiers} from '../../../../render3/r3_identifiers';
import * as ir from '../../ir';

import type {CompilationJob} from '../compilation';

/**
 * `track` functions in `for` repeaters can sometimes be "optimized," i.e. transformed into inline
 * expressions, in lieu of an external function call. For example, tracking by `$index` can be be
 * optimized into an inline `trackByIndex` reference. This phase checks track expressions for
 * optimizable cases.
 */
export function optimizeTrackFns(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind !== ir.OpKind.RepeaterCreate) {
        continue;
      }
      if (op.track instanceof o.ReadVarExpr && op.track.name === '$index') {
        // Top-level access of `$index` uses the built in `repeaterTrackByIndex`.
        op.trackByFn = o.importExpr(Identifiers.repeaterTrackByIndex);
      } else if (op.track instanceof o.ReadVarExpr && op.track.name === '$item') {
        // Top-level access of the item uses the built in `repeaterTrackByIdentity`.
        op.trackByFn = o.importExpr(Identifiers.repeaterTrackByIdentity);
      } else if (isTrackByFunctionCall(job.root.xref, op.track)) {
        // Mark the function as using the component instance to play it safe
        // since the method might be using `this` internally (see #53628).
        op.usesComponentInstance = true;

        // Top-level method calls in the form of `fn($index, item)` can be passed in directly.
        if (op.track.receiver.receiver.view === unit.xref) {
          // TODO: this may be wrong
          op.trackByFn = op.track.receiver;
        } else {
          // This is a plain method call, but not in the component's root view.
          // We need to get the component instance, and then call the method on it.
          op.trackByFn = o
            .importExpr(Identifiers.componentInstance)
            .callFn([])
            .prop(op.track.receiver.name);
          // Because the context is not avaiable (without a special function), we don't want to
          // try to resolve it later. Let's get rid of it by overwriting the original track
          // expression (which won't be used anyway).
          op.track = op.trackByFn;
        }
      } else {
        // The track function could not be optimized.
        // Replace context reads with a special IR expression, since context reads in a track
        // function are emitted specially.
        op.track = ir.transformExpressionsInExpression(
          op.track,
          (expr) => {
            if (expr instanceof ir.PipeBindingExpr || expr instanceof ir.PipeBindingVariadicExpr) {
              throw new Error(`Illegal State: Pipes are not allowed in this context`);
            } else if (expr instanceof ir.ContextExpr) {
              op.usesComponentInstance = true;
              return new ir.TrackContextExpr(expr.view);
            }
            return expr;
          },
          ir.VisitorContextFlag.None,
        );

        // Also create an OpList for the tracking expression since it may need
        // additional ops when generating the final code (e.g. temporary variables).
        const trackOpList = new ir.OpList<ir.UpdateOp>();
        trackOpList.push(
          ir.createStatementOp(new o.ReturnStatement(op.track, op.track.sourceSpan)),
        );
        op.trackByOps = trackOpList;
      }
    }
  }
}

function isTrackByFunctionCall(
  rootView: ir.XrefId,
  expr: o.Expression,
): expr is o.InvokeFunctionExpr & {
  receiver: o.ReadPropExpr & {
    receiver: ir.ContextExpr;
  };
} {
  if (!(expr instanceof o.InvokeFunctionExpr) || expr.args.length === 0 || expr.args.length > 2) {
    return false;
  }

  if (
    !(
      expr.receiver instanceof o.ReadPropExpr && expr.receiver.receiver instanceof ir.ContextExpr
    ) ||
    expr.receiver.receiver.view !== rootView
  ) {
    return false;
  }

  const [arg0, arg1] = expr.args;
  if (!(arg0 instanceof o.ReadVarExpr) || arg0.name !== '$index') {
    return false;
  } else if (expr.args.length === 1) {
    return true;
  }
  if (!(arg1 instanceof o.ReadVarExpr) || arg1.name !== '$item') {
    return false;
  }
  return true;
}
