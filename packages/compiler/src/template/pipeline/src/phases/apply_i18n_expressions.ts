/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

/**
 * Adds apply operations after i18n expressions.
 */
export function applyI18nExpressions(job: CompilationJob): void {
  const i18nContexts = new Map<ir.XrefId, ir.I18nContextOp>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.I18nContext) {
        i18nContexts.set(op.xref, op);
      }
    }
  }

  for (const unit of job.units) {
    for (const op of unit.update) {
      // Only add apply after expressions that are not followed by more expressions.
      if (op.kind === ir.OpKind.I18nExpression && needsApplication(i18nContexts, op)) {
        // TODO: what should be the source span for the apply op?
        ir.OpList.insertAfter<ir.UpdateOp>(
          ir.createI18nApplyOp(op.i18nOwner, op.handle, null!),
          op,
        );
      }
    }
  }
}

/**
 * Checks whether the given expression op needs to be followed with an apply op.
 */
function needsApplication(i18nContexts: Map<ir.XrefId, ir.I18nContextOp>, op: ir.I18nExpressionOp) {
  // If the next op is not another expression, we need to apply.
  if (op.next?.kind !== ir.OpKind.I18nExpression) {
    return true;
  }

  const context = i18nContexts.get(op.context);
  const nextContext = i18nContexts.get(op.next.context);

  if (context === undefined) {
    throw new Error(
      "AssertionError: expected an I18nContextOp to exist for the I18nExpressionOp's context",
    );
  }

  if (nextContext === undefined) {
    throw new Error(
      "AssertionError: expected an I18nContextOp to exist for the next I18nExpressionOp's context",
    );
  }

  // If the next op is an expression targeting a different i18n block (or different element, in the
  // case of i18n attributes), we need to apply.

  // First, handle the case of i18n blocks.
  if (context.i18nBlock !== null) {
    // This is a block context. Compare the blocks.
    if (context.i18nBlock !== nextContext.i18nBlock) {
      return true;
    }
    return false;
  }

  // Second, handle the case of i18n attributes.
  if (op.i18nOwner !== op.next.i18nOwner) {
    return true;
  }
  return false;
}
