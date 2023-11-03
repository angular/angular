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
    const textNodeI18nBlocks = new Map<ir.XrefId, ir.I18nStartOp>();
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
          if (op.context === null) {
            throw Error('I18n op should have its context set.');
          }
          currentI18n = op;
          break;
        case ir.OpKind.I18nEnd:
          currentI18n = null;
          break;
        case ir.OpKind.Text:
          if (currentI18n !== null) {
            textNodeI18nBlocks.set(op.xref, currentI18n);
            ir.OpList.remove<ir.CreateOp>(op);
          }
          break;
      }
    }

    // Update any interpolations to the removed text, and instead represent them as a series of i18n
    // expressions that we then apply.
    for (const op of unit.update) {
      switch (op.kind) {
        case ir.OpKind.InterpolateText:
          if (!textNodeI18nBlocks.has(op.target)) {
            continue;
          }

          const i18nOp = textNodeI18nBlocks.get(op.target)!;
          const ops: ir.UpdateOp[] = [];
          for (let i = 0; i < op.interpolation.expressions.length; i++) {
            const expr = op.interpolation.expressions[i];
            const placeholder = op.i18nPlaceholders[i];
            // For now, this i18nExpression depends on the slot context of the enclosing i18n block.
            // Later, we will modify this, and advance to a different point.
            ops.push(ir.createI18nExpressionOp(
                i18nOp.context!, i18nOp.xref, i18nOp.handle, expr, placeholder.name,
                ir.I18nParamResolutionTime.Creation, expr.sourceSpan ?? op.sourceSpan));
          }
          ir.OpList.replaceWithMany(op as ir.UpdateOp, ops);
          break;
      }
    }
  }
}
