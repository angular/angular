/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="trusted-types" />

import {Inject, Injectable, InjectionToken, Optional} from '../di';

/**
 * The name of the Trusted Type policy to create.
 * @publicApi
 */
export const DOM_SANITIZATION_POLICY_NAME =
    new InjectionToken<string>('DOM_SANITIZATION_POLICY_NAME_TOKEN');

/**
 * Adapter for the Trusted Type Policy.
 * @see https://wicg.github.io/trusted-types/
 *
 * @publicApi
 */
export abstract class TrustedTypePolicyAdapter {
  supportsTrustedTypes(): boolean { return false; }
  abstract maybeCreateTrustedHTML(value: string): string;
  abstract maybeCreateTrustedScript(value: string): string;
  abstract maybeCreateTrustedScriptURL(value: string): string;
  abstract dangerouslyCreateTrustedValueForAttribute(
      el: any, name: string, value: string, namespace?: string): string;
  abstract isHTML(obj: any): boolean;
  abstract isScriptURL(obj: any): boolean;
  abstract isScript(obj: any): boolean;
}

/**
 * Adapter implementation for the Trusted Type Policy.
 * @see https://wicg.github.io/trusted-types/
 *
 * @publicApi
 */
@Injectable()
export class TrustedTypePolicyAdapterImpl extends TrustedTypePolicyAdapter {
  // TODO: update TS type after https://github.com/WICG/trusted-types/pull/204 is merged and types
  // are updated
  private policy: Omit<TrustedTypePolicy, 'createURL'>|undefined;
  constructor(@Optional() @Inject(DOM_SANITIZATION_POLICY_NAME) private policyName: string|
              undefined) {
    super();
    if (typeof TrustedTypes !== 'undefined' && TrustedTypes.createPolicy) {
      this.policy = TrustedTypes.createPolicy(this.policyName || 'angular-sanitization', {
        createScriptURL: (s: string) => s,
        createScript: (s: string) => s,
        createHTML: (s: string) => s
      });
    }
  }

  supportsTrustedTypes(): boolean { return Boolean(this.policy); }

  isHTML(obj: any): boolean { return this.policy ? TrustedTypes.isHTML(obj) : false; }

  isScript(obj: any): boolean { return this.policy ? TrustedTypes.isScript(obj) : false; }

  isScriptURL(obj: any): boolean { return this.policy ? TrustedTypes.isScriptURL(obj) : false; }

  maybeCreateTrustedHTML(s: string): string {
    // TS doesn't support trusted types yet (https://github.com/microsoft/TypeScript/issues/30024).
    return this.policy ? this.policy.createHTML(s) as unknown as string : s;
  }

  maybeCreateTrustedScriptURL(s: string): string {
    // TS doesn't support trusted types yet (https://github.com/microsoft/TypeScript/issues/30024).
    return this.policy ? this.policy.createScriptURL(s) as unknown as string : s;
  }

  maybeCreateTrustedScript(s: string): string {
    // TS doesn't support trusted types yet (https://github.com/microsoft/TypeScript/issues/30024).
    return this.policy ? this.policy.createScript(s) as unknown as string : s;
  }

  dangerouslyCreateTrustedValueForAttribute(
      el: Element, name: string, value: string, namespace?: string): string {
    if (!this.policy || !(el instanceof Element)) {
      return value;
    }
    const type =
        (TrustedTypes as any).getAttributeType(el.tagName.toLocaleLowerCase(), name, namespace);
    if (type === 'TrustedHTML') {
      return this.maybeCreateTrustedHTML(value);
    } else if (type === 'TrustedScriptURL') {
      return this.maybeCreateTrustedScriptURL(value);
    } else if (type === 'TrustedScript') {
      return this.maybeCreateTrustedScript(value);
    }
    return value;
  }
}
