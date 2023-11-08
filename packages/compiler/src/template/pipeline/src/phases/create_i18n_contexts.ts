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
 * Create one helper context op per i18n block (including generate descending blocks).
 *
 * Also, if an ICU exists inside an i18n block that also contains other localizable content (such as
 * string), create an additional helper context op for the ICU.
 *
 * These context ops are later used for generating i18n messages. (Although we generate at least one
 * context op per nested view, we will collect them up the tree later, to generate a top-level
 * message.)
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
        case ir.OpKind.IcuStart:
          // If an ICU represents a different message than its containing block, we give it its own
          // i18n context.
          if (currentI18nOp === null) {
            throw Error('Unexpected ICU outside of an i18n block.');
          }
          if (op.message.id !== currentI18nOp.message.id) {
            // There was an enclosing i18n block around this ICU somewhere.
            xref = job.allocateXrefId();
            unit.create.push(ir.createI18nContextOp(xref, currentI18nOp.xref, op.message, null!));
            op.context = xref;
          } else {
            // The i18n block was generated because of this ICU, OR it was explicit, but the ICU is
            // the only localizable content inside of it.
            op.context = currentI18nOp.context;
          }
          break;
      }
    }
  }
}
