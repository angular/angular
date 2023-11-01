/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import {ComponentCompilationJob} from '../compilation';

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
export function extractI18nMessages(job: ComponentCompilationJob): void {
  // Save the i18n context ops for later use.
  const i18nContexts = new Map<ir.XrefId, ir.I18nContextOp>();
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.I18nContext) {
        i18nContexts.set(op.xref, op);
      }
    }
  }

  for (const unit of job.units) {
    // Extract messages from root i18n blocks.
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.I18nStart && op.xref === op.root) {
        if (!op.context) {
          throw Error('I18n start op should have its context set.');
        }
        const i18nContext = i18nContexts.get(op.context)!;
        // The message will need post-processing if there are any post-processing params, or if
        // there are any normal params that have multiple values
        let needsPostprocessing = i18nContext.postprocessingParams.size > 0;
        for (const values of i18nContext.params.values()) {
          if (values.length > 1) {
            needsPostprocessing = true;
          }
        }
        unit.create.push(ir.createI18nMessageOp(
            i18nContext.i18nBlock, i18nContext.message, formatParams(i18nContext.params),
            formatParams(i18nContext.postprocessingParams), needsPostprocessing));
      }
    }
  }
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
