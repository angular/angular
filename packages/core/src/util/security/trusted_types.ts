/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {global} from '../global';

/**
 * A class to facilitate use of Trusted Types policies within Angular. Lazily
 * constructs a Trusted Types policy with the specified name, providing helper
 * utilities for promoting strings to Trusted Types. When Trusted Types are not
 * available, strings are used as a fallback.
 */
export class AngularTrustedTypesPolicy {
  /**
   * The wrapped Trusted Types policy, or null if Trusted Types are
   * not enabled/supported, or undefined if the policy has not been created yet.
   */
  private policy: TrustedTypePolicy|null|undefined;

  constructor(private policyName: string) {}

  /**
   * Returns the wrapped Trusted Types policy, or null if Trusted Types are not
   * enabled/supported. The first call to this function will create the policy.
   */
  private getPolicy(): TrustedTypePolicy|null {
    if (this.policy === undefined) {
      this.policy = null;
      if (global.trustedTypes) {
        try {
          this.policy =
              (global.trustedTypes as TrustedTypePolicyFactory).createPolicy(this.policyName, {
                createHTML: (s: string) => s,
                createScript: (s: string) => s,
                createScriptURL: (s: string) => s,
              });
        } catch {
          // trustedTypes.createPolicy throws if called with a name that is
          // already registered, even in report-only mode. Until the API changes,
          // catch the error not to break the applications functionally. In such
          // cases, the code will fall back to using strings.
          ngDevMode &&
              console.error(`Could not create Trusted Types policy ${
                  this.policyName}. Are two instances of Angular running on the same page?`);
        }
      }
    }
    return this.policy;
  }

  /**
   * Unsafely promote a string to a TrustedHTML, falling back to strings when
   * Trusted Types are not available. This is a security-sensitive function; any
   * use of this function must go through security review. In particular, it must
   * be assured that the provided string will never cause an XSS vulnerability if
   * used in a context that will be interpreted as HTML by a browser, e.g. when
   * assigning to element.innerHTML.
   */
  trustedHTMLFromStringRequiresSecurityReview(html: string): TrustedHTML|string {
    return this.getPolicy()?.createHTML(html) || html;
  }

  /**
   * Unsafely promote a string to a TrustedScript, falling back to strings when
   * Trusted Types are not available. This is a security-sensitive function; any
   * use of this function must go through security review. In particular, it must
   * be assured that the provided string will never cause an XSS vulnerability if
   * used in a context that will be interpreted and executed as a script by a
   * browser, e.g. when calling eval.
   */
  trustedScriptFromStringRequiresSecurityReview(script: string): TrustedScript|string {
    return this.getPolicy()?.createScript(script) || script;
  }

  /**
   * Unsafely promote a string to a TrustedScriptURL, falling back to strings
   * when Trusted Types are not available. This is a security-sensitive function;
   * any use of this function must go through security review. In particular, it
   * must be assured that the provided string will never cause an XSS
   * vulnerability if used in a context that will cause a browser to load and
   * execute a resource, e.g. when assigning to script.src.
   */
  trustedScriptURLFromStringRequiresSecurityReview(url: string): TrustedScriptURL|string {
    return this.getPolicy()?.createScriptURL(url) || url;
  }
}

/**
 * The Trusted Types policy used by Angular for all trusted conversions.
 */
export const trustedTypesPolicy = new AngularTrustedTypesPolicy('angular');

/**
 * The Trusted Types policy used by Angular for untrusted legacy conversions in
 * the sanitization pipeline, in particular for the bypassSecurityTrust
 * functions and custom sanitizers.
 */
export const trustedTypesPolicyForLegacyBypass =
    new AngularTrustedTypesPolicy('angular#unsafe-legacy-bypass');
