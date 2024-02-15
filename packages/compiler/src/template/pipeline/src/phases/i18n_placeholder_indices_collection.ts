/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {ComponentCompilationJob} from '../compilation';

export function collectI18nPlaceholderIndices(job: ComponentCompilationJob): void {
  // Step One: Collect all of the i18n contexts
  const i18nBlocks = new Map<ir.XrefId, ir.I18nOpBase>();
  const i18nContexts = new Map<ir.XrefId, ir.I18nContextOp>();

  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18n:
        case ir.OpKind.I18nStart:
          i18nBlocks.set(op.xref, op);
          break;

        case ir.OpKind.I18nContext:
          if (op.i18nBlock != null) {
            i18nContexts.set(op.xref, op);
          }
          break;
      }
    }
  }

  // Step Two: Propagate each context to the block.
  for (const context of i18nContexts.values()) {
    const block = i18nBlocks.get(context.i18nBlock!)!;
    const placeholderIndices = new Set<number>();

    for (const entry of context.params.values()) {
      for (const param of entry) {
        const value = param.value;
        if (typeof value === 'number') {
          placeholderIndices.add(value);
        } else if (value instanceof Object) {
          placeholderIndices.add(value.element);
        }
      }
    }

    block.placeholderIndices = Array.from(placeholderIndices);
  }
}
