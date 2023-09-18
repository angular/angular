/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {type CompilationJob, ComponentCompilationJob} from '../compilation';

/**
 * Lifts i18n properties into the consts array.
 */
export function phaseI18nConstCollection(job: ComponentCompilationJob): void {
  // Serialize the extracted messages into the const array.
  // TODO: Use `Map` instead of object.
  const messageConstIndices: {[id: ir.XrefId]: ir.ConstIndex} = {};
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.ExtractedMessage) {
        messageConstIndices[op.owner] = job.addConst(op.expression, op.statements);
        ir.OpList.remove<ir.CreateOp>(op);
      }
    }
  }

  // Assign const index to i18n ops that messages were extracted from.
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.I18nStart && messageConstIndices[op.xref] !== undefined) {
        op.messageIndex = messageConstIndices[op.xref];
      }
    }
  }
}
