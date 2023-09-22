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
 * Represents a placeholder value mapping on an I18nStartOp.
 */
interface PlaceholderValue {
  op: ir.I18nStartOp;

  placeholder: string;

  value: o.Expression;
}

/**
 * Resolve the placeholders in i18n messages.
 */
export function phaseResolveI18nPlaceholders(job: CompilationJob) {
  for (const unit of job.units) {
    const i18nOps = new Map<ir.XrefId, ir.I18nOp|ir.I18nStartOp>();
    let currentOp: ir.I18nStartOp|null = null;
    let startTags: PlaceholderValue[] = [];
    let closeTags: PlaceholderValue[] = [];

    // Fill in values for tag name placeholders.
    for (const op of unit.create) {
      switch (op.kind) {
        case ir.OpKind.I18nStart:
          i18nOps.set(op.xref, op);
          currentOp = op;
          break;
        case ir.OpKind.I18n:
          i18nOps.set(op.xref, op);
          break;
        case ir.OpKind.I18nEnd:
          currentOp = null;
          break;
        case ir.OpKind.Element:
        case ir.OpKind.ElementStart:
          if (op.i18nPlaceholder != undefined) {
            if (currentOp === null) {
              throw Error('i18n tag placeholder should only occur inside an i18n block');
            }
            // In order to add the keys in the same order as TemplateDefinitionBuilder, we
            // separately track the start and close tag placeholders.
            // TODO: when TemplateDefinitionBuilder compatibility is not required, we can just add
            // both keys directly to the map here.
            startTags.push({
              op: currentOp,
              placeholder: op.i18nPlaceholder.startName,
              value: o.literal(`${ESCAPE}#${op.slot}${ESCAPE}`)
            });
            closeTags.push({
              op: currentOp,
              placeholder: op.i18nPlaceholder.closeName,
              value: o.literal(`${ESCAPE}/#${op.slot}${ESCAPE}`)
            });
          }
          break;
      }
    }

    // Add the start tags in the order we encountered them, to match TemplateDefinitionBuilder.
    for (const {op, placeholder, value} of startTags) {
      op.params[placeholder] = value;
    }
    // Add the close tags in reverse order that we encountered the start tags, to match
    // TemplateDefinitionBuilder.
    for (let i = closeTags.length - 1; i >= 0; i--) {
      const {op, placeholder, value} = closeTags[i];
      op.params[placeholder] = value;
    }

    // Fill in values for each of the expression placeholders applied in i18nApply operations.
    const i18nBlockPlaceholderIndices = new Map<ir.XrefId, number>();
    for (const op of unit.update) {
      if (op.kind === ir.OpKind.I18nApply) {
        for (const placeholder of op.i18nPlaceholders) {
          const i18nOp = i18nOps.get(op.target);
          let index = i18nBlockPlaceholderIndices.get(op.target) || 0;
          if (!i18nOp) {
            throw Error('Cannot find corresponding i18nStart for i18nApply');
          }
          i18nOp.params[placeholder.name] = o.literal(`${ESCAPE}${index++}${ESCAPE}`);
          i18nBlockPlaceholderIndices.set(op.target, index);
        }
      }
    }
  }
}
