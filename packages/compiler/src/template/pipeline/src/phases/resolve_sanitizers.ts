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
import * as ir from '../../ir';
import {CompilationJob, CompilationJobKind} from '../compilation';

/**
 * Map of security contexts to their sanitizer function.
 */
const sanitizerFns = new Map<SecurityContext, o.ExternalReference>([
  [SecurityContext.HTML, Identifiers.sanitizeHtml],
  [SecurityContext.RESOURCE_URL, Identifiers.sanitizeResourceUrl],
  [SecurityContext.SCRIPT, Identifiers.sanitizeScript],
  [SecurityContext.STYLE, Identifiers.sanitizeStyle],
  [SecurityContext.URL, Identifiers.sanitizeUrl],
  [SecurityContext.ATTRIBUTE_NO_BINDING, Identifiers.validateAttribute],
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
            op.securityContext.includes(SecurityContext.URL) &&
            op.securityContext.includes(SecurityContext.RESOURCE_URL)
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

          break;
      }
    }
  }
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
