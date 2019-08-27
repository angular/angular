/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TrustedTypePolicyAdapter} from '@angular/core';

export class MockTrustedTypePolicyAdapter extends TrustedTypePolicyAdapter {
  maybeCreateTrustedHTML(value: string): string { return value; }
  maybeCreateTrustedScript(value: string): string { return value; }
  maybeCreateTrustedScriptURL(value: string): string {
    return 'modified-by-policy-adapter:' + value;
  }
  dangerouslyCreateTrustedValueForAttribute(
      el: any, name: string, value: string, namespace?: string|undefined): string {
    return value;
  }
  isHTML(obj: any): boolean { return false; }
  isScriptURL(obj: any): boolean { return false; }
  isScript(obj: any): boolean { return false; }
}
