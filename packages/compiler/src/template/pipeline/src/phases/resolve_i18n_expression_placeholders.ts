/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import {ComponentCompilationJob} from '../compilation';

/**
 * Resolve the i18n expression placeholders in i18n messages.
 */
export function resolveI18nExpressionPlaceholders(job: ComponentCompilationJob) {
  // Record all of the i18n context ops, and the sub-template index for each i18n op.
  const subTemplateIndices = new Map<ir.XrefId, number | null>();
  const i18nContexts = new Map<ir.XrefId, ir.I18nContextOp>();
  const icuPlaceholders = new Map<ir.XrefId, ir.IcuPlaceholderOp>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
          subTemplateIndices.set(op.xref, op.subTemplateIndex);
          break;
        case ir.OpKind.I18nContext:
          i18nContexts.set(op.xref, op);
          break;
        case ir.OpKind.IcuPlaceholder:
          icuPlaceholders.set(op.xref, op);
          break;
      }
    }
  }

  // Keep track of the next available expression index for each i18n message.
  const expressionIndices = new Map<ir.XrefId, number>();

  // Keep track of a reference index for each expression.
  // We use different references for normal i18n expressio and attribute i18n expressions. This is
  // because child i18n blocks in templates don't get their own context, since they're rolled into
  // the translated message of the parent, but they may target a different slot.
  const referenceIndex = (op: ir.I18nExpressionOp): ir.XrefId =>
    op.usage === ir.I18nExpressionFor.I18nText ? op.i18nOwner : op.context;

  for (const unit of job.units) {
    for (const op of unit.update) {
      if (op.kind === ir.OpKind.I18nExpression) {
        const index = expressionIndices.get(referenceIndex(op)) || 0;
        const subTemplateIndex = subTemplateIndices.get(op.i18nOwner) ?? null;
        const value: ir.I18nParamValue = {
          value: index,
          subTemplateIndex: subTemplateIndex,
          flags: ir.I18nParamValueFlags.ExpressionIndex,
        };
        updatePlaceholder(op, value, i18nContexts, icuPlaceholders);
        expressionIndices.set(referenceIndex(op), index + 1);
      }
    }
  }
}

function updatePlaceholder(
  op: ir.I18nExpressionOp,
  value: ir.I18nParamValue,
  i18nContexts: Map<ir.XrefId, ir.I18nContextOp>,
  icuPlaceholders: Map<ir.XrefId, ir.IcuPlaceholderOp>,
) {
  if (op.i18nPlaceholder !== null) {
    const i18nContext = i18nContexts.get(op.context)!;
    const params =
      op.resolutionTime === ir.I18nParamResolutionTime.Creation
        ? i18nContext.params
        : i18nContext.postprocessingParams;
    const values = params.get(op.i18nPlaceholder) || [];
    values.push(value);
    params.set(op.i18nPlaceholder, values);
  }
  if (op.icuPlaceholder !== null) {
    const icuPlaceholderOp = icuPlaceholders.get(op.icuPlaceholder);
    icuPlaceholderOp?.expressionPlaceholders.push(value);
  }
}
