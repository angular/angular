/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

export function createI18nContexts(job: CompilationJob) {
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.I18nStart) {
        const xref = job.allocateXrefId();
        unit.create.push(ir.createI18nContextOp(xref, op.xref, op.message, null!));
        op.context = xref;
      }
    }
  }
}
