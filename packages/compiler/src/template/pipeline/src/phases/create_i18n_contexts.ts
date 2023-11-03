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
 * Create i18n context ops that will be used to generate the final i18n messages.
 */
export function createI18nContexts(job: CompilationJob) {
  let currentI18nOp: ir.I18nStartOp|null = null;
  let xref: ir.XrefId;
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
          // Each i18n block gets its own context.
          xref = job.allocateXrefId();
          unit.create.push(ir.createI18nContextOp(xref, op.xref, op.message, null!));
          op.context = xref;
          currentI18nOp = op;
          break;
        case ir.OpKind.I18nEnd:
          currentI18nOp = null;
          break;
        case ir.OpKind.Icu:
          // If an ICU represents a different message than its containing block, we give it its own
          // i18n context.
          if (currentI18nOp === null) {
            throw Error('Unexpected ICU outside of an i18n block.');
          }
          if (op.message.id !== currentI18nOp.message.id) {
            xref = job.allocateXrefId();
            unit.create.push(ir.createI18nContextOp(xref, currentI18nOp.xref, op.message, null!));
            op.context = xref;
          } else {
            op.context = currentI18nOp.context;
          }
          break;
      }
    }
  }
}
