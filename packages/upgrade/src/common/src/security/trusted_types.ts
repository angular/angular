/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview
 * A module to facilitate use of a Trusted Types policy internally within
 * the upgrade package. It lazily constructs the Trusted Types policy, providing
 * helper utilities for promoting strings to Trusted Types. When Trusted Types
 * are not available, strings are used as a fallback.
 * @security All use of this module is security-sensitive and should go through
 * security review.
 */

import {TrustedHTML, TrustedTypePolicy, TrustedTypePolicyFactory} from './trusted_types_defs';

/**
 * The Trusted Types policy, or null if Trusted Types are not
 * enabled/supported, or undefined if the policy has not been created yet.
 */
let policy: TrustedTypePolicy | null | undefined;

/**
 * Returns the Trusted Types policy, or null if Trusted Types are not
 * enabled/supported. The first call to this function will create the policy.
 */
function getPolicy(): TrustedTypePolicy | null {
  if (policy === undefined) {
    policy = null;
    const windowWithTrustedTypes = window as unknown as {trustedTypes?: TrustedTypePolicyFactory};
    if (windowWithTrustedTypes.trustedTypes) {
      try {
        policy = windowWithTrustedTypes.trustedTypes.createPolicy('angular#unsafe-upgrade', {
          createHTML: (s: string) => s,
        });
      } catch {
        // trustedTypes.createPolicy throws if called with a name that is
        // already registered, even in report-only mode. Until the API changes,
        // catch the error not to break the applications functionally. In such
        // cases, the code will fall back to using strings.
      }
    }
  }
  return policy;
}

/**
 * Unsafely promote a legacy AngularJS template to a TrustedHTML, falling back
 * to strings when Trusted Types are not available.
 * @security This is a security-sensitive function; any use of this function
 * must go through security review. In particular, the template string should
 * always be under full control of the application author, as untrusted input
 * can cause an XSS vulnerability.
 */
export function trustedHTMLFromLegacyTemplate(html: string): TrustedHTML | string {
  return getPolicy()?.createHTML(html) || html;
}
