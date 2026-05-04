/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SecurityContext} from '../../../../core';
import * as o from '../../../../output/output_ast';
import * as ir from '../../ir';
import type {ComponentCompilationJob} from '../compilation';

/**
 * Inserts the data-sourcecode-loc attribute onto elements in templates.
 *
 * This is similar to the ./attach_source_locations phase, but this phase
 * attaches more precise source locations, and it emits them directly into
 * the HTML in a data attribute.
 *
 * This protocol is more useful for framework-agnostic tooling.
 */
export function attachSourcecodeLoc(job: ComponentCompilationJob): void {
  if (!job.enableDebugLocations || job.relativeTemplatePath === null) {
    return;
  }

  const fileName = job.relativeTemplatePath;
  for (const unit of job.units) {
    for (const op of unit.create) {
      if (op.kind === ir.OpKind.ElementStart || op.kind === ir.OpKind.Element) {
        const startLine = op.wholeSourceSpan.start.line + 1;
        const startCol = op.wholeSourceSpan.start.col + 1;
        const endLine = op.wholeSourceSpan.end.line + 1;
        const endCol = op.wholeSourceSpan.end.col + 1;

        const locString = `${fileName};l=${startLine}-${endLine};c=${startCol}-${endCol}`;

        const extractedAttributeOp = ir.createExtractedAttributeOp(
          op.xref,
          ir.BindingKind.Attribute,
          null,
          'data-sourcecode-loc',
          o.literal(locString),
          null,
          null,
          SecurityContext.NONE,
        );
        unit.create.push(extractedAttributeOp);
      }
    }
  }
}
