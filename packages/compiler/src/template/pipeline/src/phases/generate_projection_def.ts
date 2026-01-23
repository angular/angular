/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {parseSelectorToR3Selector} from '../../../../core';
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {ComponentCompilationJob} from '../compilation';
import {literalOrArrayLiteral} from '../conversion';

/**
 * Locate projection slots, populate the each component's `ngContentSelectors` literal field,
 * populate `project` arguments, and generate the required `projectionDef` instruction for the job's
 * root view.
 */
export function generateProjectionDefs(job: ComponentCompilationJob): void {
  // TODO: Why does TemplateDefinitionBuilder force a shared constant?
  const share = job.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder;

  // Collect all selectors from this component, and its nested views. Also, assign each projection a
  // unique ascending projection slot index.
  const selectors = [];
  let projectionSlotIndex = 0;
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.Projection) {
        selectors.push(op.selector);
        op.projectionSlotIndex = projectionSlotIndex++;
      }
    }
  }

  if (selectors.length > 0) {
    // Create the projectionDef array. If we only found a single wildcard selector, then we use the
    // default behavior with no arguments instead.
    let defExpr: o.Expression | null = null;
    if (selectors.length > 1 || selectors[0] !== '*') {
      const def = selectors.map((s) => (s === '*' ? s : parseSelectorToR3Selector(s)));
      defExpr = job.pool.getConstLiteral(literalOrArrayLiteral(def), share);
    }

    // Create the ngContentSelectors constant.
    job.contentSelectors = job.pool.getConstLiteral(literalOrArrayLiteral(selectors), share);

    // The projection def instruction goes at the beginning of the root view, before any
    // `projection` instructions.
    job.root.create.prepend([ir.createProjectionDefOp(defExpr)]);
  }
}
