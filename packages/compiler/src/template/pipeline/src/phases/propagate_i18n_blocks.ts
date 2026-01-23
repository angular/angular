/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as i18n from '../../../../i18n/i18n_ast';
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
  unit: ViewCompilationUnit,
  subTemplateIndex: number,
): number {
  let i18nBlock: ir.I18nStartOp | null = null;
  for (const op of unit.create) {
    switch (op.kind) {
      case ir.OpKind.I18nStart:
        op.subTemplateIndex = subTemplateIndex === 0 ? null : subTemplateIndex;
        i18nBlock = op;
        break;
      case ir.OpKind.I18nEnd:
        // When we exit a root-level i18n block, reset the sub-template index counter.
        if (i18nBlock!.subTemplateIndex === null) {
          subTemplateIndex = 0;
        }
        i18nBlock = null;
        break;
      case ir.OpKind.ConditionalCreate:
      case ir.OpKind.ConditionalBranchCreate:
      case ir.OpKind.Template:
        subTemplateIndex = propagateI18nBlocksForView(
          unit.job.views.get(op.xref)!,
          i18nBlock,
          op.i18nPlaceholder,
          subTemplateIndex,
        );
        break;
      case ir.OpKind.RepeaterCreate:
        // Propagate i18n blocks to the @for template.
        const forView = unit.job.views.get(op.xref)!;
        subTemplateIndex = propagateI18nBlocksForView(
          forView,
          i18nBlock,
          op.i18nPlaceholder,
          subTemplateIndex,
        );
        // Then if there's an @empty template, propagate the i18n blocks for it as well.
        if (op.emptyView !== null) {
          subTemplateIndex = propagateI18nBlocksForView(
            unit.job.views.get(op.emptyView)!,
            i18nBlock,
            op.emptyI18nPlaceholder,
            subTemplateIndex,
          );
        }
        break;
      case ir.OpKind.Projection:
        if (op.fallbackView !== null) {
          subTemplateIndex = propagateI18nBlocksForView(
            unit.job.views.get(op.fallbackView)!,
            i18nBlock,
            op.fallbackViewI18nPlaceholder,
            subTemplateIndex,
          );
        }
        break;
    }
  }
  return subTemplateIndex;
}

/**
 * Propagate i18n blocks for a view.
 */
function propagateI18nBlocksForView(
  view: ViewCompilationUnit,
  i18nBlock: ir.I18nStartOp | null,
  i18nPlaceholder: i18n.TagPlaceholder | i18n.BlockPlaceholder | undefined,
  subTemplateIndex: number,
) {
  // We found an <ng-template> inside an i18n block; increment the sub-template counter and
  // wrap the template's view in a child i18n block.
  if (i18nPlaceholder !== undefined) {
    if (i18nBlock === null) {
      throw Error('Expected template with i18n placeholder to be in an i18n block.');
    }
    subTemplateIndex++;
    wrapTemplateWithI18n(view, i18nBlock);
  }

  // Continue traversing inside the template's view.
  return propagateI18nBlocksToTemplates(view, subTemplateIndex);
}

/**
 * Wraps a template view with i18n start and end ops.
 */
function wrapTemplateWithI18n(unit: ViewCompilationUnit, parentI18n: ir.I18nStartOp) {
  // Only add i18n ops if they have not already been propagated to this template.
  if (unit.create.head.next?.kind !== ir.OpKind.I18nStart) {
    const id = unit.job.allocateXrefId();
    ir.OpList.insertAfter(
      // Nested ng-template i18n start/end ops should not receive source spans.
      ir.createI18nStartOp(id, parentI18n.message, parentI18n.root, null),
      unit.create.head,
    );
    ir.OpList.insertBefore(ir.createI18nEndOp(id, null), unit.create.tail);
  }
}
