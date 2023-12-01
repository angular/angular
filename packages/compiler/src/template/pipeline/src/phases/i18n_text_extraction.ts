/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

/**
 * Removes text nodes within i18n blocks since they are already hardcoded into the i18n message.
 */
export function extractI18nText(job: CompilationJob): void {
  for (const unit of job.units) {
    // Remove all text nodes within i18n blocks, their content is already captured in the i18n
    // message.
    let currentI18n: ir.I18nStartOp|null = null;
    let currentIcu: ir.IcuStartOp|null = null;
    const textNodeI18nBlocks = new Map<ir.XrefId, ir.I18nStartOp>();
    const textNodeIcus = new Map<ir.XrefId, ir.IcuStartOp|null>();
    for (const op of unit.create) {
      switch (true) {
        case op instanceof ir.I18nStartOp:
          if (op.context === null) {
            throw Error('I18n op should have its context set.');
          }
          currentI18n = op;
          break;
        case op instanceof ir.I18nEndOp:
          currentI18n = null;
          break;
        case op instanceof ir.IcuStartOp:
          if (op.context === null) {
            throw Error('Icu op should have its context set.');
          }
          currentIcu = op;
          break;
        case op instanceof ir.IcuEndOp:
          currentIcu = null;
          break;
        case op instanceof ir.TextOp:
          if (currentI18n !== null) {
            textNodeI18nBlocks.set(op.xref, currentI18n);
            textNodeIcus.set(op.xref, currentIcu);
            ir.OpList.remove<ir.CreateOp>(op);
          }
          break;
      }
    }

    // Update any interpolations to the removed text, and instead represent them as a series of i18n
    // expressions that we then apply.
    for (const op of unit.update) {
      switch (true) {
        case op instanceof ir.InterpolateTextOp:
          if (!textNodeI18nBlocks.has(op.target)) {
            continue;
          }

          const i18nOp = textNodeI18nBlocks.get(op.target)!;
          const icuOp = textNodeIcus.get(op.target);
          const contextId = icuOp ? icuOp.context : i18nOp.context;
          const resolutionTime = icuOp ? ir.I18nParamResolutionTime.Postproccessing :
                                         ir.I18nParamResolutionTime.Creation;
          const ops: ir.UpdateOp[] = [];
          for (let i = 0; i < op.interpolation.expressions.length; i++) {
            const expr = op.interpolation.expressions[i];
            // For now, this i18nExpression depends on the slot context of the enclosing i18n block.
            // Later, we will modify this, and advance to a different point.
            ops.push(new ir.I18nExpressionOp(
                contextId!, i18nOp.xref, i18nOp.handle, expr, op.i18nPlaceholders[i],
                resolutionTime, expr.sourceSpan ?? op.sourceSpan));
          }
          ir.OpList.replaceWithMany(op as ir.UpdateOp, ops);
          break;
      }
    }
  }
}
