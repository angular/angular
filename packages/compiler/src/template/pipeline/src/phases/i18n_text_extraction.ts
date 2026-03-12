/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

/**
 * Removes text nodes within i18n blocks since they are already hardcoded into the i18n message.
 * Also, replaces interpolations on these text nodes with i18n expressions of the non-text portions,
 * which will be applied later.
 */
export function convertI18nText(job: CompilationJob): void {
  for (const unit of job.units) {
    // Remove all text nodes within i18n blocks, their content is already captured in the i18n
    // message.
    let currentI18n: ir.I18nStartOp | null = null;
    let currentIcu: ir.IcuStartOp | null = null;
    const textNodeI18nBlocks = new Map<ir.XrefId, ir.I18nStartOp>();
    const textNodeIcus = new Map<ir.XrefId, ir.IcuStartOp | null>();
    const icuPlaceholderByText = new Map<ir.XrefId, ir.IcuPlaceholderOp>();
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
        case ir.OpKind.IcuStart:
          if (op.context === null) {
            throw Error('Icu op should have its context set.');
          }
          currentIcu = op;
          break;
        case ir.OpKind.IcuEnd:
          currentIcu = null;
          break;
        case ir.OpKind.Text:
          if (currentI18n !== null) {
            textNodeI18nBlocks.set(op.xref, currentI18n);
            textNodeIcus.set(op.xref, currentIcu);
            if (op.icuPlaceholder !== null) {
              // Create an op to represent the ICU placeholder. Initially set its static text to the
              // value of the text op, though this may be overwritten later if this text op is a
              // placeholder for an interpolation.
              const icuPlaceholderOp = ir.createIcuPlaceholderOp(
                job.allocateXrefId(),
                op.icuPlaceholder,
                [op.initialValue],
              );
              ir.OpList.replace<ir.CreateOp>(op, icuPlaceholderOp);
              icuPlaceholderByText.set(op.xref, icuPlaceholderOp);
            } else {
              // Otherwise just remove the text op, since its value is already accounted for in the
              // translated message.
              ir.OpList.remove<ir.CreateOp>(op);
            }
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
          const icuOp = textNodeIcus.get(op.target);
          const icuPlaceholder = icuPlaceholderByText.get(op.target);
          const contextId = icuOp ? icuOp.context : i18nOp.context;
          const resolutionTime = icuOp
            ? ir.I18nParamResolutionTime.Postproccessing
            : ir.I18nParamResolutionTime.Creation;
          const ops: ir.I18nExpressionOp[] = [];
          for (let i = 0; i < op.interpolation.expressions.length; i++) {
            const expr = op.interpolation.expressions[i];
            // For now, this i18nExpression depends on the slot context of the enclosing i18n block.
            // Later, we will modify this, and advance to a different point.
            ops.push(
              ir.createI18nExpressionOp(
                contextId!,
                i18nOp.xref,
                i18nOp.xref,
                i18nOp.handle,
                expr,
                icuPlaceholder?.xref ?? null,
                op.interpolation.i18nPlaceholders[i] ?? null,
                resolutionTime,
                ir.I18nExpressionFor.I18nText,
                '',
                expr.sourceSpan ?? op.sourceSpan,
              ),
            );
          }
          ir.OpList.replaceWithMany(op as ir.UpdateOp, ops);
          // If this interpolation is part of an ICU placeholder, add the strings and expressions to
          // the placeholder.
          if (icuPlaceholder !== undefined) {
            icuPlaceholder.strings = op.interpolation.strings;
          }
          break;
      }
    }
  }
}
