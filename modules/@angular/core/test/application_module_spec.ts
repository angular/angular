/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LOCALE_ID} from '@angular/core';
import {describe, expect, inject, it} from '../testing/testing_internal';

export function main() {
  describe('Application module', () => {
    it('should set the default locale to "en-US"',
       inject([LOCALE_ID], (defaultLocale: string) => { expect(defaultLocale).toEqual('en-US'); }));
  });
}