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
    let addedI18nId: ir.XrefId|null = null;
    for (const op of unit.create) {
      switch (true) {
        case op instanceof ir.I18nStartOp:
          currentI18nOp = op;
          break;
        case op instanceof ir.I18nEndOp:
          currentI18nOp = null;
          break;
        case op instanceof ir.IcuStartOp:
          if (currentI18nOp === null) {
            addedI18nId = job.allocateXrefId();
            ir.OpList.insertBefore<ir.CreateOp>(new ir.I18nStartOp(addedI18nId, op.message), op);
          }
          break;
        case op instanceof ir.IcuEndOp:
          if (addedI18nId !== null) {
            ir.OpList.insertAfter<ir.CreateOp>(new ir.I18nEndOp(addedI18nId), op);
            addedI18nId = null;
          }
          break;
      }
    }
  }
}
