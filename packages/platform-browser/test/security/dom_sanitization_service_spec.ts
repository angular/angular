/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SecurityContext} from '@angular/core';
import * as t from '@angular/core/testing/src/testing_internal';
import {DomSanitizerImpl} from '@angular/platform-browser/src/security/dom_sanitization_service';
import {MockTrustedTypePolicyAdapter} from '@angular/platform-browser/testing/mock_trusted_type_policy';

{
  t.describe('DOM Sanitization Service', () => {
    t.it('accepts resource URL values for resource contexts', () => {
      const svc = new DomSanitizerImpl(null, new MockTrustedTypePolicyAdapter());
      const resourceUrl = svc.bypassSecurityTrustResourceUrl('http://hello/world');
      t.expect(svc.sanitize(SecurityContext.URL, resourceUrl)).toContain('http://hello/world');
    });
    t.it('routes resource URL values through trusted type policy adapter', () => {
      const svc = new DomSanitizerImpl(null, new MockTrustedTypePolicyAdapter());
      const resourceUrl = svc.bypassSecurityTrustResourceUrl('http://hello/world');
      t.expect(svc.sanitize(SecurityContext.URL, resourceUrl))
          .toBe('modified-by-policy-adapter:http://hello/world');
    });
  });
}
