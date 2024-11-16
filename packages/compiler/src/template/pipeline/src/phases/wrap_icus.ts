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
 * Wraps ICUs that do not already belong to an i18n block in a new i18n block.
 */
export function wrapI18nIcus(job: CompilationJob): void {
  for (const unit of job.units) {
    let currentI18nOp: ir.I18nStartOp | null = null;
    let addedI18nId: ir.XrefId | null = null;
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
          currentI18nOp = op;
          break;
        case ir.OpKind.I18nEnd:
          currentI18nOp = null;
          break;
        case ir.OpKind.IcuStart:
          if (currentI18nOp === null) {
            addedI18nId = job.allocateXrefId();
            // ICU i18n start/end ops should not receive source spans.
            ir.OpList.insertBefore<ir.CreateOp>(
              ir.createI18nStartOp(addedI18nId, op.message, undefined, null),
              op,
            );
          }
          break;
        case ir.OpKind.IcuEnd:
          if (addedI18nId !== null) {
            ir.OpList.insertAfter<ir.CreateOp>(ir.createI18nEndOp(addedI18nId, null), op);
            addedI18nId = null;
          }
          break;
      }
    }
  }
}
