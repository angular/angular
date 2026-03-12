/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {_sanitizeHtml} from '../../src/sanitization/html_sanitizer';
import {isDOMParserAvailable} from '../../src/sanitization/inert_body';
import {isBrowser} from '@angular/private/testing';

function sanitizeHtml(defaultDoc: any, unsafeHtmlInput: string): string {
  return _sanitizeHtml(defaultDoc, unsafeHtmlInput).toString();
}

describe('HTML sanitizer', () => {
  let defaultDoc: any;
  let originalLog: (msg: any) => any = null!;
  let logMsgs: string[];

  beforeEach(() => {
    defaultDoc = document;
    logMsgs = [];
    originalLog = console.warn; // Monkey patch DOM.log.
    console.warn = (msg: any) => logMsgs.push(msg);
  });

  afterEach(() => {
    console.warn = originalLog;
  });

  it('serializes nested structures', () => {
    expect(
      sanitizeHtml(defaultDoc, '<div alt="x"><p>a</p>b<b>c<a alt="more">d</a></b>e</div>'),
    ).toEqual('<div alt="x"><p>a</p>b<b>c<a alt="more">d</a></b>e</div>');
    expect(logMsgs).toEqual([]);
  });

  it('serializes self closing elements', () => {
    expect(sanitizeHtml(defaultDoc, '<p>Hello <br> World</p>')).toEqual('<p>Hello <br> World</p>');
  });

  it('supports namespaced elements', () => {
    expect(sanitizeHtml(defaultDoc, 'a<my:hr/><my:div>b</my:div>c')).toEqual('abc');
  });

  it('supports namespaced attributes', () => {
    expect(sanitizeHtml(defaultDoc, '<a xlink:href="something">t</a>')).toEqual(
      '<a xlink:href="something">t</a>',
    );
    expect(sanitizeHtml(defaultDoc, '<a xlink:evil="something">t</a>')).toEqual('<a>t</a>');
    expect(sanitizeHtml(defaultDoc, '<a xlink:href="javascript:foo()">t</a>')).toEqual(
      '<a xlink:href="unsafe:javascript:foo()">t</a>',
    );
  });

  it('supports HTML5 elements', () => {
    expect(sanitizeHtml(defaultDoc, '<main><summary>Works</summary></main>')).toEqual(
      '<main><summary>Works</summary></main>',
    );
  });

  it('supports ARIA attributes', () => {
    expect(
      sanitizeHtml(defaultDoc, '<h1 role="presentation" aria-haspopup="true">Test</h1>'),
    ).toEqual('<h1 role="presentation" aria-haspopup="true">Test</h1>');
    expect(sanitizeHtml(defaultDoc, '<i aria-label="Info">Info</i>')).toEqual(
      '<i aria-label="Info">Info</i>',
    );
    expect(sanitizeHtml(defaultDoc, '<img src="pteranodon.jpg" aria-details="details">')).toEqual(
      '<img src="pteranodon.jpg" aria-details="details">',
    );
  });

  it('ignores srcset attributes', () => {
    // Modern browsers can handle `srcset` safely without any additional sanitization.
    expect(
      sanitizeHtml(defaultDoc, '<img srcset="/foo.png 400px, javascript:evil() 23px">'),
    ).toEqual('<img srcset="/foo.png 400px, javascript:evil() 23px">');

    // Verify that complex `srcset` with URLs that contain commas are retained as is.
    const content =
      '<img src="https://localhost/h_450,w_450/logo.jpg" ' +
      'srcset="https://localhost/h_450,w_450/logo.jpg 450w, https://localhost/h_300,w_300/logo.jpg 300w">';
    expect(sanitizeHtml(defaultDoc, content)).toEqual(content);
  });

  it('supports sanitizing plain text', () => {
    expect(sanitizeHtml(defaultDoc, 'Hello, World')).toEqual('Hello, World');
  });

  it('ignores non-element, non-attribute nodes', () => {
    expect(sanitizeHtml(defaultDoc, '<!-- comments? -->no.')).toEqual('no.');
    expect(sanitizeHtml(defaultDoc, '<?pi nodes?>no.')).toEqual('no.');
    expect(logMsgs.join('\n')).toMatch(/sanitizing HTML stripped some content/);
  });

  it('supports sanitizing escaped entities', () => {
    expect(sanitizeHtml(defaultDoc, '&#128640;')).toEqual('&#128640;');
    expect(logMsgs).toEqual([]);
  });

  it('does not warn when just re-encoding text', () => {
    expect(sanitizeHtml(defaultDoc, '<p>Hellö Wörld</p>')).toEqual('<p>Hell&#246; W&#246;rld</p>');
    expect(logMsgs).toEqual([]);
  });

  it('escapes entities', () => {
    expect(sanitizeHtml(defaultDoc, '<p>Hello &lt; World</p>')).toEqual('<p>Hello &lt; World</p>');
    expect(sanitizeHtml(defaultDoc, '<p>Hello < World</p>')).toEqual('<p>Hello &lt; World</p>');
    expect(sanitizeHtml(defaultDoc, '<p alt="% &amp; &quot; !">Hello</p>')).toEqual(
      '<p alt="% &amp; &#34; !">Hello</p>',
    ); // NB: quote encoded as ASCII &#34;.
  });

  describe('should strip dangerous elements (but potentially traverse their content)', () => {
    const dangerousTags = ['form', 'object', 'textarea', 'button', 'option', 'select'];
    for (const tag of dangerousTags) {
      it(tag, () => {
        expect(sanitizeHtml(defaultDoc, `<${tag}>evil!</${tag}>`)).toEqual('evil!');
      });
    }

    const dangerousSelfClosingTags = [
      'base',
      'basefont',
      'embed',
      'frameset',
      'input',
      'link',
      'param',
    ];
    for (const tag of dangerousSelfClosingTags) {
      it(tag, () => {
        expect(sanitizeHtml(defaultDoc, `before<${tag}>After`)).toEqual('beforeAfter');
      });
    }

    const dangerousSkipContentTags = ['script', 'style', 'template'];
    for (const tag of dangerousSkipContentTags) {
      it(tag, () => {
        expect(sanitizeHtml(defaultDoc, `<${tag}>evil!</${tag}>`)).toEqual('');
      });
    }

    it(`frame`, () => {
      // `<frame>` is special, because different browsers treat it differently (e.g. remove it
      // altogether). // We just verify that (one way or another), there is no `<frame>` element
      // after sanitization.
      expect(sanitizeHtml(defaultDoc, `<frame>evil!</frame>`)).not.toContain('<frame>');
    });
  });

  describe('should strip dangerous attributes', () => {
    const dangerousAttrs = ['id', 'name', 'style'];

    for (const attr of dangerousAttrs) {
      it(`${attr}`, () => {
        expect(sanitizeHtml(defaultDoc, `<a ${attr}="x">evil!</a>`)).toEqual('<a>evil!</a>');
      });
    }
  });

  it('ignores content of script elements', () => {
    expect(sanitizeHtml(defaultDoc, '<script>var foo="<p>bar</p>"</script>')).toEqual('');
    expect(sanitizeHtml(defaultDoc, '<script>var foo="<p>bar</p>"</script><div>hi</div>')).toEqual(
      '<div>hi</div>',
    );
    expect(sanitizeHtml(defaultDoc, '<style><!-- something-->hi</style>')).toEqual('');
  });

  it('ignores content of style elements', () => {
    expect(sanitizeHtml(defaultDoc, '<style><!-- foobar --></style><div>hi</div>')).toEqual(
      '<div>hi</div>',
    );
    expect(sanitizeHtml(defaultDoc, '<style><!-- foobar --></style>')).toEqual('');
    expect(sanitizeHtml(defaultDoc, '<style><!-- something-->hi</style>')).toEqual('');
    expect(logMsgs.join('\n')).toMatch(/sanitizing HTML stripped some content/);
  });

  it('should strip unclosed iframe tag', () => {
    expect(sanitizeHtml(defaultDoc, '<iframe>')).toEqual('');
    expect([
      '&lt;iframe&gt;',
      // Double-escaped on IE
      '&amp;lt;iframe&amp;gt;',
    ]).toContain(sanitizeHtml(defaultDoc, '<iframe><iframe>'));
    expect([
      '&lt;script&gt;evil();&lt;/script&gt;',
      // Double-escaped on IE
      '&amp;lt;script&amp;gt;evil();&amp;lt;/script&amp;gt;',
    ]).toContain(sanitizeHtml(defaultDoc, '<iframe><script>evil();</script>'));
  });

  it('should ignore extraneous body tags', () => {
    expect(sanitizeHtml(defaultDoc, '</body>')).toEqual('');
    expect(sanitizeHtml(defaultDoc, 'foo</body>bar')).toEqual('foobar');
    expect(sanitizeHtml(defaultDoc, 'foo<body>bar')).toEqual('foobar');
    expect(sanitizeHtml(defaultDoc, 'fo<body>ob</body>ar')).toEqual('foobar');
  });

  it('should not enter an infinite loop on clobbered elements', () => {
    // Some browsers are vulnerable to clobbered elements and will throw an expected exception
    // IE and EDGE does not seems to be affected by those cases
    // Anyway what we want to test is that browsers do not enter an infinite loop which would
    // result in a timeout error for the test.
    try {
      sanitizeHtml(defaultDoc, '<form><input name="parentNode" /></form>');
    } catch (e) {
      // depending on the browser, we might get an exception
    }
    try {
      sanitizeHtml(defaultDoc, '<form><input name="nextSibling" /></form>');
    } catch (e) {
      // depending on the browser, we might get an exception
    }
    try {
      sanitizeHtml(defaultDoc, '<form><div><div><input name="nextSibling" /></div></div></form>');
    } catch (e) {
      // depending on the browser, we might get an exception
    }
    try {
      sanitizeHtml(defaultDoc, '<input name="nextSibling" form="a"><form id="a"></form>');
    } catch (e) {
      // depending on the browser, we might get an exception
    }
  });

  it('should properly sanitize the content when `nodeName` is clobbered', () => {
    const output = sanitizeHtml(defaultDoc, '<form><input name=nodeName></form>text');
    expect(output).toBe('text');
  });

  it('should sanitize the content when `nextSibling` or `firstChild` were clobbered', () => {
    const nextSibling = () =>
      sanitizeHtml(defaultDoc, '<input name="nextSibling" form="a">A<form id="a"></form>');
    const firstChild = () =>
      sanitizeHtml(defaultDoc, '<object form="a" id="firstChild"></object>B<form id="a"></form>');

    // Note: we have a different behavior here in a real browser and when running in Node,
    // when Domino is used to emulate DOM:
    //
    //  * In Node, Domino doesn't match browser behavior exactly, thus it's not susceptible to
    //    element clobbering. Both `.nextSibling` and `.firstChild` (that we use to traverse
    //    the DOM during sanitization) point to correct elements, as if no clobbering happens.
    //    In this case, we just sanitize the content (the content becomes safe).
    //
    //  * In a real browser, sanitization code triggers a code path that recognizes that
    //    clobbering happened and throws an error.
    //
    // So in both cases we achieve the result of preventing potentially dangerous content from
    // being included into an application, but there is a difference in observable behavior
    // depending on a platform.
    if (isBrowser) {
      // Running in a real browser
      const errorMsg = 'Failed to sanitize html because the element is clobbered: ';
      expect(nextSibling).toThrowError(`${errorMsg}<input name="nextSibling" form="a">`);
      expect(firstChild).toThrowError(`${errorMsg}<object form="a" id="firstChild"></object>`);
    } else {
      // Running in Node, using Domino DOM emulation
      expect(nextSibling()).toBe('A');
      expect(firstChild()).toBe('B');
    }
  });

  // See
  // https://github.com/cure53/DOMPurify/blob/a992d3a75031cb8bb032e5ea8399ba972bdf9a65/src/purify.js#L439-L449
  it('should not allow JavaScript execution when creating inert document', () => {
    const output = sanitizeHtml(defaultDoc, '<svg><g onload="window.xxx = 100"></g></svg>');
    const window = defaultDoc.defaultView;
    if (window) {
      expect(window.xxx).toBe(undefined);
      window.xxx = undefined;
    }
    expect(output).toEqual('');
  });

  // See https://github.com/cure53/DOMPurify/releases/tag/0.6.7
  it('should not allow JavaScript hidden in badly formed HTML to get through sanitization (Firefox bug)', () => {
    expect(
      sanitizeHtml(defaultDoc, '<svg><p><style><img src="</style><img src=x onerror=alert(1)//">'),
    ).toEqual(
      isDOMParserAvailable()
        ? // PlatformBrowser output
          '<p><img src="x"></p>'
        : // PlatformServer output
          '<p></p>',
    );
  });

  it('should prevent mXSS attacks', function () {
    // In Chrome Canary 62, the ideographic space character is kept as a stringified HTML entity
    expect(sanitizeHtml(defaultDoc, '<a href="&#x3000;javascript:alert(1)">CLICKME</a>')).toMatch(
      /<a href="unsafe:(&#12288;)?javascript:alert\(1\)">CLICKME<\/a>/,
    );
  });

  if (isDOMParserAvailable()) {
    it('should work even if DOMParser returns a null body', () => {
      // Simulate `DOMParser.parseFromString()` returning a null body.
      // See https://github.com/angular/angular/issues/39834
      spyOn(window.DOMParser.prototype, 'parseFromString').and.returnValue({body: null} as any);
      expect(sanitizeHtml(defaultDoc, 'Hello, World')).toEqual('Hello, World');
    });
  }
});
