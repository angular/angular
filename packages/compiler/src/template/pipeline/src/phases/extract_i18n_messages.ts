/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

/**
 * The escape sequence used indicate message param values.
 */
const ESCAPE = '\uFFFD';

/**
 * Marker used to indicate an element tag.
 */
const ELEMENT_MARKER = '#';

/**
 * Marker used to indicate a template tag.
 */
const TEMPLATE_MARKER = '*';

/**
 * Marker used to indicate closing of an element or template tag.
 */
const TAG_CLOSE_MARKER = '/';

/**
 * Marker used to indicate the sub-template context.
 */
const CONTEXT_MARKER = ':';

/**
 * Marker used to indicate the start of a list of values.
 */
const LIST_START_MARKER = '[';

/**
 * Marker used to indicate the end of a list of values.
 */
const LIST_END_MARKER = ']';

/**
 * Delimiter used to separate multiple values in a list.
 */
const LIST_DELIMITER = '|';

/**
 * Formats the param maps on extracted message ops into a maps of `Expression` objects that can be
 * used in the final output.
 */
export function extractI18nMessages(job: CompilationJob): void {
  // Save the i18n start and i18n context ops for later use.
  const i18nContexts = new Map<ir.XrefId, ir.I18nContextOp>();
  const i18nBlocks = new Map<ir.XrefId, ir.I18nStartOp>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nContext:
          i18nContexts.set(op.xref, op);
          break;
        case ir.OpKind.I18nStart:
          i18nBlocks.set(op.xref, op);
          break;
      }
    }
  }

  // Extract messages from root i18n blocks.
  const i18nBlockMessages = new Map<ir.XrefId, ir.I18nMessageOp>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.I18nStart && op.xref === op.root) {
        if (!op.context) {
          throw Error('I18n start op should have its context set.');
        }
        const i18nMessageOp = createI18nMessage(job, i18nContexts.get(op.context)!);
        i18nBlockMessages.set(op.xref, i18nMessageOp);
        unit.create.push(i18nMessageOp);
      }
    }
  }

  // Extract messages from ICUs with their own sub-context.
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.IcuStart:
          if (!op.context) {
            throw Error('ICU op should have its context set.');
          }
          const i18nContext = i18nContexts.get(op.context)!;
          if (i18nContext.contextKind === ir.I18nContextKind.Icu) {
            const subMessage = createI18nMessage(job, i18nContext, op.messagePlaceholder);
            unit.create.push(subMessage);
            const rootI18nId = i18nBlocks.get(i18nContext.i18nBlock)!.root;
            const parentMessage = i18nBlockMessages.get(rootI18nId);
            parentMessage?.subMessages.push(subMessage.xref);
          }
          ir.OpList.remove<ir.CreateOp>(op);
          break;
        case ir.OpKind.IcuEnd:
          ir.OpList.remove<ir.CreateOp>(op);
          break;
      }
    }
  }
}

/**
 * Create an i18n message op from an i18n context op.
 */
function createI18nMessage(
    job: CompilationJob, context: ir.I18nContextOp, messagePlaceholder?: string): ir.I18nMessageOp {
  let [formattedParams, needsPostprocessing] = formatParams(context.params);
  const [formattedPostprocessingParams] = formatParams(context.postprocessingParams);
  needsPostprocessing ||= formattedPostprocessingParams.size > 0;
  return ir.createI18nMessageOp(
      job.allocateXrefId(), context.i18nBlock, context.message, messagePlaceholder ?? null,
      formattedParams, formattedPostprocessingParams, needsPostprocessing);
}

/**
 * Formats a map of `I18nParamValue[]` values into a map of `Expression` values.
 * @return A tuple of the formatted params and a boolean indicating whether postprocessing is needed
 *     for any of the params
 */
function formatParams(params: Map<string, ir.I18nParamValue[]>):
    [Map<string, o.Expression>, boolean] {
  const formattedParams = new Map<string, o.Expression>();
  let needsPostprocessing = false;
  for (const [placeholder, placeholderValues] of params) {
    const [serializedValues, paramNeedsPostprocessing] = formatParamValues(placeholderValues);
    needsPostprocessing ||= paramNeedsPostprocessing;
    if (serializedValues !== null) {
      formattedParams.set(placeholder, o.literal(serializedValues));
    }
  }
  return [formattedParams, needsPostprocessing];
}

/**
 * Formats an `I18nParamValue[]` into a string (or null for empty array).
 * @return A tuple of the formatted value and a boolean indicating whether postprocessing is needed
 *     for the value
 */
function formatParamValues(values: ir.I18nParamValue[]): [string|null, boolean] {
  if (values.length === 0) {
    return [null, false];
  }
  collapseElementTemplatePairs(values);
  const serializedValues = values.map(value => formatValue(value));
  return serializedValues.length === 1 ?
      [serializedValues[0], false] :
      [`${LIST_START_MARKER}${serializedValues.join(LIST_DELIMITER)}${LIST_END_MARKER}`, true];
}

/**
 * Collapses element/template pairs that refer to the same subTemplateIndex, i.e. elements and
 * templates that refer to the same element instance.
 *
 * This accounts for the case of a structural directive inside an i18n block, e.g.:
 * ```
 * <div i18n>
 *   <div *ngIf="condition">
 * </div>
 * ```
 *
 * In this case, both the element start and template start placeholders are the same,
 * and we collapse them down into a single compound placeholder value. Rather than produce
 * `[\uFFFD#1:1\uFFFD|\uFFFD*2:1\uFFFD]`, we want to produce `\uFFFD#1:1\uFFFD\uFFFD*2:1\uFFFD`,
 * likewise for the closing of the element/template.
 */
function collapseElementTemplatePairs(values: ir.I18nParamValue[]) {
  // Record the indicies of element and template values in the values array by subTemplateIndex.
  const valueIndiciesBySubTemplateIndex = new Map<number, number[]>();
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value.subTemplateIndex !== null &&
        (value.flags & (ir.I18nParamValueFlags.ElementTag | ir.I18nParamValueFlags.TemplateTag))) {
      const valueIndicies = valueIndiciesBySubTemplateIndex.get(value.subTemplateIndex) ?? [];
      valueIndicies.push(i);
      valueIndiciesBySubTemplateIndex.set(value.subTemplateIndex, valueIndicies);
    }
  }

  // For each subTemplateIndex, check if any values can be collapsed.
  for (const [subTemplateIndex, valueIndicies] of valueIndiciesBySubTemplateIndex) {
    if (valueIndicies.length > 1) {
      const elementIndex =
          valueIndicies.find(index => values[index].flags & ir.I18nParamValueFlags.ElementTag);
      const templateIndex =
          valueIndicies.find(index => values[index].flags & ir.I18nParamValueFlags.TemplateTag);
      // If the values list contains both an element and template value, we can collapse.
      if (elementIndex !== undefined && templateIndex !== undefined) {
        const elementValue = values[elementIndex];
        const templateValue = values[templateIndex];
        // To match the TemplateDefinitionBuilder output, flip the order depending on whether the
        // values represent a closing or opening tag (or both).
        // TODO(mmalerba): Figure out if this makes a difference in terms of either functionality,
        // or the resulting message ID. If not, we can remove the special-casing in the future.
        let compundValue: string;
        if ((elementValue.flags & ir.I18nParamValueFlags.OpenTag) &&
            (elementValue.flags & ir.I18nParamValueFlags.CloseTag)) {
          // TODO(mmalerba): Is this a TDB bug? I don't understand why it would put the template
          // value twice.
          compundValue = `${formatValue(templateValue)}${formatValue(elementValue)}${
              formatValue(templateValue)}`;
        } else if (elementValue.flags & ir.I18nParamValueFlags.OpenTag) {
          compundValue = `${formatValue(templateValue)}${formatValue(elementValue)}`;
        } else {
          compundValue = `${formatValue(elementValue)}${formatValue(templateValue)}`;
        }
        // Replace the element value with the combined value.
        values.splice(
            elementIndex, 1,
            {value: compundValue, subTemplateIndex, flags: ir.I18nParamValueFlags.None});
        // Replace the template value with null to preserve the indicies we calculated earlier.
        values.splice(templateIndex, 1, null!);
      }
    }
  }

  // Strip out any nulled out values we introduced above.
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i] === null) {
      values.splice(i, 1);
    }
  }
}

/**
 * Formats a single `I18nParamValue` into a string
 */
function formatValue(value: ir.I18nParamValue): string {
  // If there are no special flags, just return the raw value.
  if (value.flags === ir.I18nParamValueFlags.None) {
    return `${value.value}`;
  }

  let tagMarker = '';
  let closeMarker = '';
  if (value.flags & ir.I18nParamValueFlags.ElementTag) {
    tagMarker = ELEMENT_MARKER;
  } else if (value.flags & ir.I18nParamValueFlags.TemplateTag) {
    tagMarker = TEMPLATE_MARKER;
  }
  if (tagMarker !== '') {
    closeMarker = value.flags & ir.I18nParamValueFlags.CloseTag ? TAG_CLOSE_MARKER : '';
  }
  const context =
      value.subTemplateIndex === null ? '' : `${CONTEXT_MARKER}${value.subTemplateIndex}`;
  // Self-closing tags use a special form that concatenates the start and close tag values.
  if ((value.flags & ir.I18nParamValueFlags.OpenTag) &&
      (value.flags & ir.I18nParamValueFlags.CloseTag)) {
    return `${ESCAPE}${tagMarker}${value.value}${context}${ESCAPE}${ESCAPE}${closeMarker}${
        tagMarker}${value.value}${context}${ESCAPE}`;
  }
  return `${ESCAPE}${closeMarker}${tagMarker}${value.value}${context}${ESCAPE}`;
}
