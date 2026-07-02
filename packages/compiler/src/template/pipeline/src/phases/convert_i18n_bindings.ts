/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import {CompilationJob} from '../compilation';

/**
 * Some binding instructions in the update block may actually correspond to i18n bindings. In that
 * case, they should be replaced with i18nExp instructions for the dynamic portions.
 */
export function convertI18nBindings(job: CompilationJob): void {
  const i18nAttributesByElem: Map<ir.XrefId, ir.I18nAttributesOp> = new Map();
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.I18nAttributes) {
        i18nAttributesByElem.set(op.target, op);
      }
    }

    for (const op of unit.update) {
      switch (op.kind) {
        case ir.OpKind.Property:
        case ir.OpKind.Attribute:
          if (op.i18nContext === null) {
            continue;
          }

          if (!(op.expression instanceof ir.Interpolation)) {
            continue;
          }

          const i18nAttributesForElem = i18nAttributesByElem.get(op.target);
          if (i18nAttributesForElem === undefined) {
            throw new Error(
              'AssertionError: An i18n attribute binding instruction requires the owning element to have an I18nAttributes create instruction',
            );
          }

          if (i18nAttributesForElem.target !== op.target) {
            throw new Error(
              'AssertionError: Expected i18nAttributes target element to match binding target element',
            );
          }

          const ops: ir.UpdateOp[] = [];
          for (let i = 0; i < op.expression.expressions.length; i++) {
            const expr = op.expression.expressions[i];

            if (op.expression.i18nPlaceholders.length !== op.expression.expressions.length) {
              throw new Error(
                `AssertionError: An i18n attribute binding instruction requires the same number of expressions and placeholders, but found ${op.expression.i18nPlaceholders.length} placeholders and ${op.expression.expressions.length} expressions`,
              );
            }

            ops.push(
              ir.createI18nExpressionOp(
                op.i18nContext,
                i18nAttributesForElem.target,
                i18nAttributesForElem.xref,
                i18nAttributesForElem.handle,
                expr,
                null,
                op.expression.i18nPlaceholders[i],
                ir.I18nParamResolutionTime.Creation,
                ir.I18nExpressionFor.I18nAttribute,
                op.name,
                op.sourceSpan,
              ),
            );
          }
          ir.OpList.replaceWithMany(op as ir.UpdateOp, ops);
          break;
      }
    }
  }
}
