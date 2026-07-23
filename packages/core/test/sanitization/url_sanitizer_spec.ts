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
      // Common download use cases must remain valid
      'data:text/csv,a,b,c',
      'data:text/csv;charset=utf-8,hello%2Cworld',
      'data:application/pdf;base64,JVBERi0xLjQ=',
      'data:application/json,{"key":"value"}',
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

  describe('dangerous data: URLs are sanitized', () => {
    const dangerousDataUrls = [
      // HTML content executes scripts when navigated to (Firefox allows data: navigation)
      'data:text/html,<h1>Hello</h1>',
      'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
      'data:text/html;charset=utf-8,<script>alert(1)</script>',
      'DATA:TEXT/HTML,xss',
      // JavaScript MIME types execute scripts directly
      'data:application/javascript,alert(1)',
      'data:text/javascript,alert(1)',
      // XHTML can embed and execute scripts
      'data:application/xhtml+xml,<html><script>alert(1)</script></html>',
      // SVG executes scripts when opened as a document via link navigation
      'data:image/svg+xml,<svg onload="alert(1)"></svg>',
      'data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9ImFsZXJ0KDEpIj48L3N2Zz4=',
    ];
    for (const url of dangerousDataUrls) {
      it(`blocks "${url}"`, () => {
        expect(_sanitizeUrl(url)).toMatch(/^unsafe:/);
        expect(logMsgs.join('\n')).toMatch(/sanitizing unsafe URL value/);
      });
    }
  });

  describe('non-executable data: URLs remain valid', () => {
    const safeDataUrls = [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ',
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAA=',
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+',
      'data:video/mp4;base64,AAAAIGZ0eXBpc29t',
      'data:audio/ogg;base64,T2dnUwACAA==',
      // Client-side file download patterns must remain unblocked
      'data:text/csv,name,age\nAlice,30',
      'data:text/csv;charset=utf-8,hello%2Cworld',
      'data:application/pdf;base64,JVBERi0xLjQ=',
      'data:application/json,{"key":"value"}',
      'data:application/octet-stream;base64,AAAA',
    ];
    for (const url of safeDataUrls) {
      it(`allows "${url.substring(0, 50)}..."`, () => {
        expect(_sanitizeUrl(url)).toEqual(url);
      });
    }
  });
});
