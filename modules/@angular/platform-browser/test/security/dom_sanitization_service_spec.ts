/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SecurityContext} from '@angular/core';
import * as t from '@angular/core/testing/testing_internal';

import {DomSanitizerImpl} from '../../src/security/dom_sanitization_service';

export function main() {
  t.describe('DOM Sanitization Service', () => {
    t.it('accepts resource URL values for resource contexts', () => {
      const svc = new DomSanitizerImpl();
      const resourceUrl = svc.bypassSecurityTrustResourceUrl('http://hello/world');
      t.expect(svc.sanitize(SecurityContext.URL, resourceUrl)).toBe('http://hello/world');
    });
  });
}
