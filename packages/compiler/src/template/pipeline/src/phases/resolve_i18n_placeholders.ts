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

enum I18nParamValueFlags {
  None = 0b000,

  /**
   *  This value represtents an element tag.
   */
  ElementTag = 0b001,

  /**
   * This value represents a template tag.
   */
  TemplateTag = 0b010,

  /**
   * This value represents the closing of a tag. (Can only be used together with ElementTag or
   * TemplateTag)
   */
  CloseTag = 0b100,
}

/**
 * Represents a single placeholder value in the i18n params map. The map may contain multiple
 * I18nPlaceholderValue per placeholder.
 */
interface I18nPlaceholderValue {
  /**
   * The value.
   */
  value: string|number;

  /**
   * The sub-template index associated with the value.
   */
  subTemplateIndex: number|null;

  /**
   * Flags associated with the value.
   */
  flags: I18nParamValueFlags;
}

/**
 * Represents the complete i18n params map for an i18n op.
 */
class I18nPlaceholderParams {
  values = new Map<string, I18nPlaceholderValue[]>();

  /**
   * Adds a new value to the params map.
   */
  addValue(
      placeholder: string, value: string|number, subTemplateIndex: number|null,
      flags: I18nParamValueFlags) {
    const placeholderValues = this.values.get(placeholder) ?? [];
    placeholderValues.push({value, subTemplateIndex, flags});
    this.values.set(placeholder, placeholderValues);
  }

  /**
   * Saves the params map, in serialized form, into the given i18n op.
   */
  saveToOp(op: ir.I18nOp|ir.I18nStartOp) {
    for (const [placeholder, placeholderValues] of this.values) {
      op.params.set(placeholder, o.literal(this.serializeValues(placeholderValues)));
    }
  }

  /**
   * Serializes a list of i18n placeholder values.
   */
  private serializeValues(values: I18nPlaceholderValue[]) {
    const serializedValues = values.map(value => this.serializeValue(value));
    return serializedValues.length === 1 ?
        serializedValues[0] :
        `${LIST_START_MARKER}${serializedValues.join(LIST_DELIMITER)}${LIST_END_MARKER}`;
  }

  /**
   * Serializes a single i18n placeholder value.
   */
  private serializeValue(value: I18nPlaceholderValue) {
    let tagMarker = '';
    let closeMarker = '';
    if (value.flags & I18nParamValueFlags.ElementTag) {
      tagMarker = ELEMENT_MARKER;
    } else if (value.flags & I18nParamValueFlags.TemplateTag) {
      tagMarker = TEMPLATE_MARKER;
    }
    if (tagMarker !== '') {
      closeMarker = value.flags & I18nParamValueFlags.CloseTag ? TAG_CLOSE_MARKER : '';
    }
    const context =
        value.subTemplateIndex === null ? '' : `${CONTEXT_MARKER}${value.subTemplateIndex}`;
    return `${ESCAPE}${closeMarker}${tagMarker}${value.value}${context}${ESCAPE}`;
  }
}

/**
 * Resolve the placeholders in i18n messages.
 */
export function phaseResolveI18nPlaceholders(job: ComponentCompilationJob) {
  for (const unit of job.units) {
    const i18nOps = new Map<ir.XrefId, ir.I18nOp|ir.I18nStartOp>();
    const params = new Map<ir.XrefId, I18nPlaceholderParams>();
    let currentI18nOp: ir.I18nStartOp|null = null;

    // Record slots for tag name placeholders.
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
        case ir.OpKind.I18n:
          i18nOps.set(op.xref, op);
          currentI18nOp = op.kind === ir.OpKind.I18nStart ? op : null;
          break;
        case ir.OpKind.I18nEnd:
          currentI18nOp = null;
          break;
        case ir.OpKind.Element:
        case ir.OpKind.ElementStart:
        case ir.OpKind.Template:
          // For elements with i18n placeholders, record its slot value in the params map under both
          // the start and close placeholders.
          if (op.i18nPlaceholder !== undefined) {
            if (currentI18nOp === null) {
              throw Error('i18n tag placeholder should only occur inside an i18n block');
            }
            const {startName, closeName} = op.i18nPlaceholder;
            const subTemplateIndex = getSubTemplateIndexForTag(job, currentI18nOp, op);
            const flags = op.kind === ir.OpKind.Template ? I18nParamValueFlags.TemplateTag :
                                                           I18nParamValueFlags.ElementTag;
            addParam(params, currentI18nOp, startName, op.slot!, subTemplateIndex, flags);
            addParam(
                params, currentI18nOp, closeName, op.slot!, subTemplateIndex,
                flags | I18nParamValueFlags.CloseTag);
          }
          break;
      }
    }

    // Fill in values for each of the i18n expression placeholders.
    const i18nBlockPlaceholderIndices = new Map<ir.XrefId, number>();
    for (const op of unit.update) {
      if (op.kind === ir.OpKind.I18nExpression) {
        const i18nOp = i18nOps.get(op.owner);
        let index = i18nBlockPlaceholderIndices.get(op.owner) || 0;
        if (!i18nOp) {
          throw Error('Cannot find corresponding i18nStart for i18nExpr');
        }
        addParam(params, i18nOp, op.i18nPlaceholder.name, index++, i18nOp.subTemplateIndex);
        i18nBlockPlaceholderIndices.set(op.owner, index);
      }
    }

    // After colleccting all params, save them to the i18n ops.
    for (const [xref, i18nOpParams] of params) {
      i18nOpParams.saveToOp(i18nOps.get(xref)!);
    }
  }
}

/**
 * Add a param to the params map for the given i18n op.
 */
function addParam(
    params: Map<ir.XrefId, I18nPlaceholderParams>, i18nOp: ir.I18nOp|ir.I18nStartOp,
    placeholder: string, value: string|number, subTemplateIndex: number|null,
    flags: I18nParamValueFlags = I18nParamValueFlags.None) {
  const i18nOpParams = params.get(i18nOp.xref) ?? new I18nPlaceholderParams();
  i18nOpParams.addValue(placeholder, value, subTemplateIndex, flags);
  params.set(i18nOp.xref, i18nOpParams);
}

/**
 * Get the subTemplateIndex for the given op. For template ops, use the subTemplateIndex of the
 * child i18n block inside the template. For all other ops, use the subTemplateIndex of the i18n
 * block the op belongs to.
 */
function getSubTemplateIndexForTag(
    job: ComponentCompilationJob, i18nOp: ir.I18nStartOp, op: ir.CreateOp): number|null {
  if (op.kind === ir.OpKind.Template) {
    for (const childOp of job.views.get(op.xref)!.create) {
      if (childOp.kind === ir.OpKind.I18nStart) {
        return childOp.subTemplateIndex;
      }
    }
  }
  return i18nOp.subTemplateIndex;
}
