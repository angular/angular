/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {ComponentCompilationJob} from '../compilation';

/** Extracts i18n messages into their own op. */
export function phaseI18nMessageExtraction(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.I18nStart) {
        unit.create.push(ir.createExtractedMessageOp(op.xref, op.message, op.xref === op.root));
      }
    }
  }
}
