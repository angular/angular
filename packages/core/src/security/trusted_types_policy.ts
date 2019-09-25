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
  private tt: TrustedTypePolicyFactory|undefined;

  constructor(@Optional() @Inject(DOM_SANITIZATION_POLICY_NAME) private policyName: string|
              undefined) {
    super();
    this.tt = window.trustedTypes || (window as any).TrustedTypes;
    if (this.tt && this.tt.createPolicy) {
      this.policy = this.tt.createPolicy(this.policyName || 'angular-sanitization', {
        createScriptURL: (s: string) => s,
        createScript: (s: string) => s,
        createHTML: (s: string) => s
      });
    }
  }

  supportsTrustedTypes(): boolean { return Boolean(this.policy); }

  isHTML(obj: any): boolean { return this.policy ? this.tt !.isHTML(obj) : false; }

  isScript(obj: any): boolean { return this.policy ? this.tt !.isScript(obj) : false; }

  isScriptURL(obj: any): boolean { return this.policy ? this.tt !.isScriptURL(obj) : false; }

  maybeCreateTrustedHTML(value: string): string {
    // TS doesn't support trusted types yet (https://github.com/microsoft/TypeScript/issues/30024).
    return this.policy ? this.policy.createHTML(value) as unknown as string : value;
  }

  maybeCreateTrustedScriptURL(value: string): string {
    // TS doesn't support trusted types yet (https://github.com/microsoft/TypeScript/issues/30024).
    return this.policy ? this.policy.createScriptURL(value) as unknown as string : value;
  }

  maybeCreateTrustedScript(value: string): string {
    // TS doesn't support trusted types yet (https://github.com/microsoft/TypeScript/issues/30024).
    return this.policy ? this.policy.createScript(value) as unknown as string : value;
  }

  dangerouslyCreateTrustedValueForAttribute(
      el: Element, name: string, value: string, namespace?: string): string {
    if (!this.policy || !(el instanceof Element)) {
      return value;
    }
    const type = this.tt !.getAttributeType(el.tagName.toLocaleLowerCase(), name, namespace);
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
