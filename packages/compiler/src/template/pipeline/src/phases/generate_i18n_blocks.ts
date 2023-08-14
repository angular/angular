/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18n from '../../../../i18n/i18n_ast';
import * as ir from '../../ir';
import {CompilationJob} from '../compilation';
import {getElementsByXrefId} from '../util/elements';

/**
 * Generate i18n start and end isntructions to mark i18n blocks.
 */
export function phaseGenerateI18nBlocks(job: CompilationJob): void {
  for (const unit of job.units) {
    const elements = getElementsByXrefId(unit);
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.ElementEnd:
          const start = elements.get(op.xref)!;
          if (start.i18n instanceof i18n.Message) {
            const id = job.allocateXrefId();
            ir.OpList.insertAfter<ir.CreateOp>(ir.createI18nStartOp(id, start.i18n), start);
            ir.OpList.insertBefore<ir.CreateOp>(ir.createI18nEndOp(id), op);
          }
          break;
        case ir.OpKind.Template:
          if (op.i18n !== undefined) {
            const id = job.allocateXrefId();
            ir.OpList.insertBefore<ir.CreateOp>(ir.createI18nStartOp(id, op.i18n), op);
            ir.OpList.insertAfter<ir.CreateOp>(ir.createI18nEndOp(id), op);
          }
          break;
      }
    }
  }
}
