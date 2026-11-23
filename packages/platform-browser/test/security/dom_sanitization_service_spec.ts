/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SecurityContext} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {DomSanitizerImpl} from '../../src/security/dom_sanitization_service';

describe('DOM Sanitization Service', () => {
  it('accepts resource URL values for resource contexts', () => {
    const svc = TestBed.runInInjectionContext(() => new DomSanitizerImpl());
    const resourceUrl = svc.bypassSecurityTrustResourceUrl('http://hello/world');
    expect(svc.sanitize(SecurityContext.URL, resourceUrl)).toBe('http://hello/world');
  });
});
