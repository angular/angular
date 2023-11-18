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
 * Propagate i18n blocks down through child templates that act as placeholders in the root i18n
 * message. Specifically, perform an in-order traversal of all the views, and add i18nStart/i18nEnd
 * op pairs into descending views. Also, assign an increasing sub-template index to each
 * descending view.
 */
export function propagateI18nBlocks(job: ComponentCompilationJob): void {
  propagateI18nBlocksToTemplates(job.root, 0);
}

/**
 * Propagates i18n ops in the given view through to any child views recursively.
 */
function propagateI18nBlocksToTemplates(
    unit: ViewCompilationUnit, subTemplateIndex: number): number {
  let i18nBlock: ir.I18nStartOp|null = null;
  for (const op of unit.create) {
    switch (op.kind) {
      case ir.OpKind.I18nStart:
        op.subTemplateIndex = subTemplateIndex === 0 ? null : subTemplateIndex;
        i18nBlock = op;
        break;
      case ir.OpKind.I18nEnd:
        i18nBlock = null;
        break;
      case ir.OpKind.Template:
        const templateView = unit.job.views.get(op.xref)!;

        // We found an <ng-template> inside an i18n block; increment the sub-template counter and
        // wrap the template's view in a child i18n block.
        if (op.i18nPlaceholder !== undefined) {
          if (i18nBlock === null) {
            throw Error('Expected template with i18n placeholder to be in an i18n block.');
          }
          subTemplateIndex++;
          wrapTemplateWithI18n(templateView, i18nBlock);
        }

        // Continue traversing inside the template's view.
        subTemplateIndex = propagateI18nBlocksToTemplates(templateView, subTemplateIndex);
    }
  }
  return subTemplateIndex;
}

/**
 * Wraps a template view with i18n start and end ops.
 */
function wrapTemplateWithI18n(unit: ViewCompilationUnit, parentI18n: ir.I18nStartOp) {
  // Only add i18n ops if they have not already been propagated to this template.
  if (unit.create.head.next?.kind !== ir.OpKind.I18nStart) {
    const id = unit.job.allocateXrefId();
    ir.OpList.insertAfter(
        ir.createI18nStartOp(id, parentI18n.message, parentI18n.root), unit.create.head);
    ir.OpList.insertBefore(ir.createI18nEndOp(id), unit.create.tail);
  }
}
