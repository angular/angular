/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SecurityContext} from '@angular/core';
import {DomSanitizer, DomSanitizerImpl} from '../../src/security/dom_sanitization_service';
import {TestBed} from '@angular/core/testing';

describe('DOM Sanitization Service', () => {
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    sanitizer = TestBed.inject(DomSanitizerImpl);
  });

  it('accepts resource URL values for resource contexts', () => {
    const resourceUrl = sanitizer.bypassSecurityTrustResourceUrl('http://hello/world');
    expect(sanitizer.sanitize(SecurityContext.URL, resourceUrl)).toBe('http://hello/world');
  });
});
