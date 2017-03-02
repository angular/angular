/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as t from '@angular/core/testing/testing_internal';
import {browserDetection} from '@angular/platform-browser/testing/browser_util';

import {getDOM} from '../../src/dom/dom_adapter';
import {sanitizeHtml} from '../../src/security/html_sanitizer';

export function main() {
  t.describe('HTML sanitizer', () => {
    let defaultDoc: any;
    let originalLog: (msg: any) => any = null;
    let logMsgs: string[];

    t.beforeEach(() => {
      defaultDoc = getDOM().supportsDOMEvents() ? document : getDOM().createHtmlDocument();
      logMsgs = [];
      originalLog = getDOM().log;  // Monkey patch DOM.log.
      getDOM().log = (msg) => logMsgs.push(msg);
    });
    t.afterEach(() => { getDOM().log = originalLog; });

    t.it('serializes nested structures', () => {
      t.expect(sanitizeHtml(defaultDoc, '<div alt="x"><p>a</p>b<b>c<a alt="more">d</a></b>e</div>'))
          .toEqual('<div alt="x"><p>a</p>b<b>c<a alt="more">d</a></b>e</div>');
      t.expect(logMsgs).toEqual([]);
    });
    t.it('serializes self closing elements', () => {
      t.expect(sanitizeHtml(defaultDoc, '<p>Hello <br> World</p>'))
          .toEqual('<p>Hello <br> World</p>');
    });
    t.it('supports namespaced elements', () => {
      t.expect(sanitizeHtml(defaultDoc, 'a<my:hr/><my:div>b</my:div>c')).toEqual('abc');
    });
    t.it('supports namespaced attributes', () => {
      t.expect(sanitizeHtml(defaultDoc, '<a xlink:href="something">t</a>'))
          .toEqual('<a xlink:href="something">t</a>');
      t.expect(sanitizeHtml(defaultDoc, '<a xlink:evil="something">t</a>')).toEqual('<a>t</a>');
      t.expect(sanitizeHtml(defaultDoc, '<a xlink:href="javascript:foo()">t</a>'))
          .toEqual('<a xlink:href="unsafe:javascript:foo()">t</a>');
    });
    t.it('supports HTML5 elements', () => {
      t.expect(sanitizeHtml(defaultDoc, '<main><summary>Works</summary></main>'))
          .toEqual('<main><summary>Works</summary></main>');
    });
    t.it('sanitizes srcset attributes', () => {
      t.expect(sanitizeHtml(defaultDoc, '<img srcset="/foo.png 400px, javascript:evil() 23px">'))
          .toEqual('<img srcset="/foo.png 400px, unsafe:javascript:evil() 23px">');
    });

    t.it('supports sanitizing plain text', () => {
      t.expect(sanitizeHtml(defaultDoc, 'Hello, World')).toEqual('Hello, World');
    });
    t.it('ignores non-element, non-attribute nodes', () => {
      t.expect(sanitizeHtml(defaultDoc, '<!-- comments? -->no.')).toEqual('no.');
      t.expect(sanitizeHtml(defaultDoc, '<?pi nodes?>no.')).toEqual('no.');
      t.expect(logMsgs.join('\n')).toMatch(/sanitizing HTML stripped some content/);
    });
    t.it('supports sanitizing escaped entities', () => {
      t.expect(sanitizeHtml(defaultDoc, '&#128640;')).toEqual('&#128640;');
      t.expect(logMsgs).toEqual([]);
    });
    t.it('does not warn when just re-encoding text', () => {
      t.expect(sanitizeHtml(defaultDoc, '<p>Hellö Wörld</p>'))
          .toEqual('<p>Hell&#246; W&#246;rld</p>');
      t.expect(logMsgs).toEqual([]);
    });
    t.it('escapes entities', () => {
      t.expect(sanitizeHtml(defaultDoc, '<p>Hello &lt; World</p>'))
          .toEqual('<p>Hello &lt; World</p>');
      t.expect(sanitizeHtml(defaultDoc, '<p>Hello < World</p>')).toEqual('<p>Hello &lt; World</p>');
      t.expect(sanitizeHtml(defaultDoc, '<p alt="% &amp; &quot; !">Hello</p>'))
          .toEqual('<p alt="% &amp; &#34; !">Hello</p>');  // NB: quote encoded as ASCII &#34;.
    });
    t.describe('should strip dangerous elements', () => {
      const dangerousTags = [
        'frameset', 'form', 'param', 'object', 'embed', 'textarea', 'input', 'button', 'option',
        'select', 'script', 'style', 'link', 'base', 'basefont'
      ];

      for (const tag of dangerousTags) {
        t.it(`${tag}`, () => {
          t.expect(sanitizeHtml(defaultDoc, `<${tag}>evil!</${tag}>`)).toEqual('evil!');
        });
      }
      t.it(`swallows frame entirely`, () => {
        t.expect(sanitizeHtml(defaultDoc, `<frame>evil!</frame>`)).not.toContain('<frame>');
      });
    });
    t.describe('should strip dangerous attributes', () => {
      const dangerousAttrs = ['id', 'name', 'style'];

      for (const attr of dangerousAttrs) {
        t.it(`${attr}`, () => {
          t.expect(sanitizeHtml(defaultDoc, `<a ${attr}="x">evil!</a>`)).toEqual('<a>evil!</a>');
        });
      }
    });

    if (browserDetection.isWebkit) {
      t.it('should prevent mXSS attacks', function() {
        t.expect(sanitizeHtml(defaultDoc, '<a href="&#x3000;javascript:alert(1)">CLICKME</a>'))
            .toEqual('<a href="unsafe:javascript:alert(1)">CLICKME</a>');
      });
    }
  });
}
