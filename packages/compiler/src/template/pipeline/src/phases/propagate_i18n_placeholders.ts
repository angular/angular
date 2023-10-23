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
 * Propagate extractd message placeholders up to their root extracted message op.
 */
export function phasePropagateI18nPlaceholders(job: ComponentCompilationJob) {
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

  // For each non-root message, merge its params into the root message's params.
  for (const [xref, childExtractedMessageOp] of extractedMessageOps) {
    if (!childExtractedMessageOp.isRoot) {
      const i18nOp = i18nOps.get(xref);
      if (i18nOp === undefined) {
        throw Error('Could not find owner i18n block for extracted message.');
      }
      const rootExtractedMessageOp = extractedMessageOps.get(i18nOp.root);
      if (rootExtractedMessageOp === undefined) {
        throw Error('Could not find extracted message op for root i18n block.');
      }
      mergeParams(rootExtractedMessageOp.params, childExtractedMessageOp.params);
      mergeParams(
          rootExtractedMessageOp.postprocessingParams,
          childExtractedMessageOp.postprocessingParams);
    }
  }
}

/**
 * Merges the params in the `from` map to into the `to` map.
 */
function mergeParams(to: Map<string, ir.I18nParamValue[]>, from: Map<string, ir.I18nParamValue[]>) {
  for (const [placeholder, fromValues] of from) {
    const toValues = to.get(placeholder) || [];
    // TODO(mmalerba): Child element close tag params should be prepended to maintain the same order
    // as TemplateDefinitionBuilder. Can be cleaned up when compatibility is no longer required.
    const flags = fromValues[0]!.flags;
    if ((flags & ir.I18nParamValueFlags.CloseTag) && !(flags & ir.I18nParamValueFlags.OpenTag)) {
      to.set(placeholder, [...fromValues, ...toValues]);
    } else {
      to.set(placeholder, [...toValues, ...fromValues]);
    }
  }
}
