/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SecurityContext} from '@angular/core';
import {SafeHtml, SafeResourceUrl, SafeUrl} from '@angular/core/src/sanitization/bypass';
import {DomSanitizerImpl} from '@angular/platform-browser/src/security/dom_sanitization_service';

{
  describe('DOM Sanitization Service', () => {
    it('accepts resource URL values for resource contexts', () => {
      const sanitizer = new DomSanitizerImpl(null);
      const resourceUrl = sanitizer.bypassSecurityTrustResourceUrl('http://hello/world');
      expect(sanitizer.sanitize(SecurityContext.URL, resourceUrl)).toBe('http://hello/world');
    });

    describe('sanitizeHtml', () => {
      it('returns null when given null', () => {
        const sanitizer = new DomSanitizerImpl(document);
        const result = sanitizer.sanitizeHtml(null as any as string);
        expect(result).toBe(null);
      });

      const isSafeHTML = (value: any): value is SafeHtml => value?.getTypeName() === 'HTML';

      it('returns a SafeHtml when given safe HTML', () => {
        const sanitizer = new DomSanitizerImpl(document);
        const result = sanitizer.sanitizeHtml('<p> Hello world! </p>');
        expect(isSafeHTML(result)).toBeTrue();
      });

      it('returns a SafeHtml when given unsafe HTML', () => {
        const sanitizer = new DomSanitizerImpl(document);
        const result =
            sanitizer.sanitizeHtml('<p> Hello world! <script>alert("Evil!")</script></p>');
        expect(isSafeHTML(result)).toBeTrue();
      });
    });

    describe('sanitizeUrl', () => {
      it('should return null when given null', () => {
        const sanitizer = new DomSanitizerImpl(null);
        const result = sanitizer.sanitizeUrl(null as any as string);
        expect(result).toBeNull();
      });

      const isSafeUrl = (value: any): value is SafeUrl => value?.getTypeName() === 'URL';

      it('returns a SafeUrl when given a safe url', () => {
        const sanitizer = new DomSanitizerImpl(null);
        const result = sanitizer.sanitizeUrl('https://abc');
        expect(isSafeUrl(result)).toBeTrue();
      });

      it('returns null when given an unsafe url', () => {
        const sanitizer = new DomSanitizerImpl(null);
        const result = sanitizer.sanitizeUrl('javascript:evil');
        expect(result).toBeNull();
      });
    });

    describe('sanitizeResourceUrl', () => {
      it('should return null when given null', () => {
        const sanitizer = new DomSanitizerImpl(null);
        const result = sanitizer.sanitizeResourceUrl(null as any as string);
        expect(result).toBe(null);
      });

      const isSafeResourceUrl = (value: any): value is SafeResourceUrl =>
          value?.getTypeName() === 'ResourceURL';

      it('returns a SafeResourceUrl when given a safe url', () => {
        const sanitizer = new DomSanitizerImpl(null);
        const result = sanitizer.sanitizeResourceUrl('mailto:me@example.com');
        expect(isSafeResourceUrl(result)).toBeTrue();
      });

      it('returns null when given an unsafe url', () => {
        const sanitizer = new DomSanitizerImpl(null);
        const result = sanitizer.sanitizeResourceUrl('javascript:evil');
        expect(result).toBeNull();
      });
    });
  });
}
