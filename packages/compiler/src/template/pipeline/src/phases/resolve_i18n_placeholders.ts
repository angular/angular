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
 * Resolve the placeholders in i18n messages.
 */
export function phaseResolveI18nPlaceholders(job: CompilationJob) {
  for (const unit of job.units) {
    const i18nOps = new Map<ir.XrefId, ir.I18nOp|ir.I18nStartOp>();
    let startTagSlots = new Map<string, number[]>();
    let closeTagSlots = new Map<string, number[]>();
    let currentI18nOp: ir.I18nStartOp|null = null;

    // Record slots for tag name placeholders.
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
        case ir.OpKind.I18n:
          // Initialize collected slots for a new i18n block.
          i18nOps.set(op.xref, op);
          currentI18nOp = op.kind === ir.OpKind.I18nStart ? op : null;
          startTagSlots = new Map();
          closeTagSlots = new Map();
          break;
        case ir.OpKind.I18nEnd:
          // Add values for tag placeholders.
          if (currentI18nOp === null) {
            throw Error('Missing corresponding i18n start op for i18n end op');
          }
          for (const [placeholder, slots] of startTagSlots) {
            currentI18nOp.params.set(placeholder, serializeSlots(slots, true));
          }
          for (const [placeholder, slots] of closeTagSlots) {
            currentI18nOp.params.set(placeholder, serializeSlots(slots, false));
          }
          currentI18nOp = null;
          break;
        case ir.OpKind.Element:
        case ir.OpKind.ElementStart:
          // Record slots for tag placeholders.
          if (op.i18nPlaceholder != undefined) {
            if (currentI18nOp === null) {
              throw Error('i18n tag placeholder should only occur inside an i18n block');
            }
            if (!op.slot) {
              throw Error('Slots should be allocated before i18n placeholder resolution');
            }
            const {startName, closeName} = op.i18nPlaceholder;
            addTagSlot(startTagSlots, startName, op.slot);
            addTagSlot(closeTagSlots, closeName, op.slot);
          }
          break;
      }
    }

    // Fill in values for each of the expression placeholders applied in i18nApply operations.
    const i18nBlockPlaceholderIndices = new Map<ir.XrefId, number>();
    for (const op of unit.update) {
      if (op.kind === ir.OpKind.I18nExpression) {
        const i18nOp = i18nOps.get(op.target);
        let index = i18nBlockPlaceholderIndices.get(op.target) || 0;
        if (!i18nOp) {
          throw Error('Cannot find corresponding i18nStart for i18nExpr');
        }
        i18nOp.params.set(op.i18nPlaceholder.name, o.literal(`${ESCAPE}${index++}${ESCAPE}`));
        i18nBlockPlaceholderIndices.set(op.target, index);
      }
    }

    // Verify that all placeholders have been resolved.
    for (const op of i18nOps.values()) {
      for (const placeholder in op.message.placeholders) {
        if (!op.params.has(placeholder)) {
          throw Error(`Failed to resolve i18n placeholder: ${placeholder}`);
        }
      }
    }
  }
}

/**
 * Updates the given slots map with the specified slot.
 */
function addTagSlot(tagSlots: Map<string, number[]>, placeholder: string, slot: number) {
  const slots = tagSlots.get(placeholder) || [];
  slots.push(slot);
  tagSlots.set(placeholder, slots);
}

/**
 * Serializes a list of slots to a string literal expression.
 */
function serializeSlots(slots: number[], start: boolean): o.Expression {
  const slotStrings = slots.map(slot => `${ESCAPE}${start ? '' : '/'}#${slot}${ESCAPE}`);
  if (slotStrings.length === 1) {
    return o.literal(slotStrings[0]);
  }
  return o.literal(`[${slotStrings.join('|')}]`);
}
