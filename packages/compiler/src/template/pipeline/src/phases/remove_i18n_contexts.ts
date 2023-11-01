/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

export function removeI18nContexts(job: CompilationJob) {
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nContext:
          ir.OpList.remove<ir.CreateOp>(op);
          break;
        case ir.OpKind.I18nStart:
          op.context = null;
          break;
      }
    }
  }
}
