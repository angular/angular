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
export function phaseResolveI18nExpressionPlaceholders(job: ComponentCompilationJob) {
  // Record all of the i18n and extracted message ops for use later.
  const i18nOps = new Map<ir.XrefId, ir.I18nStartOp>();
  const extractedMessageOps = new Map<ir.XrefId, ir.ExtractedMessageOp>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
          i18nOps.set(op.xref, op);
          break;
        case ir.OpKind.ExtractedMessage:
          extractedMessageOps.set(op.owner, op);
          break;
      }
    }
  }

  // Keep track of the next available expression index per i18n block.
  const expressionIndices = new Map<ir.XrefId, number>();

  for (const unit of job.units) {
    for (const op of unit.update) {
      if (op.kind === ir.OpKind.I18nExpression) {
        const i18nOp = i18nOps.get(op.owner);
        let index = expressionIndices.get(op.owner) || 0;
        if (!i18nOp) {
          throw Error('Cannot find corresponding i18n block for i18nExpr');
        }
        const extractedMessageOp = extractedMessageOps.get(i18nOp.xref);
        if (!extractedMessageOp) {
          throw Error('Cannot find extracted message for i18n block');
        }

        // Add the expression index in the appropriate params map.
        const params = op.resolutionTime === ir.I18nParamResolutionTime.Creation ?
            extractedMessageOp.params :
            extractedMessageOp.postprocessingParams;
        const values = params.get(op.i18nPlaceholder) || [];
        values.push({
          value: index,
          subTemplateIndex: i18nOp.subTemplateIndex,
          flags: ir.I18nParamValueFlags.None
        });
        params.set(op.i18nPlaceholder, values);

        expressionIndices.set(op.owner, index + 1);
      }
    }
  }
}
