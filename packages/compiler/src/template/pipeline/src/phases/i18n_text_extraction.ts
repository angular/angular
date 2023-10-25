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
export function phaseI18nTextExtraction(job: CompilationJob): void {
  for (const unit of job.units) {
    // Remove all text nodes within i18n blocks, their content is already captured in the i18n
    // message.
    let currentI18nId: ir.XrefId|null = null;
    let currentI18nSlot: ir.SlotHandle|null = null;
    const textNodes = new Map<ir.XrefId, {xref: ir.XrefId, slot: ir.SlotHandle}>();
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
          currentI18nId = op.xref;
          currentI18nSlot = op.slot;
          break;
        case ir.OpKind.I18nEnd:
          currentI18nId = null;
          currentI18nSlot = null;
          break;
        case ir.OpKind.Text:
          if (currentI18nId !== null && currentI18nSlot !== null) {
            textNodes.set(op.xref, {xref: currentI18nId, slot: currentI18nSlot});
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
          if (!textNodes.has(op.target)) {
            continue;
          }

          const i18nBlock = textNodes.get(op.target)!;
          const ops: ir.UpdateOp[] = [];
          for (let i = 0; i < op.interpolation.expressions.length; i++) {
            const expr = op.interpolation.expressions[i];
            const placeholder = op.i18nPlaceholders[i];
            ops.push(ir.createI18nExpressionOp(
                i18nBlock.xref, i18nBlock.slot, expr, placeholder.name,
                ir.I18nParamResolutionTime.Creation, expr.sourceSpan ?? op.sourceSpan));
          }
          if (ops.length > 0) {
            // ops.push(ir.createI18nApplyOp(i18nBlockId, op.i18nPlaceholders, op.sourceSpan));
          }
          ir.OpList.replaceWithMany(op as ir.UpdateOp, ops);
          break;
      }
    }
  }
}
