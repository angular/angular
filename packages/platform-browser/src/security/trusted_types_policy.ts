/// <reference types="trusted-types" />
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, InjectionToken} from '@angular/core';

/**
 * The name of the Trusted Type policy to create.
 * @publicApi
 */
export const TRUSTED_TYPE_POLICY_NAME = new InjectionToken<string>('trusted-type-policy-name');

/**
 * Trusted Type Policy Adapter.
 *
 * @publicApi
 */
export abstract class TrustedTypePolicyAdapter {
  supportsTrustedTypes(): boolean { return false; };
  abstract maybeCreateTrustedURL(value: string): string;
  abstract maybeCreateTrustedHTML(value: string): string;
  abstract maybeCreateTrustedScript(value: string): string;
  abstract maybeCreateTrustedScriptURL(value: string): string;
  abstract isHTML(obj: any): boolean;
  abstract isURL(obj: any): boolean;
  abstract isScriptURL(obj: any): boolean;
  abstract isScript(obj: any): boolean;
}

@Injectable()
export class TrustedTypePolicyAdapterImpl extends TrustedTypePolicyAdapter {
  private _policy: TrustedTypePolicy|undefined;
  constructor(@Inject(TRUSTED_TYPE_POLICY_NAME) private _name: string) {
    super();
    if (typeof TrustedTypes !== 'undefined' && Boolean(TrustedTypes.createPolicy)) {
      this._policy = TrustedTypes.createPolicy(
          this._name, {
            createURL: (s: string) => s,
            createScriptURL: (s: string) => s,
            createScript: (s: string) => s,
            createHTML: (s: string) => s
          },
          false);
    }
  }

  supportsTrustedTypes(): boolean { return Boolean(this._policy); }

  isHTML(obj: any): boolean {
    return this._policy ? obj instanceof TrustedHTML && (TrustedTypes as any).isHTML(obj) : false;
  }

  isScript(obj: any): boolean {
    return this._policy ? obj instanceof TrustedScript && (TrustedTypes as any).isScript(obj) :
                          false;
  }

  isURL(obj: any): boolean {
    return this._policy ? obj instanceof TrustedURL && (TrustedTypes as any).isURL(obj) : false;
  }

  isScriptURL(obj: any): boolean {
    return this._policy ?
        obj instanceof TrustedScriptURL && (TrustedTypes as any).isScriptURL(obj) :
        false;
  }

  maybeCreateTrustedHTML(s: string): string {
    return this._policy ? this._policy.createHTML(s) as unknown as string : s;
  }
  maybeCreateTrustedURL(s: string): string {
    return this._policy ? this._policy.createURL(s) as unknown as string : s;
  }
  maybeCreateTrustedScriptURL(s: string): string {
    return this._policy ? this._policy.createScriptURL(s) as unknown as string : s;
  }
  maybeCreateTrustedScript(s: string): string {
    return this._policy ? this._policy.createScript(s) as unknown as string : s;
  }
}
