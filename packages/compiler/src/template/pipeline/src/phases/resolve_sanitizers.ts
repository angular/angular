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
        case ir.OpKind.TwoWayProperty:
          let sanitizerFn: o.ExternalReference | null = null;
          if (isUrlOrResourceUrlSecurityContext(op.securityContext)) {
            // When the host element isn't known, attributes such as `href`, `src`, `data`,
            // `action`, and `codebase` may be part of multiple security contexts. In this case we
            // use a special sanitization function and select the actual behavior at runtime based
            // on the concrete host element.
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

function isUrlOrResourceUrlSecurityContext(
  securityContext: SecurityContext | SecurityContext[],
): boolean {
  if (!Array.isArray(securityContext)) {
    return false;
  }

  let hasUrlContext = false;
  let hasResourceUrlContext = false;
  let hasNoneContext = false;

  for (const context of securityContext) {
    switch (context) {
      case SecurityContext.URL:
        hasUrlContext = true;
        break;
      case SecurityContext.RESOURCE_URL:
        hasResourceUrlContext = true;
        break;
      case SecurityContext.NONE:
        hasNoneContext = true;
        break;
      default:
        return false;
    }
  }

  return (
    ((hasUrlContext || hasResourceUrlContext) && hasNoneContext) ||
    (hasUrlContext && hasResourceUrlContext)
  );
}

/**
 * Asserts that there is only a single non-NONE security context and returns it.
 */
function getOnlySecurityContext(
  securityContext: SecurityContext | SecurityContext[],
): SecurityContext {
  if (Array.isArray(securityContext)) {
    const nonNoneSecurityContexts = securityContext.filter(
      (context) => context !== SecurityContext.NONE,
    );
    if (nonNoneSecurityContexts.length > 1) {
      // TODO: What should we do here? TDB just took the first one, but this feels like something we
      // would want to know about and create a special case for like we did for Url/ResourceUrl. My
      // guess is that, outside of the Url/ResourceUrl case, this never actually happens. If there
      // do turn out to be other cases, throwing an error until we can address it feels safer.
      throw Error(`AssertionError: Ambiguous security context`);
    }
    return nonNoneSecurityContexts[0] || SecurityContext.NONE;
  }
  return securityContext;
}
