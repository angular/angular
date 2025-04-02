/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SecurityContext} from '../../../../core';
import * as o from '../../../../output/output_ast';
import {Identifiers} from '../../../../render3/r3_identifiers';
import {isIframeSecuritySensitiveAttr} from '../../../../schema/dom_security_schema';
import * as ir from '../../ir';
import {CompilationJob, CompilationJobKind} from '../compilation';
import {createOpXrefMap} from '../util/elements';

/**
 * Map of security contexts to their sanitizer function.
 */
const sanitizerFns = new Map<SecurityContext, o.ExternalReference>([
  [SecurityContext.HTML, Identifiers.sanitizeHtml],
  [SecurityContext.RESOURCE_URL, Identifiers.sanitizeResourceUrl],
  [SecurityContext.SCRIPT, Identifiers.sanitizeScript],
  [SecurityContext.STYLE, Identifiers.sanitizeStyle],
  [SecurityContext.URL, Identifiers.sanitizeUrl],
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
export function resolveSanitizers(job: CompilationJob): void {
  for (const unit of job.units) {
    const elements = createOpXrefMap(unit);

    // For normal element bindings we create trusted values for security sensitive constant
    // attributes. However, for host bindings we skip this step (this matches what
    // TemplateDefinitionBuilder does).
    // TODO: Is the TDB behavior correct here?
    if (job.kind !== CompilationJobKind.Host) {
      for (const op of unit.create) {
        if (op.kind === ir.OpKind.ExtractedAttribute) {
          const trustedValueFn =
            trustedValueFns.get(getOnlySecurityContext(op.securityContext)) ?? null;
          op.trustedValueFn = trustedValueFn !== null ? o.importExpr(trustedValueFn) : null;
        }
      }
    }

    for (const op of unit.update) {
      switch (op.kind) {
        case ir.OpKind.Property:
        case ir.OpKind.Attribute:
        case ir.OpKind.DomProperty:
          let sanitizerFn: o.ExternalReference | null = null;
          if (
            Array.isArray(op.securityContext) &&
            op.securityContext.length === 2 &&
            op.securityContext.indexOf(SecurityContext.URL) > -1 &&
            op.securityContext.indexOf(SecurityContext.RESOURCE_URL) > -1
          ) {
            // When the host element isn't known, some URL attributes (such as "src" and "href") may
            // be part of multiple different security contexts. In this case we use special
            // sanitization function and select the actual sanitizer at runtime based on a tag name
            // that is provided while invoking sanitization function.
            sanitizerFn = Identifiers.sanitizeUrlOrResourceUrl;
          } else {
            sanitizerFn = sanitizerFns.get(getOnlySecurityContext(op.securityContext)) ?? null;
          }
          op.sanitizer = sanitizerFn !== null ? o.importExpr(sanitizerFn) : null;

          // If there was no sanitization function found based on the security context of an
          // attribute/property, check whether this attribute/property is one of the
          // security-sensitive <iframe> attributes (and that the current element is actually an
          // <iframe>).
          if (op.sanitizer === null) {
            let isIframe = false;
            if (job.kind === CompilationJobKind.Host || op.kind === ir.OpKind.DomProperty) {
              // Note: for host bindings defined on a directive, we do not try to find all
              // possible places where it can be matched, so we can not determine whether
              // the host element is an <iframe>. In this case, we just assume it is and append a
              // validation function, which is invoked at runtime and would have access to the
              // underlying DOM element to check if it's an <iframe> and if so - run extra checks.
              isIframe = true;
            } else {
              // For a normal binding we can just check if the element its on is an iframe.
              const ownerOp = elements.get(op.target);
              if (ownerOp === undefined || !ir.isElementOrContainerOp(ownerOp)) {
                throw Error('Property should have an element-like owner');
              }
              isIframe = isIframeElement(ownerOp);
            }
            if (isIframe && isIframeSecuritySensitiveAttr(op.name)) {
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

/**
 * Asserts that there is only a single security context and returns it.
 */
function getOnlySecurityContext(
  securityContext: SecurityContext | SecurityContext[],
): SecurityContext {
  if (Array.isArray(securityContext)) {
    if (securityContext.length > 1) {
      // TODO: What should we do here? TDB just took the first one, but this feels like something we
      // would want to know about and create a special case for like we did for Url/ResourceUrl. My
      // guess is that, outside of the Url/ResourceUrl case, this never actually happens. If there
      // do turn out to be other cases, throwing an error until we can address it feels safer.
      throw Error(`AssertionError: Ambiguous security context`);
    }
    return securityContext[0] || SecurityContext.NONE;
  }
  return securityContext;
}
