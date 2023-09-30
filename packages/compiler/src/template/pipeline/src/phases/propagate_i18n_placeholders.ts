/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

export function phasePropagateI18nPlaceholders(job: CompilationJob) {
  // Get all of the i18n ops.
  const i18nOps = new Map<ir.XrefId, ir.I18nStartOp>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.I18nStart) {
        i18nOps.set(op.xref, op);
      }
    }
  }

  // Propagate i18n params from sub-templates up to the root i18n op.
  for (const op of i18nOps.values()) {
    if (op.xref !== op.root) {
      const rootOp = i18nOps.get(op.root)!;
      for (const [placeholder, value] of op.params) {
        rootOp.params.set(placeholder, value);
      }
    }
  }

  // Validate the root i18n ops have all placeholders filled in.
  for (const op of i18nOps.values()) {
    if (op.xref === op.root) {
      for (const placeholder in op.message.placeholders) {
        if (!op.params.has(placeholder)) {
          throw Error(`Failed to resolve i18n placeholder: ${placeholder}`);
        }
      }
    }
  }
}
