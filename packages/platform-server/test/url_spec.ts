/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {parseUrl} from '../src/url';

describe('parseUrl', () => {
  describe('with origin', () => {
    it('should resolve relative paths against origin', () => {
      const url = parseUrl('/deep/path?query#hash', 'http://test.com');
      expect(url.href).toBe('http://test.com/deep/path?query#hash');
      expect(url.search).toBe('?query');
      expect(url.hash).toBe('#hash');
    });

    it('should throw on backslash-prefixed hijack attempts', () => {
      const urls = ['/\\attacker.com/deep/path', '\\\\attacker.com/deep/path'];
      for (const url of urls) {
        expect(() => parseUrl(url, 'http://test.com')).toThrowError(
          `URL ${url} changed origin unexpectedly. This is suspicious and may indicate a security bypass attempt.`,
        );
      }
    });

    it('should resolve absolute URLs ignoring origin', () => {
      const url = parseUrl('http://other.com/deep/path', 'http://test.com');
      expect(url.href).toBe('http://other.com/deep/path');
      expect(url.origin).toBe('http://other.com');
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
        expect(() => parseUrl(url, 'http://test.com')).toThrowError(
          new RegExp(`Invalid URL: ${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
        );
      }
    });

    it('should throw on obfuscated protocols attempting to change origin', () => {
      const url = 'ht\ntp://evil.com/path';
      expect(() => parseUrl(url, 'http://test.com')).toThrowError(
        `URL ${url} changed origin unexpectedly. This is suspicious and may indicate a security bypass attempt.`,
      );
    });
  });

  describe('without origin', () => {
    it('should return null for relative paths', () => {
      expect(parseUrl('/deep/path?query#hash')).toBeNull();
      expect(parseUrl('deep/path')).toBeNull();
    });

    it('should parse valid absolute URLs', () => {
      const url = parseUrl('http://other.com/deep/path');
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
      ];

      for (const url of malformedUrls) {
        expect(() => parseUrl(url)).toThrowError(
          new RegExp(`Invalid URL: ${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
        );
      }
    });
  });
});
