/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import * as ir from '../../ir';
import {ComponentCompilationJob, ViewCompilationUnit} from '../compilation';

/**
 * Propagate i18n blocks down through child templates that act as placeholders in the parent i18n
 * message.
 */
export function phasePropagateI18nBlocks(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    propagateI18nBlocksToTemplates(unit);
  }
}

/**
 * Propagates i18n ops in the given view through to any child views recursively.
 */
function propagateI18nBlocksToTemplates(unit: ViewCompilationUnit) {
  let i18nBlock: ir.I18nStartOp|null = null;
  for (const op of unit.create) {
    switch (op.kind) {
      case ir.OpKind.I18nStart:
        i18nBlock = op;
        break;
      case ir.OpKind.I18nEnd:
        i18nBlock = null;
        break;
      case ir.OpKind.Template:
        if (op.i18nPlaceholder !== undefined) {
          if (i18nBlock === null) {
            throw Error('Expected template with i18n placeholder to be in an i18n block.');
          }
          const templateView = unit.job.views.get(op.xref);
          if (templateView === undefined) {
            throw Error('Expected template to have a view.')
          }
          wrapTemplateWithI18n(templateView, i18nBlock);
        }
        break;
    }
  }
}

/**
 * Wraps a template view with i18n start and end ops, then propagates i18n blocks for the view in
 * order to push it down to any descendant templates.
 */
function wrapTemplateWithI18n(unit: ViewCompilationUnit, parentI18n: ir.I18nStartOp) {
  // Only add i18n ops if they have not already been propagated to this template.
  if (unit.create.head.next?.kind !== ir.OpKind.I18nStart) {
    ir.OpList.insertAfter(
        ir.createI18nStartOp(parentI18n.xref, parentI18n.message), unit.create.head);
    ir.OpList.insertBefore(ir.createI18nEndOp(parentI18n.xref), unit.create.tail);
    // Check if the i18n ops need to be further propagated through the children.
    propagateI18nBlocksToTemplates(unit);
  }
}
