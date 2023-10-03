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

type CreateOpWithSlot = ir.CreateOp&ir.ConsumesSlotOpTrait;

/**
 * The kind of element tag.
 */
enum TagKind {
  /**
   * A starting tag.
   */
  START,

  /**
   * A closing tag.
   */
  CLOSE
}

/**
 * The escape sequence used indicate message param values.
 */
const ESCAPE = '\uFFFD';

/**
 * Marker used to signify an element tag.
 */
const ELEMENT_MARKER = '#';

/**
 * Marker used to signify a template tag.
 */
const TEMPLATE_MARKER = '*';

/**
 * Marker used to signify parent context.
 */
const CONTEXT_MARKER = ':';

/**
 * Delimiter used to separate multiple values.
 */
const DELIMITER = '|';

/**
 * Resolve the placeholders in i18n messages.
 */
export function phaseResolveI18nPlaceholders(job: ComponentCompilationJob) {
  for (const unit of job.units) {
    const i18nOps = new Map<ir.XrefId, ir.I18nOp|ir.I18nStartOp>();
    let elementStartPlaceholders = new Map<string, (ir.ElementOp | ir.ElementStartOp)[]>();
    let elementClosePlaceholders = new Map<string, (ir.ElementOp | ir.ElementStartOp)[]>();
    let templateStartPlaceholders = new Map<string, ir.TemplateOp[]>();
    let templateClosePlaceholders = new Map<string, ir.TemplateOp[]>();
    let firstI18nOp: ir.I18nOp|ir.I18nStartOp|null = null;
    let currentI18nOp: ir.I18nStartOp|null = null;

    // Record slots for tag name placeholders.
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
        case ir.OpKind.I18n:
          // Initialize collected slots for a new i18n block.
          i18nOps.set(op.xref, op);
          if (firstI18nOp === null) {
            firstI18nOp = op;
          }
          currentI18nOp = op.kind === ir.OpKind.I18nStart ? op : null;
          elementStartPlaceholders = new Map();
          elementClosePlaceholders = new Map();
          templateStartPlaceholders = new Map();
          templateClosePlaceholders = new Map();
          break;
        case ir.OpKind.I18nEnd:
          // Add values for tag placeholders.
          if (currentI18nOp === null) {
            throw Error('Missing corresponding i18n start op for i18n end op');
          }
          saveTagParams(
              job, currentI18nOp, elementStartPlaceholders, TagKind.START, ELEMENT_MARKER);
          saveTagParams(
              job, currentI18nOp, elementClosePlaceholders, TagKind.CLOSE, ELEMENT_MARKER);
          saveTagParams(
              job, currentI18nOp, templateStartPlaceholders, TagKind.START, TEMPLATE_MARKER);
          saveTagParams(
              job, currentI18nOp, templateClosePlaceholders, TagKind.CLOSE, TEMPLATE_MARKER);
          currentI18nOp = null;
          break;
        case ir.OpKind.Element:
        case ir.OpKind.ElementStart:
        case ir.OpKind.Template:
          // Record ops for tag placeholders.
          if (op.i18nPlaceholder !== undefined) {
            if (currentI18nOp === null) {
              throw Error('i18n tag placeholder should only occur inside an i18n block');
            }
            const {startName, closeName} = op.i18nPlaceholder;
            const isTmpl = op.kind === ir.OpKind.Template;
            addPlaceholderOp(
                isTmpl ? templateStartPlaceholders : elementStartPlaceholders, startName, op);
            addPlaceholderOp(
                isTmpl ? templateClosePlaceholders : elementClosePlaceholders, closeName, op);
          }
          break;
      }
    }

    // Fill in values for each of the expression placeholders applied in i18nApply operations.
    const i18nBlockPlaceholderIndices = new Map<ir.XrefId, number>();
    for (const op of unit.update) {
      if (op.kind === ir.OpKind.I18nExpression) {
        const i18nOp = i18nOps.get(op.owner);
        let index = i18nBlockPlaceholderIndices.get(op.owner) || 0;
        if (!i18nOp) {
          throw Error('Cannot find corresponding i18nStart for i18nExpr');
        }
        i18nOp.params.set(
            op.i18nPlaceholder.name, o.literal(serializeValue(index++, i18nOp.subTemplateIndex)));
        i18nBlockPlaceholderIndices.set(op.target, index);
      }
    }
  }
}

/**
 * Saves values for the given tag name placeholders to the given i18n operation's params map.
 */
function saveTagParams(
    job: ComponentCompilationJob, i18nOp: ir.I18nStartOp,
    placeholderOps: Map<string, CreateOpWithSlot[]>, tagKind: TagKind, marker: string) {
  for (const [placeholder, ops] of placeholderOps) {
    i18nOp.params.set(placeholder, o.literal(serializeSlots(job, i18nOp, ops, tagKind, marker)));
  }
}

/**
 * Updates the given slots map with the specified slot.
 */
function addPlaceholderOp<Op extends ir.Op<any>>(
    tagSlots: Map<string, Op[]>, placeholder: string, slot: Op) {
  const slots = tagSlots.get(placeholder) || [];
  slots.push(slot);
  tagSlots.set(placeholder, slots);
}

/**
 * Serializes a list of slots to an i18n placeholder value string.
 */
function serializeSlots(
    job: ComponentCompilationJob, i18nOp: ir.I18nStartOp, ops: CreateOpWithSlot[], tagKind: TagKind,
    tagMarker: string): string {
  const tagKindMarker = tagKind === TagKind.START ? '' : '/';
  const slotStrings = ops.map(
      op => serializeValue(
          `${tagKindMarker}${tagMarker}${op.slot}`, getSubTemplateIndexForTag(job, i18nOp, op)));
  return slotStrings.length === 1 ? slotStrings[0] : `[${slotStrings.join(DELIMITER)}]`;
}

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

/**
 * Serializes a value to to an i18n placeholder value string.
 */
function serializeValue(value: number|string, context: number|null) {
  const contextStr = context === null ? '' : `${CONTEXT_MARKER}${context}`;
  return `${ESCAPE}${value}${contextStr}${ESCAPE}`
}
