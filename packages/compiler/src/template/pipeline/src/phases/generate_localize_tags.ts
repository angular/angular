/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

export function generateLocalizeTags(job: CompilationJob): void {
  for (const unit of job.units) {
    for (const op of unit.update) {
      ir.transformExpressionsInOp(
        op,
        (expr) => {
          // TODO: Do I need this? (pure literal structures has it)
          // if (flags & ir.VisitorContextFlag.InChildOperation) {
          //   return expr;
          // }

          if (
            expr instanceof o.TaggedTemplateLiteralExpr &&
            expr.tag instanceof ir.LexicalReadExpr &&
            expr.tag.name === '$localize'
          ) {
            // TODO: do we need pure function? $localize looks like it might not be pure.
            return new o.TaggedTemplateLiteralExpr(
              o.variable(expr.tag.name, undefined, expr.tag.sourceSpan),
              expr.template,
            );
          }

          return expr;
        },
        ir.VisitorContextFlag.None,
      );
    }
  }
}
