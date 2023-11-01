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
 * Merge i18n contexts for child i18n blocks into their parent context.
 */
export function mergeI18nContexts(job: ComponentCompilationJob) {
  // Record all of the i18n and extracted message ops for use later.
  const i18nOps = new Map<ir.XrefId, ir.I18nStartOp>();
  const i18nContexts = new Map<ir.XrefId, ir.I18nContextOp>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
          if (!op.context) {
            throw Error('I18n op should have its context set.');
          }
          i18nOps.set(op.xref, op);
          break;
        case ir.OpKind.I18nContext:
          i18nContexts.set(op.xref, op);
          break;
      }
    }
  }

  // For each non-root i18n op, merge its context into the root i18n op's context.
  for (const childI18nOp of i18nOps.values()) {
    if (childI18nOp.xref !== childI18nOp.root) {
      const childContext = i18nContexts.get(childI18nOp.context!)!;
      const rootI18nOp = i18nOps.get(childI18nOp.root)!;
      const rootContext = i18nContexts.get(rootI18nOp.context!)!;
      mergeParams(rootContext.params, childContext.params);
      mergeParams(rootContext.postprocessingParams, childContext.postprocessingParams);
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
