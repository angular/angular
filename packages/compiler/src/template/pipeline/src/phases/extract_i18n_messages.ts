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
  // Save the i18n context ops for later use.
  const i18nContexts = new Map<ir.XrefId, ir.I18nContextOp>();
  // Record which contexts represent i18n blocks (any other contexts are assumed to have been
  // created from ICUs).
  const i18nBlockContexts = new Set<ir.XrefId>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nContext:
          i18nContexts.set(op.xref, op);
          break;
        case ir.OpKind.I18nStart:
          i18nBlockContexts.add(op.context!);
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
      if (op.kind === ir.OpKind.Icu) {
        if (!op.context) {
          throw Error('ICU op should have its context set.');
        }
        if (!i18nBlockContexts.has(op.context)) {
          const i18nContext = i18nContexts.get(op.context)!;
          const subMessage = createI18nMessage(job, i18nContext, op.messagePlaceholder);
          unit.create.push(subMessage);
          const parentMessage = i18nBlockMessages.get(i18nContext.i18nBlock);
          parentMessage?.subMessages.push(subMessage.xref);
        }
        ir.OpList.remove<ir.CreateOp>(op);
      }
    }
  }
}

/**
 * Create an i18n message op from an i18n context op.
 */
function createI18nMessage(
    job: CompilationJob, context: ir.I18nContextOp, messagePlaceholder?: string): ir.I18nMessageOp {
  let needsPostprocessing = context.postprocessingParams.size > 0;
  for (const values of context.params.values()) {
    if (values.length > 1) {
      needsPostprocessing = true;
    }
  }
  return ir.createI18nMessageOp(
      job.allocateXrefId(), context.i18nBlock, context.message, messagePlaceholder ?? null,
      formatParams(context.params), formatParams(context.postprocessingParams),
      needsPostprocessing);
}

/**
 * Formats a map of `I18nParamValue[]` values into a map of `Expression` values.
 */
function formatParams(params: Map<string, ir.I18nParamValue[]>): Map<string, o.Expression> {
  const result = new Map<string, o.Expression>();
  for (const [placeholder, placeholderValues] of [...params].sort()) {
    const serializedValues = formatParamValues(placeholderValues);
    if (serializedValues !== null) {
      result.set(placeholder, o.literal(formatParamValues(placeholderValues)));
    }
  }
  return result;
}

/**
 * Formats an `I18nParamValue[]` into a string (or null for empty array).
 */
function formatParamValues(values: ir.I18nParamValue[]): string|null {
  if (values.length === 0) {
    return null;
  }
  const serializedValues = values.map(value => formatValue(value));
  return serializedValues.length === 1 ?
      serializedValues[0] :
      `${LIST_START_MARKER}${serializedValues.join(LIST_DELIMITER)}${LIST_END_MARKER}`;
}

/**
 * Formats a single `I18nParamValue` into a string
 */
function formatValue(value: ir.I18nParamValue): string {
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
