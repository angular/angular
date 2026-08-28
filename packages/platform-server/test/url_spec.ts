/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {resolveUrl} from '../src/url';

describe('resolveUrl', () => {
  describe('with origin', () => {
    it('should resolve relative paths against origin', () => {
      const url = resolveUrl('/deep/path?query#hash', 'http://test.com');
      expect(url.href).toBe('http://test.com/deep/path?query#hash');
      expect(url.search).toBe('?query');
      expect(url.hash).toBe('#hash');
    });

    it('should throw on backslash-prefixed hijack attempts', () => {
      const urls = ['/\\attacker.com/deep/path', '\\\\attacker.com/deep/path'];
      for (const url of urls) {
        expect(() => resolveUrl(url, 'http://test.com')).toThrowError(/NG05703/);
      }
    });

    it('should resolve absolute URLs ignoring origin', () => {
      const url = resolveUrl('http://other.com/deep/path', 'http://test.com');
      expect(url.href).toBe('http://other.com/deep/path');
      expect(url.origin).toBe('http://other.com');
    });

    it('should throw when allowOriginChange is false and origin changes', () => {
      expect(() =>
        resolveUrl('http://other.com/deep/path', 'http://test.com', {allowOriginChange: false}),
      ).toThrowError(/NG05703/);
    });

    it('should resolve same origin when allowOriginChange is false', () => {
      const url = resolveUrl('http://test.com/other-path', 'http://test.com', {
        allowOriginChange: false,
      });
      expect(url.href).toBe('http://test.com/other-path');
    });

    it('should resolve relative paths when allowOriginChange is false', () => {
      const url = resolveUrl('/other-path', 'http://test.com', {allowOriginChange: false});
      expect(url.href).toBe('http://test.com/other-path');
    });

    it('should throw an error for malformed absolute URLs', () => {
      const malformedUrls = [
        'http://evil.com:80:80/path',
        'https://evil.com:80:80/path',
        'http://[google.com]/path',
        'http://google.com:port/path',
        'http://google.com:80a/path',
      ];

      for (const url of malformedUrls) {
        expect(() => resolveUrl(url, 'http://test.com')).toThrowError(
          new RegExp(`Invalid URL: ${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
        );
      }
    });

    it('should throw on obfuscated protocols attempting to change origin', () => {
      const url = 'ht\ntp://evil.com/path';
      expect(() => resolveUrl(url, 'http://test.com')).toThrowError(/NG05703/);
    });

    it('should not trim unicode whitespace into protocol-relative URLs', () => {
      const urls = ['\u00A0//attacker.example/collect', '\uFEFF//attacker.example/collect'];

      for (const urlStr of urls) {
        const urlWithProtocolRelative = resolveUrl(urlStr, 'http://test.com', {
          allowProtocolRelative: true,
        });
        expect(urlWithProtocolRelative.origin).toBe('http://test.com');
        expect(urlWithProtocolRelative.pathname).toContain('//attacker.example/collect');

        const urlWithoutProtocolRelative = resolveUrl(urlStr, 'http://test.com');
        expect(urlWithoutProtocolRelative.origin).toBe('http://test.com');
        expect(urlWithoutProtocolRelative.pathname).toContain('//attacker.example/collect');
      }
    });

    it('should resolve scheme URLs without authority against origin of the same scheme', () => {
      const urlA = resolveUrl('http:/attacker.example/steal', 'http://test.com');
      expect(urlA.origin).toBe('http://test.com');
      expect(urlA.pathname).toBe('/attacker.example/steal');

      const urlB = resolveUrl('http:attacker.example/steal', 'http://test.com');
      expect(urlB.origin).toBe('http://test.com');
      expect(urlB.pathname).toBe('/attacker.example/steal');

      const urlHttpsA = resolveUrl('https:/attacker.example/steal', 'https://test.com');
      expect(urlHttpsA.origin).toBe('https://test.com');
      expect(urlHttpsA.pathname).toBe('/attacker.example/steal');

      const urlHttpsB = resolveUrl('https:attacker.example/steal', 'https://test.com');
      expect(urlHttpsB.origin).toBe('https://test.com');
      expect(urlHttpsB.pathname).toBe('/attacker.example/steal');

      const urlBackslash = resolveUrl('http:\\attacker.example/steal', 'http://test.com');
      expect(urlBackslash.origin).toBe('http://test.com');
      expect(urlBackslash.pathname).toBe('/attacker.example/steal');
    });

    it('should throw on scheme URLs without authority when origin scheme differs', () => {
      expect(() => resolveUrl('http:/attacker.example/steal', 'https://test.com')).toThrowError(
        /NG05703/,
      );
      expect(() => resolveUrl('http:attacker.example/steal', 'https://test.com')).toThrowError(
        /NG05703/,
      );
      expect(() => resolveUrl('https:/attacker.example/steal', 'http://test.com')).toThrowError(
        /NG05703/,
      );
      expect(() => resolveUrl('https:attacker.example/steal', 'http://test.com')).toThrowError(
        /NG05703/,
      );
      expect(() => resolveUrl('http:\\attacker.example/steal', 'https://test.com')).toThrowError(
        /NG05703/,
      );
    });
  });

  describe('without origin', () => {
    it('should return null for relative paths', () => {
      expect(resolveUrl('/deep/path?query#hash')).toBeNull();
      expect(resolveUrl('deep/path')).toBeNull();
      expect(resolveUrl('/\\attacker.com/deep/path')).toBeNull();
      expect(resolveUrl('\\\\attacker.com/deep/path')).toBeNull();
      expect(resolveUrl('\u00A0//attacker.com/deep/path')).toBeNull();
    });

    it('should parse valid absolute URLs', () => {
      const url = resolveUrl('http://other.com/deep/path');
      expect(url).not.toBeNull();
      expect(url!.href).toBe('http://other.com/deep/path');
      expect(url!.origin).toBe('http://other.com');
    });

    it('should throw an error for malformed absolute URLs', () => {
      const malformedUrls = [
        'http://evil.com:80:80/path',
        'https://evil.com:80:80/path',
        'http://[google.com]/path',
        'http://google.com:port/path',
        'http://google.com:80a/path',
        'ht\ntp://evil.com:80:80/path',
      ];

      for (const url of malformedUrls) {
        expect(() => resolveUrl(url)).toThrowError(
          new RegExp(`Invalid URL: ${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
        );
      }
    });
  });
});
