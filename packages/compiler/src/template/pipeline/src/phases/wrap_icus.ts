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
 * Wraps ICUs that do not already belong to an i18n block in a new i18n block.
 */
export function wrapI18nIcus(job: CompilationJob): void {
  for (const unit of job.units) {
    let currentI18nOp: ir.I18nStartOp|null = null;
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
          currentI18nOp = op;
          break;
        case ir.OpKind.I18nEnd:
          currentI18nOp = null;
          break;
        case ir.OpKind.Icu:
          if (currentI18nOp === null) {
            const id = job.allocateXrefId();
            ir.OpList.insertBefore<ir.CreateOp>(ir.createI18nStartOp(id, op.message), op);
            ir.OpList.insertAfter<ir.CreateOp>(ir.createI18nEndOp(id), op);
          }
          break;
      }
    }
  }
}
