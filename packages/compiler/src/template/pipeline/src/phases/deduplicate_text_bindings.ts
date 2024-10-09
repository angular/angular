/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as ir from '../../ir';
import type {CompilationJob} from '../compilation';

/**
 * Deduplicate text bindings, e.g. <div class="cls1" class="cls2">
 */
export function deduplicateTextBindings(job: CompilationJob): void {
  const seen = new Map<ir.XrefId, Set<string>>();
  for (const unit of job.units) {
    for (const op of unit.update.reversed()) {
      if (op.kind === ir.OpKind.Binding && op.isTextAttribute) {
        const seenForElement = seen.get(op.target) || new Set();
        if (seenForElement.has(op.name)) {
          if (job.compatibility === ir.CompatibilityMode.TemplateDefinitionBuilder) {
            // For most duplicated attributes, TemplateDefinitionBuilder lists all of the values in
            // the consts array. However, for style and class attributes it only keeps the last one.
            // We replicate that behavior here since it has actual consequences for apps with
            // duplicate class or style attrs.
            if (op.name === 'style' || op.name === 'class') {
              ir.OpList.remove<ir.UpdateOp>(op);
            }
          } else {
            // TODO: Determine the correct behavior. It would probably make sense to merge multiple
            // style and class attributes. Alternatively we could just throw an error, as HTML
            // doesn't permit duplicate attributes.
          }
        }
        seenForElement.add(op.name);
        seen.set(op.target, seenForElement);
      }
    }
  }
}
