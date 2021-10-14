/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @fileoverview
 * A module to facilitate use of a Trusted Types policy internally within
 * Angular Material. It lazily constructs the Trusted Types policy, providing
 * helper utilities for promoting strings to Trusted Types. When Trusted Types
 * are not available, strings are used as a fallback.
 * @security All use of this module is security-sensitive and should go through
 * security review.
 */

export declare interface TrustedHTML {
  __brand__: 'TrustedHTML';
}

export declare interface TrustedTypePolicyFactory {
  createPolicy(
    policyName: string,
    policyOptions: {
      createHTML?: (input: string) => string;
    },
  ): TrustedTypePolicy;
}

export declare interface TrustedTypePolicy {
  createHTML(input: string): TrustedHTML;
}

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
    if (typeof window !== 'undefined') {
      const ttWindow = window as unknown as {trustedTypes?: TrustedTypePolicyFactory};
      if (ttWindow.trustedTypes !== undefined) {
        policy = ttWindow.trustedTypes.createPolicy('angular#components', {
          createHTML: (s: string) => s,
        });
      }
    }
  }
  return policy;
}

/**
 * Unsafely promote a string to a TrustedHTML, falling back to strings when
 * Trusted Types are not available.
 * @security This is a security-sensitive function; any use of this function
 * must go through security review. In particular, it must be assured that the
 * provided string will never cause an XSS vulnerability if used in a context
 * that will be interpreted as HTML by a browser, e.g. when assigning to
 * element.innerHTML.
 */
export function trustedHTMLFromString(html: string): TrustedHTML {
  return getPolicy()?.createHTML(html) || (html as unknown as TrustedHTML);
}
