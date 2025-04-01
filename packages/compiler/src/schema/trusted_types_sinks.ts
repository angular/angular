/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Set of tagName|propertyName corresponding to Trusted Types sinks. Properties applying to all
 * tags use '*'.
 *
 * Extracted from, and should be kept in sync with
 * https://w3c.github.io/webappsec-trusted-types/dist/spec/#integrations
 */
const TRUSTED_TYPES_SINKS = new Set<string>([
  // NOTE: All strings in this set *must* be lowercase!

  // TrustedHTML
  'iframe|srcdoc',
  '*|innerhtml',
  '*|outerhtml',

  // NB: no TrustedScript here, as the corresponding tags are stripped by the compiler.

  // TrustedScriptURL
  'embed|src',
  'object|codebase',
  'object|data',
]);

/**
 * isTrustedTypesSink returns true if the given property on the given DOM tag is a Trusted Types
 * sink. In that case, use `ElementSchemaRegistry.securityContext` to determine which particular
 * Trusted Type is required for values passed to the sink:
 * - SecurityContext.HTML corresponds to TrustedHTML
 * - SecurityContext.RESOURCE_URL corresponds to TrustedScriptURL
 */
export function isTrustedTypesSink(tagName: string, propName: string): boolean {
  // Make sure comparisons are case insensitive, so that case differences between attribute and
  // property names do not have a security impact.
  tagName = tagName.toLowerCase();
  propName = propName.toLowerCase();

  return (
    TRUSTED_TYPES_SINKS.has(tagName + '|' + propName) || TRUSTED_TYPES_SINKS.has('*|' + propName)
  );
}
