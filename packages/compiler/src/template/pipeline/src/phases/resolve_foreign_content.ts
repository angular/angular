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

/**
 * Resolves `ContentOp`s by replacing them with a `TemplateOp` and adding a corresponding
 * property to the target `ForeignComponentOp`.
 */
export function resolveForeignContent(job: CompilationJob): void {
  for (const unit of job.units) {
    // Collect all foreign components in this unit
    const foreignComponents = new Map<ir.XrefId, ir.ForeignComponentOp>();
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.ForeignComponent) {
        foreignComponents.set(op.xref, op);
      }
    }

    for (const op of unit.create) {
      if (op.kind !== ir.OpKind.Content) {
        continue;
      }

      const target = foreignComponents.get(op.target);
      if (target === undefined) {
        throw new Error(`AssertionError: ContentOp target not found`);
      }

      const templateName = op.propertyName.charAt(0).toUpperCase() + op.propertyName.slice(1);
      const templateOp = ir.createTemplateOp(
        op.view,
        ir.TemplateKind.NgTemplate,
        null, // tagName
        templateName,
        ir.Namespace.HTML,
        undefined,
        op.startSourceSpan,
        op.sourceSpan,
      );

      ir.OpList.replace<ir.CreateOp>(op, templateOp);

      const foreignContent = new ir.ForeignContentExpr(templateOp.xref, templateOp.handle);
      target.props.set(op.propertyName, foreignContent);
    }
  }
}
