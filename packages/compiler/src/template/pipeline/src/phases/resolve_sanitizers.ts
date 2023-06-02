/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SecurityContext} from '../../../../core';
import {isIframeSecuritySensitiveAttr} from '../../../../schema/dom_security_schema';
import * as ir from '../../ir';
import {ComponentCompilationJob} from '../compilation';
import {getElementsByXrefId} from '../util/elements';

/**
 * Mapping of security contexts to sanitizer function for that context.
 */
const sanitizers = new Map<SecurityContext, ir.SanitizerFn|null>([
  [SecurityContext.HTML, ir.SanitizerFn.Html], [SecurityContext.SCRIPT, ir.SanitizerFn.Script],
  [SecurityContext.STYLE, ir.SanitizerFn.Style], [SecurityContext.URL, ir.SanitizerFn.Url],
  [SecurityContext.RESOURCE_URL, ir.SanitizerFn.ResourceUrl]
]);

/**
 * Resolves sanitization functions for ops that need them.
 */
export function phaseResolveSanitizers(job: ComponentCompilationJob): void {
  for (const unit of job.units) {
    const elements = getElementsByXrefId(unit);
    for (const op of unit.ops()) {
      switch (op.kind) {
        case ir.OpKind.Property:
        case ir.OpKind.PropertyCreate:
        case ir.OpKind.Attribute:
          resolveSanitizer(op, elements);
          break;
      }
    }
  }
}

function resolveSanitizer(
    op: ir.PropertyOp|ir.PropertyCreateOp|ir.AttributeOp,
    elements: Map<ir.XrefId, ir.ElementOrContainerOps>): void {
  const sanitizerFn = sanitizers.get(op.securityContext) || null;
  op.sanitizer = sanitizerFn ? new ir.SanitizerExpr(sanitizerFn) : null;
  // If there was no sanitization function found based on the security context of an
  // attribute/property, check whether this attribute/property is one of the
  // security-sensitive <iframe> attributes (and that the current element is actually an
  // <iframe>).
  if (op.sanitizer === null) {
    const ownerOp = elements.get(op.target);
    if (ownerOp === undefined) {
      throw Error('Property should have an element-like owner');
    }
    if (isIframeElement(ownerOp) && isIframeSecuritySensitiveAttr(op.name)) {
      op.sanitizer = new ir.SanitizerExpr(ir.SanitizerFn.IframeAttribute);
    }
  }
}

/**
 * Checks whether the given op represents an iframe element.
 */
function isIframeElement(op: ir.ElementOrContainerOps): boolean {
  return (op.kind === ir.OpKind.Element || op.kind === ir.OpKind.ElementStart) &&
      op.tag.toLowerCase() === 'iframe';
}
