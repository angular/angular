/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
  // Create an i18n message for each context.
  // TODO: Merge the context op with the message op since they're 1:1 anyways.
  const i18nMessagesByContext = new Map<ir.XrefId, ir.I18nMessageOp>();
  const i18nBlocks = new Map<ir.XrefId, ir.I18nStartOp>();
  const i18nContexts = new Map<ir.XrefId, ir.I18nContextOp>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nContext:
          const i18nMessageOp = createI18nMessage(job, op);
          unit.create.push(i18nMessageOp);
          i18nMessagesByContext.set(op.xref, i18nMessageOp);
          i18nContexts.set(op.xref, op);
          break;
        case ir.OpKind.I18nStart:
          i18nBlocks.set(op.xref, op);
          break;
      }
    }
  }

  // Associate sub-messages for ICUs with their root message. At this point we can also remove the
  // ICU start/end ops, as they are no longer needed.
  let currentIcu: ir.IcuStartOp | null = null;
  for (const unit of job.units) {
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.IcuStart:
          currentIcu = op;
          ir.OpList.remove<ir.CreateOp>(op);
          // Skip any contexts not associated with an ICU.
          const icuContext = i18nContexts.get(op.context!)!;
          if (icuContext.contextKind !== ir.I18nContextKind.Icu) {
            continue;
          }
          // Skip ICUs that share a context with their i18n message. These represent root-level
          // ICUs, not sub-messages.
          const i18nBlock = i18nBlocks.get(icuContext.i18nBlock!)!;
          if (i18nBlock.context === icuContext.xref) {
            continue;
          }
          // Find the root message and push this ICUs message as a sub-message.
          const rootI18nBlock = i18nBlocks.get(i18nBlock.root)!;
          const rootMessage = i18nMessagesByContext.get(rootI18nBlock.context!);
          if (rootMessage === undefined) {
            throw Error('AssertionError: ICU sub-message should belong to a root message.');
          }
          const subMessage = i18nMessagesByContext.get(icuContext.xref)!;
          subMessage.messagePlaceholder = op.messagePlaceholder;
          rootMessage.subMessages.push(subMessage.xref);
          break;
        case ir.OpKind.IcuEnd:
          currentIcu = null;
          ir.OpList.remove<ir.CreateOp>(op);
          break;
        case ir.OpKind.IcuPlaceholder:
          // Add ICU placeholders to the message, then remove the ICU placeholder ops.
          if (currentIcu === null || currentIcu.context == null) {
            throw Error('AssertionError: Unexpected ICU placeholder outside of i18n context');
          }
          const msg = i18nMessagesByContext.get(currentIcu.context)!;
          msg.postprocessingParams.set(op.name, o.literal(formatIcuPlaceholder(op)));
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
  job: CompilationJob,
  context: ir.I18nContextOp,
  messagePlaceholder?: string,
): ir.I18nMessageOp {
  let formattedParams = formatParams(context.params);
  const formattedPostprocessingParams = formatParams(context.postprocessingParams);
  let needsPostprocessing = [...context.params.values()].some((v) => v.length > 1);
  return ir.createI18nMessageOp(
    job.allocateXrefId(),
    context.xref,
    context.i18nBlock,
    context.message,
    messagePlaceholder ?? null,
    formattedParams,
    formattedPostprocessingParams,
    needsPostprocessing,
  );
}

/**
 * Formats an ICU placeholder into a single string with expression placeholders.
 */
function formatIcuPlaceholder(op: ir.IcuPlaceholderOp) {
  if (op.strings.length !== op.expressionPlaceholders.length + 1) {
    throw Error(
      `AssertionError: Invalid ICU placeholder with ${op.strings.length} strings and ${op.expressionPlaceholders.length} expressions`,
    );
  }
  const values = op.expressionPlaceholders.map(formatValue);
  return op.strings.flatMap((str, i) => [str, values[i] || '']).join('');
}

/**
 * Formats a map of `I18nParamValue[]` values into a map of `Expression` values.
 */
function formatParams(params: Map<string, ir.I18nParamValue[]>) {
  const formattedParams = new Map<string, o.Expression>();
  for (const [placeholder, placeholderValues] of params) {
    const serializedValues = formatParamValues(placeholderValues);
    if (serializedValues !== null) {
      formattedParams.set(placeholder, o.literal(serializedValues));
    }
  }
  return formattedParams;
}

/**
 * Formats an `I18nParamValue[]` into a string (or null for empty array).
 */
function formatParamValues(values: ir.I18nParamValue[]): string | null {
  if (values.length === 0) {
    return null;
  }
  const serializedValues = values.map((value) => formatValue(value));
  return serializedValues.length === 1
    ? serializedValues[0]
    : `${LIST_START_MARKER}${serializedValues.join(LIST_DELIMITER)}${LIST_END_MARKER}`;
}

/**
 * Formats a single `I18nParamValue` into a string
 */
function formatValue(value: ir.I18nParamValue): string {
  // Element tags with a structural directive use a special form that concatenates the element and
  // template values.
  if (
    value.flags & ir.I18nParamValueFlags.ElementTag &&
    value.flags & ir.I18nParamValueFlags.TemplateTag
  ) {
    if (typeof value.value !== 'object') {
      throw Error('AssertionError: Expected i18n param value to have an element and template slot');
    }
    const elementValue = formatValue({
      ...value,
      value: value.value.element,
      flags: value.flags & ~ir.I18nParamValueFlags.TemplateTag,
    });
    const templateValue = formatValue({
      ...value,
      value: value.value.template,
      flags: value.flags & ~ir.I18nParamValueFlags.ElementTag,
    });
    // TODO(mmalerba): This is likely a bug in TemplateDefinitionBuilder, we should not need to
    // record the template value twice. For now I'm re-implementing the behavior here to keep the
    // output consistent with TemplateDefinitionBuilder.
    if (
      value.flags & ir.I18nParamValueFlags.OpenTag &&
      value.flags & ir.I18nParamValueFlags.CloseTag
    ) {
      return `${templateValue}${elementValue}${templateValue}`;
    }
    // To match the TemplateDefinitionBuilder output, flip the order depending on whether the
    // values represent a closing or opening tag (or both).
    // TODO(mmalerba): Figure out if this makes a difference in terms of either functionality,
    // or the resulting message ID. If not, we can remove the special-casing in the future.
    return value.flags & ir.I18nParamValueFlags.CloseTag
      ? `${elementValue}${templateValue}`
      : `${templateValue}${elementValue}`;
  }

  // Self-closing tags use a special form that concatenates the start and close tag values.
  if (
    value.flags & ir.I18nParamValueFlags.OpenTag &&
    value.flags & ir.I18nParamValueFlags.CloseTag
  ) {
    return `${formatValue({
      ...value,
      flags: value.flags & ~ir.I18nParamValueFlags.CloseTag,
    })}${formatValue({...value, flags: value.flags & ~ir.I18nParamValueFlags.OpenTag})}`;
  }

  // If there are no special flags, just return the raw value.
  if (value.flags === ir.I18nParamValueFlags.None) {
    return `${value.value}`;
  }

  // Encode the remaining flags as part of the value.
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
  return `${ESCAPE}${closeMarker}${tagMarker}${value.value}${context}${ESCAPE}`;
}
