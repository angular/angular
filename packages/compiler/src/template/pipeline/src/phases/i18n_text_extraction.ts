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
 * Removes text nodes within i18n blocks since they are already hardcoded into the i18n message.
 */
export function phaseI18nTextExtraction(job: CompilationJob): void {
  for (const unit of job.units) {
    let inI18nBlock = false;
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
          inI18nBlock = true;
          break;
        case ir.OpKind.I18nEnd:
          inI18nBlock = false;
          break;
        case ir.OpKind.Text:
          if (inI18nBlock) {
            ir.OpList.remove<ir.CreateOp>(op);
          }
          break;
      }
    }
  }
}
