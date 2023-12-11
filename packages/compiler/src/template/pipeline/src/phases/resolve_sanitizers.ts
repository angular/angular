/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SecurityContext} from '../../../../core';
import * as o from '../../../../output/output_ast';
import {Identifiers} from '../../../../render3/r3_identifiers';
import {isIframeSecuritySensitiveAttr} from '../../../../schema/dom_security_schema';
import * as ir from '../../ir';
import {ComponentCompilationJob} from '../compilation';
import {createOpXrefMap} from '../util/elements';

/**
 * Map of security contexts to their sanitizer function.
 */
const sanitizerFns = new Map<SecurityContext, o.ExternalReference>([
  [SecurityContext.HTML, Identifiers.sanitizeHtml],
  [SecurityContext.RESOURCE_URL, Identifiers.sanitizeResourceUrl],
  [SecurityContext.SCRIPT, Identifiers.sanitizeScript],
  [SecurityContext.STYLE, Identifiers.sanitizeStyle], [SecurityContext.URL, Identifiers.sanitizeUrl]
]);

/**
 * Map of security contexts to their trusted value function.
 */
const trustedValueFns = new Map<SecurityContext, o.ExternalReference>([
  [SecurityContext.HTML, Identifiers.trustConstantHtml],
  [SecurityContext.RESOURCE_URL, Identifiers.trustConstantResourceUrl],
]);

/**
 * Resolves sanitization functions for ops that need them.
 */
export function resolveSanitizers(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    const elements = createOpXrefMap(unit);

    for (const op of unit.create) {
      if (op.kind === ir.OpKind.ExtractedAttribute) {
        const trustedValueFn = trustedValueFns.get(op.securityContext) ?? null;
        op.trustedValueFn = trustedValueFn !== null ? o.importExpr(trustedValueFn) : null;
      }
    }

    for (const op of unit.update) {
      switch (op.kind) {
        case ir.OpKind.Property:
        case ir.OpKind.Attribute:
          const sanitizerFn = sanitizerFns.get(op.securityContext) ?? null;
          op.sanitizer = sanitizerFn !== null ? o.importExpr(sanitizerFn) : null;
          // If there was no sanitization function found based on the security context of an
          // attribute/property, check whether this attribute/property is one of the
          // security-sensitive <iframe> attributes (and that the current element is actually an
          // <iframe>).
          if (op.sanitizer === null) {
            const ownerOp = elements.get(op.target);
            if (ownerOp === undefined || !ir.isElementOrContainerOp(ownerOp)) {
              throw Error('Property should have an element-like owner');
            }
            if (isIframeElement(ownerOp) && isIframeSecuritySensitiveAttr(op.name)) {
              op.sanitizer = o.importExpr(Identifiers.validateIframeAttribute);
            }
          }
          break;
      }
    }
  }
}

/**
 * Checks whether the given op represents an iframe element.
 */
function isIframeElement(op: ir.ElementOrContainerOps): boolean {
  return op.kind === ir.OpKind.ElementStart && op.tag?.toLowerCase() === 'iframe';
}
