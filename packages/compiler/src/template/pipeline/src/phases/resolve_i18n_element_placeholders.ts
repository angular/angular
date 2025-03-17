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

  resolvePlaceholdersForView(job, job.root, i18nContexts, elements);
}

/**
 * Recursively resolves element and template tag placeholders in the given view.
 */
function resolvePlaceholdersForView(
  job: ComponentCompilationJob,
  unit: ViewCompilationUnit,
  i18nContexts: Map<ir.XrefId, ir.I18nContextOp>,
  elements: Map<ir.XrefId, ir.ElementStartOp>,
  pendingStructuralDirective?:
    | ir.TemplateOp
    | ir.ConditionalCreateOp
    | ir.ConditionalBranchCreateOp,
) {
  // Track the current i18n op and corresponding i18n context op as we step through the creation
  // IR.
  let currentOps: {i18nBlock: ir.I18nStartOp; i18nContext: ir.I18nContextOp} | null = null;
  let pendingStructuralDirectiveCloses = new Map<
    ir.XrefId,
    ir.TemplateOp | ir.ConditionalCreateOp | ir.ConditionalBranchCreateOp
  >();
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
          recordElementStart(
            op,
            currentOps.i18nContext,
            currentOps.i18nBlock,
            pendingStructuralDirective,
          );
          // If there is a separate close tag placeholder for this element, save the pending
          // structural directive so we can pass it to the closing tag as well.
          if (pendingStructuralDirective && op.i18nPlaceholder.closeName) {
            pendingStructuralDirectiveCloses.set(op.xref, pendingStructuralDirective);
          }
          // Clear out the pending structural directive now that its been accounted for.
          pendingStructuralDirective = undefined;
        }
        break;
      case ir.OpKind.ElementEnd:
        // For elements with i18n placeholders, record its slot value in the params map under the
        // corresponding tag close placeholder.
        const startOp = elements.get(op.xref);
        if (startOp && startOp.i18nPlaceholder !== undefined) {
          if (currentOps === null) {
            throw Error(
              'AssertionError: i18n tag placeholder should only occur inside an i18n block',
            );
          }
          recordElementClose(
            startOp,
            currentOps.i18nContext,
            currentOps.i18nBlock,
            pendingStructuralDirectiveCloses.get(op.xref),
          );
          // Clear out the pending structural directive close that was accounted for.
          pendingStructuralDirectiveCloses.delete(op.xref);
        }
        break;
      case ir.OpKind.Projection:
        // For content projections with i18n placeholders, record its slot value in the params map
        // under the corresponding tag start and close placeholders.
        if (op.i18nPlaceholder !== undefined) {
          if (currentOps === null) {
            throw Error('i18n tag placeholder should only occur inside an i18n block');
          }
          recordElementStart(
            op,
            currentOps.i18nContext,
            currentOps.i18nBlock,
            pendingStructuralDirective,
          );
          recordElementClose(
            op,
            currentOps.i18nContext,
            currentOps.i18nBlock,
            pendingStructuralDirective,
          );
          // Clear out the pending structural directive now that its been accounted for.
          pendingStructuralDirective = undefined;
        }
        break;
      case ir.OpKind.ConditionalCreate:
      case ir.OpKind.ConditionalBranchCreate:
      case ir.OpKind.Template:
        const view = job.views.get(op.xref)!;
        if (op.i18nPlaceholder === undefined) {
          // If there is no i18n placeholder, just recurse into the view in case it contains i18n
          // blocks.
          resolvePlaceholdersForView(job, view, i18nContexts, elements);
        } else {
          if (currentOps === null) {
            throw Error('i18n tag placeholder should only occur inside an i18n block');
          }
          if (op.templateKind === ir.TemplateKind.Structural) {
            // If this is a structural directive template, don't record anything yet. Instead pass
            // the current template as a pending structural directive to be recorded when we find
            // the element, content, or template it belongs to. This allows us to create combined
            // values that represent, e.g. the start of a template and element at the same time.
            resolvePlaceholdersForView(job, view, i18nContexts, elements, op);
          } else {
            // If this is some other kind of template, we can record its start, recurse into its
            // view, and then record its end.
            recordTemplateStart(
              job,
              view,
              op.handle.slot!,
              op.i18nPlaceholder,
              currentOps.i18nContext,
              currentOps.i18nBlock,
              pendingStructuralDirective,
            );
            resolvePlaceholdersForView(job, view, i18nContexts, elements);
            recordTemplateClose(
              job,
              view,
              op.handle.slot!,
              op.i18nPlaceholder,
              currentOps!.i18nContext,
              currentOps!.i18nBlock,
              pendingStructuralDirective,
            );
            pendingStructuralDirective = undefined;
          }
        }
        break;
      case ir.OpKind.RepeaterCreate:
        if (pendingStructuralDirective !== undefined) {
          throw Error('AssertionError: Unexpected structural directive associated with @for block');
        }
        // RepeaterCreate has 3 slots: the first is for the op itself, the second is for the @for
        // template and the (optional) third is for the @empty template.
        const forSlot = op.handle.slot! + 1;
        const forView = job.views.get(op.xref)!;
        // First record all of the placeholders for the @for template.
        if (op.i18nPlaceholder === undefined) {
          // If there is no i18n placeholder, just recurse into the view in case it contains i18n
          // blocks.
          resolvePlaceholdersForView(job, forView, i18nContexts, elements);
        } else {
          if (currentOps === null) {
            throw Error('i18n tag placeholder should only occur inside an i18n block');
          }
          recordTemplateStart(
            job,
            forView,
            forSlot,
            op.i18nPlaceholder,
            currentOps.i18nContext,
            currentOps.i18nBlock,
            pendingStructuralDirective,
          );
          resolvePlaceholdersForView(job, forView, i18nContexts, elements);
          recordTemplateClose(
            job,
            forView,
            forSlot,
            op.i18nPlaceholder,
            currentOps!.i18nContext,
            currentOps!.i18nBlock,
            pendingStructuralDirective,
          );
          pendingStructuralDirective = undefined;
        }
        // Then if there's an @empty template, add its placeholders as well.
        if (op.emptyView !== null) {
          // RepeaterCreate has 3 slots: the first is for the op itself, the second is for the @for
          // template and the (optional) third is for the @empty template.
          const emptySlot = op.handle.slot! + 2;
          const emptyView = job.views.get(op.emptyView!)!;
          if (op.emptyI18nPlaceholder === undefined) {
            // If there is no i18n placeholder, just recurse into the view in case it contains i18n
            // blocks.
            resolvePlaceholdersForView(job, emptyView, i18nContexts, elements);
          } else {
            if (currentOps === null) {
              throw Error('i18n tag placeholder should only occur inside an i18n block');
            }
            recordTemplateStart(
              job,
              emptyView,
              emptySlot,
              op.emptyI18nPlaceholder,
              currentOps.i18nContext,
              currentOps.i18nBlock,
              pendingStructuralDirective,
            );
            resolvePlaceholdersForView(job, emptyView, i18nContexts, elements);
            recordTemplateClose(
              job,
              emptyView,
              emptySlot,
              op.emptyI18nPlaceholder,
              currentOps!.i18nContext,
              currentOps!.i18nBlock,
              pendingStructuralDirective,
            );
            pendingStructuralDirective = undefined;
          }
        }
        break;
    }
  }
}

/**
 * Records an i18n param value for the start of an element.
 */
function recordElementStart(
  op: ir.ElementStartOp | ir.ProjectionOp,
  i18nContext: ir.I18nContextOp,
  i18nBlock: ir.I18nStartOp,
  structuralDirective?: ir.TemplateOp | ir.ConditionalCreateOp | ir.ConditionalBranchCreateOp,
) {
  const {startName, closeName} = op.i18nPlaceholder!;
  let flags = ir.I18nParamValueFlags.ElementTag | ir.I18nParamValueFlags.OpenTag;
  let value: ir.I18nParamValue['value'] = op.handle.slot!;
  // If the element is associated with a structural directive, start it as well.
  if (structuralDirective !== undefined) {
    flags |= ir.I18nParamValueFlags.TemplateTag;
    value = {element: value, template: structuralDirective.handle.slot!};
  }
  // For self-closing tags, there is no close tag placeholder. Instead, the start tag
  // placeholder accounts for the start and close of the element.
  if (!closeName) {
    flags |= ir.I18nParamValueFlags.CloseTag;
  }
  addParam(i18nContext.params, startName, value, i18nBlock.subTemplateIndex, flags);
}

/**
 * Records an i18n param value for the closing of an element.
 */
function recordElementClose(
  op: ir.ElementStartOp | ir.ProjectionOp,
  i18nContext: ir.I18nContextOp,
  i18nBlock: ir.I18nStartOp,
  structuralDirective?: ir.TemplateOp | ir.ConditionalCreateOp | ir.ConditionalBranchCreateOp,
) {
  const {closeName} = op.i18nPlaceholder!;
  // Self-closing tags don't have a closing tag placeholder, instead the element closing is
  // recorded via an additional flag on the element start value.
  if (closeName) {
    let flags = ir.I18nParamValueFlags.ElementTag | ir.I18nParamValueFlags.CloseTag;
    let value: ir.I18nParamValue['value'] = op.handle.slot!;
    // If the element is associated with a structural directive, close it as well.
    if (structuralDirective !== undefined) {
      flags |= ir.I18nParamValueFlags.TemplateTag;
      value = {element: value, template: structuralDirective.handle.slot!};
    }
    addParam(i18nContext.params, closeName, value, i18nBlock.subTemplateIndex, flags);
  }
}

/**
 * Records an i18n param value for the start of a template.
 */
function recordTemplateStart(
  job: ComponentCompilationJob,
  view: ViewCompilationUnit,
  slot: number,
  i18nPlaceholder: i18n.TagPlaceholder | i18n.BlockPlaceholder,
  i18nContext: ir.I18nContextOp,
  i18nBlock: ir.I18nStartOp,
  structuralDirective?: ir.TemplateOp | ir.ConditionalCreateOp | ir.ConditionalBranchCreateOp,
) {
  let {startName, closeName} = i18nPlaceholder;
  let flags = ir.I18nParamValueFlags.TemplateTag | ir.I18nParamValueFlags.OpenTag;
  // For self-closing tags, there is no close tag placeholder. Instead, the start tag
  // placeholder accounts for the start and close of the element.
  if (!closeName) {
    flags |= ir.I18nParamValueFlags.CloseTag;
  }
  // If the template is associated with a structural directive, record the structural directive's
  // start first. Since this template must be in the structural directive's view, we can just
  // directly use the current i18n block's sub-template index.
  if (structuralDirective !== undefined) {
    addParam(
      i18nContext.params,
      startName,
      structuralDirective.handle.slot!,
      i18nBlock.subTemplateIndex,
      flags,
    );
  }
  // Record the start of the template. For the sub-template index, pass the index for the template's
  // view, rather than the current i18n block's index.
  addParam(
    i18nContext.params,
    startName,
    slot,
    getSubTemplateIndexForTemplateTag(job, i18nBlock, view),
    flags,
  );
}

/**
 * Records an i18n param value for the closing of a template.
 */
function recordTemplateClose(
  job: ComponentCompilationJob,
  view: ViewCompilationUnit,
  slot: number,
  i18nPlaceholder: i18n.TagPlaceholder | i18n.BlockPlaceholder,
  i18nContext: ir.I18nContextOp,
  i18nBlock: ir.I18nStartOp,
  structuralDirective?: ir.TemplateOp | ir.ConditionalCreateOp | ir.ConditionalBranchCreateOp,
) {
  const {closeName} = i18nPlaceholder;
  const flags = ir.I18nParamValueFlags.TemplateTag | ir.I18nParamValueFlags.CloseTag;
  // Self-closing tags don't have a closing tag placeholder, instead the template's closing is
  // recorded via an additional flag on the template start value.
  if (closeName) {
    // Record the closing of the template. For the sub-template index, pass the index for the
    // template's view, rather than the current i18n block's index.
    addParam(
      i18nContext.params,
      closeName,
      slot,
      getSubTemplateIndexForTemplateTag(job, i18nBlock, view),
      flags,
    );
    // If the template is associated with a structural directive, record the structural directive's
    // closing after. Since this template must be in the structural directive's view, we can just
    // directly use the current i18n block's sub-template index.
    if (structuralDirective !== undefined) {
      addParam(
        i18nContext.params,
        closeName,
        structuralDirective.handle.slot!,
        i18nBlock.subTemplateIndex,
        flags,
      );
    }
  }
}

/**
 * Get the subTemplateIndex for the given template op. For template ops, use the subTemplateIndex of
 * the child i18n block inside the template.
 */
function getSubTemplateIndexForTemplateTag(
  job: ComponentCompilationJob,
  i18nOp: ir.I18nStartOp,
  view: ViewCompilationUnit,
): number | null {
  for (const childOp of view.create) {
    if (childOp.kind === ir.OpKind.I18nStart) {
      return childOp.subTemplateIndex;
    }
  }
  return i18nOp.subTemplateIndex;
}

/**
 * Add a param value to the given params map.
 */
function addParam(
  params: Map<string, ir.I18nParamValue[]>,
  placeholder: string,
  value: string | number | {element: number; template: number},
  subTemplateIndex: number | null,
  flags: ir.I18nParamValueFlags,
) {
  const values = params.get(placeholder) ?? [];
  values.push({value, subTemplateIndex, flags});
  params.set(placeholder, values);
}
