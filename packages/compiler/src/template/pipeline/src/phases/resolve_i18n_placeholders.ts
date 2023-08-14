/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18n from '../../../../i18n/i18n_ast';
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
  i18nOp: ir.I18nStartOp;

  placeholder: string;

  value: o.Expression;
}

/**
 * Resolve the placeholders in i18n messages.
 */
export function phaseResolveI18nPlaceholders(job: CompilationJob) {
  for (const unit of job.units) {
    let i18nOp: ir.I18nStartOp|null = null;
    let startTags: PlaceholderValue[] = [];
    let closeTags: PlaceholderValue[] = [];
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.I18nStart && op.i18n instanceof i18n.Message) {
        i18nOp = op;
      } else if (op.kind === ir.OpKind.I18nEnd) {
        i18nOp = null;
      } else if (
          (op.kind === ir.OpKind.Element || op.kind === ir.OpKind.ElementStart) &&
          op.i18n instanceof i18n.TagPlaceholder) {
        if (i18nOp === null) {
          throw Error('i18n tag placeholder should only occur inside an i18n block');
        }
        // In order to add the keys in the same order as TemplateDefinitionBuilder, we separately
        // track the start and close tag placeholders.
        // TODO: when TemplateDefinitionBuilder compatibility is not required, we can just add both
        //  keys directly to the map here.
        startTags.push({
          i18nOp,
          placeholder: op.i18n.startName,
          value: o.literal(`${ESCAPE}#${op.slot}${ESCAPE}`)
        });
        closeTags.push({
          i18nOp,
          placeholder: op.i18n.closeName,
          value: o.literal(`${ESCAPE}/#${op.slot}${ESCAPE}`)
        });
      }
    }
    // Add the start tags in the order we encountered them, to match TemplateDefinitionBuilder.
    for (const {i18nOp, placeholder, value} of startTags) {
      i18nOp.tagNameParams[placeholder] = value;
    }
    // Add the close tags in reverse order that we encountered the start tags, to match
    // TemplateDefinitionBuilder.
    for (let i = closeTags.length - 1; i >= 0; i--) {
      const {i18nOp, placeholder, value} = closeTags[i];
      i18nOp.tagNameParams[placeholder] = value;
    }
  }
}
