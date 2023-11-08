/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {ComponentCompilationJob} from '../compilation';

/**
 * Resolve the i18n expression placeholders in i18n messages.
 */
export function resolveI18nExpressionPlaceholders(job: ComponentCompilationJob) {
  // Record all of the i18n context ops, and the sub-template index for each i18n op.
  const subTemplateIndicies = new Map<ir.XrefId, number|null>();
  const i18nContexts = new Map<ir.XrefId, ir.I18nContextOp>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
          subTemplateIndicies.set(op.xref, op.subTemplateIndex);
          break;
        case ir.OpKind.I18nContext:
          i18nContexts.set(op.xref, op);
          break;
      }
    }
  }

  // Keep track of the next available expression index per i18n block.
  const expressionIndices = new Map<ir.XrefId, number>();

  for (const unit of job.units) {
    for (const op of unit.update) {
      if (op.kind === ir.OpKind.I18nExpression) {
        const i18nContext = i18nContexts.get(op.context)!;
        const index = expressionIndices.get(i18nContext.i18nBlock) || 0;
        const subTemplateIndex = subTemplateIndicies.get(i18nContext.i18nBlock)!;
        // Add the expression index in the appropriate params map.
        const params = op.resolutionTime === ir.I18nParamResolutionTime.Creation ?
            i18nContext.params :
            i18nContext.postprocessingParams;
        const values = params.get(op.i18nPlaceholder) || [];
        values.push({
          value: index,
          subTemplateIndex: subTemplateIndex,
          flags: ir.I18nParamValueFlags.ExpressionIndex
        });
        params.set(op.i18nPlaceholder, values);

        expressionIndices.set(i18nContext.i18nBlock, index + 1);
      }
    }
  }
}
