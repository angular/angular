/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {_sanitizeUrl, sanitizeSrcset} from '../../src/sanitization/url_sanitizer';

{
  describe('URL sanitizer', () => {
    let logMsgs: string[];
    let originalLog: (msg: any) => any;

    beforeEach(() => {
      logMsgs = [];
      originalLog = console.warn;  // Monkey patch DOM.log.
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
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',  // Truncated.
        'data:video/webm;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
        'data:audio/opus;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
      ];
      for (const url of validUrls) {
        it(`valid ${url}`, () => expect(_sanitizeUrl(url)).toEqual(url));
      }
    });

    describe('invalid URLs', () => {
      const invalidUrls = [
        'javascript:evil()',
        'JavaScript:abc',
        'evilNewProtocol:abc',
        ' \n Java\n Script:abc',
        '&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;',
        '&#106&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;',
        '&#106 &#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;',
        '&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058',
        '&#x6A&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A;',
        'jav&#x09;ascript:alert();',
        'jav\u0000ascript:alert();',
        'data:;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
        'data:,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
        'data:iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
        'data:text/javascript;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
        'data:application/x-msdownload;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/',
      ];
      for (const url of invalidUrls) {
        it(`valid ${url}`, () => expect(_sanitizeUrl(url)).toMatch(/^unsafe:/));
      }
    });

    describe('valid srcsets', () => {
      const validSrcsets = [
        '',
        'http://angular.io/images/test.png',
        'http://angular.io/images/test.png, http://angular.io/images/test.png',
        'http://angular.io/images/test.png, http://angular.io/images/test.png, http://angular.io/images/test.png',
        'http://angular.io/images/test.png 2x',
        'http://angular.io/images/test.png 2x, http://angular.io/images/test.png 3x',
        'http://angular.io/images/test.png 1.5x',
        'http://angular.io/images/test.png 1.25x',
        'http://angular.io/images/test.png 200w, http://angular.io/images/test.png 300w',
        'https://angular.io/images/test.png, http://angular.io/images/test.png',
        'http://angular.io:80/images/test.png, http://angular.io:8080/images/test.png',
        'http://www.angular.io:80/images/test.png, http://www.angular.io:8080/images/test.png',
        'https://angular.io/images/test.png, https://angular.io/images/test.png',
        '//angular.io/images/test.png, //angular.io/images/test.png',
        '/images/test.png, /images/test.png',
        'images/test.png, images/test.png',
        'http://angular.io/images/test.png?12345, http://angular.io/images/test.png?12345',
        'http://angular.io/images/test.png?maxage, http://angular.io/images/test.png?maxage',
        'http://angular.io/images/test.png?maxage=234, http://angular.io/images/test.png?maxage=234',
      ];
      for (const srcset of validSrcsets) {
        it(`valid ${srcset}`, () => expect(sanitizeSrcset(srcset)).toEqual(srcset));
      }
    });

    describe('invalid srcsets', () => {
      const invalidSrcsets = [
        'ht:tp://angular.io/images/test.png',
        'http://angular.io/images/test.png, ht:tp://angular.io/images/test.png',
      ];
      for (const srcset of invalidSrcsets) {
        it(`valid ${srcset}`, () => expect(sanitizeSrcset(srcset)).toMatch(/unsafe:/));
      }
    });
  });
}
