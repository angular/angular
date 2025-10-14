/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * isTrustedTypesSink returns true if the given property on the given DOM tag is a Trusted Types
 * sink. In that case, use `ElementSchemaRegistry.securityContext` to determine which particular
 * Trusted Type is required for values passed to the sink:
 * - SecurityContext.HTML corresponds to TrustedHTML
 * - SecurityContext.RESOURCE_URL corresponds to TrustedScriptURL
 */
export declare function isTrustedTypesSink(tagName: string, propName: string): boolean;
