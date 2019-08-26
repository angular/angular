/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="trusted-types" />

import {Inject, Injectable, InjectionToken} from '../di';

/**
 * The name of the Trusted Type policy to create.
 * @publicApi
 */
export const DOM_SANITIZATION_POLICY_NAME = new InjectionToken<string>('DOM_SANITIZATION_POLICY_NAME_TOKEN');

/**
 * Adapter for the Trusted Type Policy. 
 * Used by the DomRenderer2 and the sanitizer only. 
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

@Injectable()
export class TrustedTypePolicyAdapterImpl extends TrustedTypePolicyAdapter {
  // TODO: update TS type after https://github.com/WICG/trusted-types/pull/204 is merged and types are updated
  private policy: Omit<TrustedTypePolicy, 'createURL'>|undefined;
  constructor(@Inject(DOM_SANITIZATION_POLICY_NAME) private policyName: string) {
    super();
    if (typeof TrustedTypes !== 'undefined' && TrustedTypes.createPolicy) {
      this.policy = TrustedTypes.createPolicy(this.policyName, {
        createScriptURL: (s: string) => s,
        createScript: (s: string) => s,
        createHTML: (s: string) => s
      });
    }
  }

  supportsTrustedTypes(): boolean { return Boolean(this.policy); }

  isHTML(obj: any): boolean {
    return this.policy ? TrustedTypes.isHTML(obj) : false;
  }

  isScript(obj: any): boolean {
    return this.policy ? TrustedTypes.isScript(obj) : false;
  }

  isScriptURL(obj: any): boolean {
    return this.policy ? TrustedTypes.isScriptURL(obj) : false;
  }

  maybeCreateTrustedHTML(s: string): string {
    // https://github.com/microsoft/TypeScript/issues/30024
    return this.policy ? this.policy.createHTML(s) as unknown as string : s;
  }

  maybeCreateTrustedScriptURL(s: string): string {
    // https://github.com/microsoft/TypeScript/issues/30024
    return this.policy ? this.policy.createScriptURL(s) as unknown as string : s;
  }

  maybeCreateTrustedScript(s: string): string {
    // https://github.com/microsoft/TypeScript/issues/30024
    return this.policy ? this.policy.createScript(s) as unknown as string : s;
  }

  dangerouslyCreateTrustedValueForAttribute(el: Element, name: string, value: string, namespace?: string):
      string {
    if (!this.policy || !(el instanceof Element)) {
      return value;
    }
    const type = (TrustedTypes as any).getAttributeType(el.tagName.toLocaleLowerCase(), name, namespace);
    let newValue;
    switch (type) {
      case 'TrustedHTML':
        newValue = this.maybeCreateTrustedHTML(value);
        break;
      case 'TrustedScriptURL':
        newValue = this.maybeCreateTrustedScriptURL(value);
        break;
      case 'TrustedScript':
        newValue = this.maybeCreateTrustedScript(value);
        break;
      default:
        newValue = value;
        break;
    }
    return newValue as string;
  }
}
