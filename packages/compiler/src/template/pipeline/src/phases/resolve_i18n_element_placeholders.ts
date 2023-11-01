/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ir from '../../ir';
import {ComponentCompilationJob} from '../compilation';

/**
 * Resolve the element placeholders in i18n messages.
 */
export function resolveI18nElementPlaceholders(job: ComponentCompilationJob) {
  // Record all of the element and i18n context ops for use later.
  const i18nContexts = new Map<ir.XrefId, ir.I18nContextOp>();
  const elements = new Map<ir.XrefId, ir.ElementStartOp>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nContext:
          i18nContexts.set(op.xref, op);
          break;
        case ir.OpKind.ElementStart:
          elements.set(op.xref, op);
          break;
      }
    }
  }

  for (const unit of job.units) {
    // Track the current i18n op and corresponding i18n context op as we step through the creation
    // IR.
    let currentOps: {i18nBlock: ir.I18nStartOp, i18nContext: ir.I18nContextOp}|null = null;

    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
          if (!op.context) {
            throw Error('Could not find i18n context for i18n op');
          }
          currentOps = {i18nBlock: op, i18nContext: i18nContexts.get(op.context)!};
          break;
        case ir.OpKind.I18nEnd:
          currentOps = null;
          break;
        case ir.OpKind.ElementStart:
          // For elements with i18n placeholders, record its slot value in the params map under the
          // corresponding tag start placeholder.
          if (op.i18nPlaceholder !== undefined) {
            if (currentOps === null) {
              throw Error('i18n tag placeholder should only occur inside an i18n block');
            }
            const {startName, closeName} = op.i18nPlaceholder;
            let flags = ir.I18nParamValueFlags.ElementTag | ir.I18nParamValueFlags.OpenTag;
            // For self-closing tags, there is no close tag placeholder. Instead, the start tag
            // placeholder accounts for the start and close of the element.
            if (closeName === '') {
              flags |= ir.I18nParamValueFlags.CloseTag;
            }
            addParam(
                currentOps.i18nContext.params, startName, op.handle.slot!,
                currentOps.i18nBlock.subTemplateIndex, flags);
          }
          break;
        case ir.OpKind.ElementEnd:
          // For elements with i18n placeholders, record its slot value in the params map under the
          // corresponding tag close placeholder.
          const startOp = elements.get(op.xref);
          if (startOp && startOp.i18nPlaceholder !== undefined) {
            if (currentOps === null) {
              throw Error('i18n tag placeholder should only occur inside an i18n block');
            }
            const {closeName} = startOp.i18nPlaceholder;
            // Self-closing tags don't have a closing tag placeholder.
            if (closeName !== '') {
              addParam(
                  currentOps.i18nContext.params, closeName, startOp.handle.slot!,
                  currentOps.i18nBlock.subTemplateIndex,
                  ir.I18nParamValueFlags.ElementTag | ir.I18nParamValueFlags.CloseTag);
            }
          }
          break;
        case ir.OpKind.Template:
          // For templates with i18n placeholders, record its slot value in the params map under the
          // corresponding template start and close placeholders.
          if (op.i18nPlaceholder !== undefined) {
            if (currentOps === null) {
              throw Error('i18n tag placeholder should only occur inside an i18n block');
            }
            const subTemplateIndex =
                getSubTemplateIndexForTemplateTag(job, currentOps.i18nBlock, op);
            addParam(
                currentOps.i18nContext.params, op.i18nPlaceholder.startName, op.handle.slot!,
                subTemplateIndex, ir.I18nParamValueFlags.TemplateTag);
            addParam(
                currentOps.i18nContext.params, op.i18nPlaceholder.closeName, op.handle.slot!,
                subTemplateIndex,
                ir.I18nParamValueFlags.TemplateTag | ir.I18nParamValueFlags.CloseTag);
          }
          break;
      }
    }
  }
}

/**
 * Get the subTemplateIndex for the given template op. For template ops, use the subTemplateIndex of
 * the child i18n block inside the template.
 */
function getSubTemplateIndexForTemplateTag(
    job: ComponentCompilationJob, i18nOp: ir.I18nStartOp, op: ir.TemplateOp): number|null {
  for (const childOp of job.views.get(op.xref)!.create) {
    if (childOp.kind === ir.OpKind.I18nStart) {
      return childOp.subTemplateIndex;
    }
  }
  return i18nOp.subTemplateIndex;
}

/** Add a param value to the given params map. */
function addParam(
    params: Map<string, ir.I18nParamValue[]>, placeholder: string, value: string|number,
    subTemplateIndex: number|null, flags = ir.I18nParamValueFlags.None) {
  const values = params.get(placeholder) ?? [];
  values.push({value, subTemplateIndex, flags});
  params.set(placeholder, values);
}
