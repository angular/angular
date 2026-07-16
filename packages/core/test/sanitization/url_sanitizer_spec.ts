/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {_sanitizeUrl} from '../../src/sanitization/url_sanitizer';

describe('URL sanitizer', () => {
  let logMsgs: string[];
  let originalLog: (msg: any) => any;

  beforeEach(() => {
    logMsgs = [];
    originalLog = console.warn; // Monkey patch DOM.log.
    console.warn = (msg: any) => logMsgs.push(msg);
  });

  afterEach(() => {
    console.warn = originalLog;
  });

  it('reports unsafe URLs', () => {
    expect(_sanitizeUrl('javascript:evil()')).toBe('unsafe:javascript:evil()');
    expect(logMsgs.join('\n')).toMatch(/sanitizing unsafe URL value/);
  });

  describe('valid URLs', () => {
    const validUrls = [
      '',
      'http://abc',
      'HTTP://abc',
      'https://abc',
      'HTTPS://abc',
      'ftp://abc',
      'FTP://abc',
      'mailto:me@example.com',
      'MAILTO:me@example.com',
      'tel:123-123-1234',
      'TEL:123-123-1234',
      '#anchor',
      '/page1.md',
      'http://JavaScript/my.js',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/', // Truncated.
      'data:video/webm;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
      'data:audio/opus;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
      'unknown-scheme:abc',
    ];
    for (const url of validUrls) {
      it(`valid ${url}`, () => expect(_sanitizeUrl(url)).toEqual(url));
    }
  });

  describe('invalid URLs', () => {
    const invalidUrls = [
      'javascript:evil()',
      'JavaScript:abc',
      ' javascript:abc',
      ' \n Java\n Script:abc',
      '&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;',
      '&#106&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;',
      '&#106 &#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;',
      '&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058',
      '&#x6A&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A;',
      'jav&#x09;ascript:alert();',
      'jav\u0000ascript:alert();',
    ];
    for (const url of invalidUrls) {
      it(`valid ${url}`, () => expect(_sanitizeUrl(url)).toMatch(/^unsafe:/));
    }
  });

  describe('data: URL handling', () => {
    describe('dangerous data: URLs are sanitized', () => {
      const dangerousDataUrls = [
        // HTML content can execute scripts when navigated to (e.g. via <a href>)
        'data:text/html,<h1>Hello</h1>',
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
        'data:text/html;charset=utf-8,<script>alert(1)</script>',
        // JavaScript MIME types execute scripts directly
        'data:application/javascript,alert(1)',
        'data:text/javascript,alert(1)',
        // XHTML can embed scripts
        'data:application/xhtml+xml,<html><script>alert(1)</script></html>',
        // SVG can embed scripts and executes them when opened as a document
        'data:image/svg+xml,<svg onload="alert(1)"></svg>',
        'data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9ImFsZXJ0KDEpIj48L3N2Zz4=',
        // Plain text data URLs
        'data:text/plain,hello',
        // data: URLs without base64 encoding for media types are not permitted
        'data:image/png,rawbytes',
        'data:video/mp4,rawbytes',
      ];
      for (const url of dangerousDataUrls) {
        it(`blocks "${url}"`, () => {
          expect(_sanitizeUrl(url)).toMatch(/^unsafe:/);
          expect(logMsgs.join('\n')).toMatch(/sanitizing unsafe URL value/);
        });
      }
    });

    describe('safe data: URLs are allowed', () => {
      const safeDataUrls = [
        // Binary image types with base64 encoding
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAAAAAAAAAAAAAAAAAAAAAAD-/xAAUAQEAAAAAAAAAAAAAAAAAAAAAA/8QAFAEAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=',
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JZQCdAEO/gHOAAA=',
        'data:image/bmp;base64,Qk0eAAAAAAAAABoAAAAMAAAAAQAAAAEAAAABACAAAAA=',
        'data:image/tiff;base64,SUkqAAgAAAA=',
        // Binary video types with base64 encoding
        'data:video/mp4;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ',
        'data:video/webm;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
        'data:video/ogg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ',
        // Binary audio types with base64 encoding
        'data:audio/opus;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
        'data:audio/mp3;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ',
        'data:audio/ogg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ',
        'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAA==',
      ];
      for (const url of safeDataUrls) {
        it(`allows "${url.substring(0, 40)}..."`, () => {
          expect(_sanitizeUrl(url)).toEqual(url);
        });
      }
    });
  });
});
