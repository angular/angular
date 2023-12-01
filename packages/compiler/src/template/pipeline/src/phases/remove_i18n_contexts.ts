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
 * Remove the i18n context ops after they are no longer needed, and null out references to them to
 * be safe.
 */
export function removeI18nContexts(job: CompilationJob) {
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (true) {
        case op instanceof ir.I18nContextOp:
          ir.OpList.remove<ir.CreateOp>(op);
          break;
        case op instanceof ir.I18nStartOp:
          op.context = null;
          break;
      }
    }
  }
}
