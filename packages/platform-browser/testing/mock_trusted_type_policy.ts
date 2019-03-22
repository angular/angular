/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TrustedTypePolicyAdapter} from '../src/security/trusted_types_policy';

export class MockTrustedTypePolicyAdapter extends TrustedTypePolicyAdapter {
  maybeCreateTrustedURL(value: string): string { throw new Error('Method not implemented.'); }
  maybeCreateTrustedHTML(value: string): string { throw new Error('Method not implemented.'); }
  maybeCreateTrustedScript(value: string): string { throw new Error('Method not implemented.'); }
  maybeCreateTrustedScriptURL(value: string): string {
    return 'modified-by-policy-adapter:' + value;
  }
  maybeCreateTrustedValueForAttribute(
      el: any, name: string, value: string, namespace?: string|undefined): string {
    throw new Error('Method not implemented.');
  }
  isHTML(obj: any): boolean { throw new Error('Method not implemented.'); }
  isURL(obj: any): boolean { throw new Error('Method not implemented.'); }
  isScriptURL(obj: any): boolean { throw new Error('Method not implemented.'); }
  isScript(obj: any): boolean { throw new Error('Method not implemented.'); }
}
