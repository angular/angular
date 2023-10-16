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
 * Flags that describe what an i18n param value. These determine how the value is serialized into
 * the final map.
 */
enum I18nParamValueFlags {
  None = 0b0000,

  /**
   *  This value represtents an element tag.
   */
  ElementTag = 0b001,

  /**
   * This value represents a template tag.
   */
  TemplateTag = 0b0010,

  /**
   * This value represents the opening of a tag.
   */
  OpenTag = 0b0100,

  /**
   * This value represents the closing of a tag.
   */
  CloseTag = 0b1000,
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

  /**
   * The time when the placeholder value is resolved.
   */
  resolutionTime: ir.I18nParamResolutionTime;
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
      resolutionTime: ir.I18nParamResolutionTime, flags: I18nParamValueFlags) {
    const placeholderValues = this.values.get(placeholder) ?? [];
    placeholderValues.push({value, subTemplateIndex, resolutionTime, flags});
    this.values.set(placeholder, placeholderValues);
  }

  /**
   * Saves the params map, in serialized form, into the given i18n op.
   */
  saveToOp(op: ir.I18nStartOp) {
    for (const [placeholder, placeholderValues] of this.values) {
      // We need to run post-processing for any 1i8n ops that contain parameters with more than
      // one value, even if there are no parameters resolved at post-processing time.
      const creationValues = placeholderValues.filter(
          ({resolutionTime}) => resolutionTime === ir.I18nParamResolutionTime.Creation);
      if (creationValues.length > 1) {
        op.needsPostprocessing = true;
      }

      // Save creation time params to op.
      const serializedCreationValues = this.serializeValues(creationValues);
      if (serializedCreationValues !== null) {
        op.params.set(placeholder, o.literal(serializedCreationValues));
      }

      // Save post-processing time params to op.
      const serializedPostprocessingValues = this.serializeValues(placeholderValues.filter(
          ({resolutionTime}) => resolutionTime === ir.I18nParamResolutionTime.Postproccessing));
      if (serializedPostprocessingValues !== null) {
        op.needsPostprocessing = true;
        op.postprocessingParams.set(placeholder, o.literal(serializedPostprocessingValues));
      }
    }
  }

  /**
   * Merges another param map into this one.
   */
  merge(other: I18nPlaceholderParams) {
    for (const [placeholder, otherValues] of other.values) {
      const currentValues = this.values.get(placeholder) || [];
      // Child element close tag params should be prepended to maintain the same order as
      // TemplateDefinitionBuilder.
      const flags = otherValues[0]!.flags;
      if ((flags & I18nParamValueFlags.CloseTag) && !(flags & I18nParamValueFlags.OpenTag)) {
        this.values.set(placeholder, [...otherValues, ...currentValues]);
      } else {
        this.values.set(placeholder, [...currentValues, ...otherValues]);
      }
    }
  }

  /**
   * Serializes a list of i18n placeholder values.
   */
  private serializeValues(values: I18nPlaceholderValue[]) {
    if (values.length === 0) {
      return null;
    }
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
    // Self-closing tags use a special form that concatenates the start and close tag values.
    if ((value.flags & I18nParamValueFlags.OpenTag) &&
        (value.flags & I18nParamValueFlags.CloseTag)) {
      return `${ESCAPE}${tagMarker}${value.value}${context}${ESCAPE}${ESCAPE}${closeMarker}${
          tagMarker}${value.value}${context}${ESCAPE}`;
    }
    return `${ESCAPE}${closeMarker}${tagMarker}${value.value}${context}${ESCAPE}`;
  }
}

/**
 * Resolve the placeholders in i18n messages.
 */
export function phaseResolveI18nPlaceholders(job: ComponentCompilationJob) {
  const params = new Map<ir.XrefId, I18nPlaceholderParams>();
  const i18nOps = new Map<ir.XrefId, ir.I18nStartOp>();

  resolvePlaceholders(job, params, i18nOps);
  propagatePlaceholders(params, i18nOps);

  // After colleccting all params, save them to the i18n ops.
  for (const [xref, i18nOpParams] of params) {
    i18nOpParams.saveToOp(i18nOps.get(xref)!);
  }

  // Validate the root i18n ops have all placeholders filled in.
  for (const op of i18nOps.values()) {
    if (op.xref === op.root) {
      for (const placeholder in op.message.placeholders) {
        if (!op.params.has(placeholder) && !op.postprocessingParams.has(placeholder)) {
          throw Error(`Failed to resolve i18n placeholder: ${placeholder}`);
        }
      }
    }
  }
}

/**
 * Resolve placeholders for each i18n op.
 */
function resolvePlaceholders(
    job: ComponentCompilationJob, params: Map<ir.XrefId, I18nPlaceholderParams>,
    i18nOps: Map<ir.XrefId, ir.I18nStartOp>) {
  for (const unit of job.units) {
    const elements = new Map<ir.XrefId, ir.ElementStartOp>();
    let currentI18nOp: ir.I18nStartOp|null = null;

    // Record slots for tag name placeholders.
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
          i18nOps.set(op.xref, op);
          currentI18nOp = op.kind === ir.OpKind.I18nStart ? op : null;
          break;
        case ir.OpKind.I18nEnd:
          currentI18nOp = null;
          break;
        case ir.OpKind.ElementStart:
          // For elements with i18n placeholders, record its slot value in the params map under the
          // corresponding tag start placeholder.
          if (op.i18nPlaceholder !== undefined) {
            if (currentI18nOp === null) {
              throw Error('i18n tag placeholder should only occur inside an i18n block');
            }
            elements.set(op.xref, op);
            const {startName, closeName} = op.i18nPlaceholder;
            let flags = I18nParamValueFlags.ElementTag | I18nParamValueFlags.OpenTag;
            // For self-closing tags, there is no close tag placeholder. Instead, the start tag
            // placeholder accounts for the start and close of the element.
            if (closeName === '') {
              flags |= I18nParamValueFlags.CloseTag;
            }
            addParam(
                params, currentI18nOp, startName, op.slot!, currentI18nOp.subTemplateIndex,
                ir.I18nParamResolutionTime.Creation, flags);
          }
          break;
        case ir.OpKind.ElementEnd:
          const startOp = elements.get(op.xref);
          if (startOp && startOp.i18nPlaceholder !== undefined) {
            if (currentI18nOp === null) {
              throw Error('i18n tag placeholder should only occur inside an i18n block');
            }
            const {closeName} = startOp.i18nPlaceholder;
            // Self-closing tags don't have a closing tag placeholder.
            if (closeName !== '') {
              addParam(
                  params, currentI18nOp, closeName, startOp.slot!, currentI18nOp.subTemplateIndex,
                  ir.I18nParamResolutionTime.Creation,
                  I18nParamValueFlags.ElementTag | I18nParamValueFlags.CloseTag);
            }
          }
          break;
        case ir.OpKind.Template:
          if (op.i18nPlaceholder !== undefined) {
            if (currentI18nOp === null) {
              throw Error('i18n tag placeholder should only occur inside an i18n block');
            }
            const subTemplateIndex = getSubTemplateIndexForTemplateTag(job, currentI18nOp, op);
            addParam(
                params, currentI18nOp, op.i18nPlaceholder.startName, op.slot!, subTemplateIndex,
                ir.I18nParamResolutionTime.Creation, I18nParamValueFlags.TemplateTag);
            addParam(
                params, currentI18nOp, op.i18nPlaceholder.closeName, op.slot!, subTemplateIndex,
                ir.I18nParamResolutionTime.Creation,
                I18nParamValueFlags.TemplateTag | I18nParamValueFlags.CloseTag);
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
        addParam(
            params, i18nOp, op.i18nPlaceholder, index++, i18nOp.subTemplateIndex,
            op.resolutionTime);
        i18nBlockPlaceholderIndices.set(op.owner, index);
      }
    }
  }
}

/**
 * Add a param to the params map for the given i18n op.
 */
function addParam(
    params: Map<ir.XrefId, I18nPlaceholderParams>, i18nOp: ir.I18nStartOp, placeholder: string,
    value: string|number, subTemplateIndex: number|null, resolutionTime: ir.I18nParamResolutionTime,
    flags: I18nParamValueFlags = I18nParamValueFlags.None) {
  const i18nOpParams = params.get(i18nOp.xref) || new I18nPlaceholderParams();
  i18nOpParams.addValue(placeholder, value, subTemplateIndex, resolutionTime, flags);
  params.set(i18nOp.xref, i18nOpParams);
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

/**
 * Propagate placeholders up to their root i18n op.
 */
function propagatePlaceholders(
    params: Map<ir.XrefId, I18nPlaceholderParams>, i18nOps: Map<ir.XrefId, ir.I18nStartOp>) {
  for (const [xref, opParams] of params) {
    const op = i18nOps.get(xref)!;
    if (op.xref !== op.root) {
      const rootParams = params.get(op.root) || new I18nPlaceholderParams();
      rootParams.merge(opParams);
    }
  }
}
