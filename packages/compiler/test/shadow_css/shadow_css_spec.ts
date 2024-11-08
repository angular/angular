/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {shim} from './utils';

describe('ShadowCss', () => {
  it('should handle empty string', () => {
    expect(shim('', 'contenta')).toEqualCss('');
  });

  it('should add an attribute to every rule', () => {
    const css = 'one {color: red;}two {color: red;}';
    const expected = 'one[contenta] {color:red;}two[contenta] {color:red;}';
    expect(shim(css, 'contenta')).toEqualCss(expected);
  });

  it('should handle invalid css', () => {
    const css = 'one {color: red;}garbage';
    const expected = 'one[contenta] {color:red;}garbage';
    expect(shim(css, 'contenta')).toEqualCss(expected);
  });

  it('should add an attribute to every selector', () => {
    const css = 'one, two {color: red;}';
    const expected = 'one[contenta], two[contenta] {color:red;}';
    expect(shim(css, 'contenta')).toEqualCss(expected);
  });

  it('should support newlines in the selector and content ', () => {
    const css = `
      one,
      two {
        color: red;
      }
    `;
    const expected = `
      one[contenta],
      two[contenta] {
        color: red;
      }
    `;
    expect(shim(css, 'contenta')).toEqualCss(expected);
  });

  it('should support newlines in the same selector and content ', () => {
    const selector = `.foo:not(
      .bar) {
        background-color:
          green;
    }`;
    expect(shim(selector, 'contenta', 'a-host')).toEqualCss(
      '.foo[contenta]:not( .bar) { background-color:green;}',
    );
  });

  it('should handle complicated selectors', () => {
    expect(shim('one::before {}', 'contenta')).toEqualCss('one[contenta]::before {}');
    expect(shim('one two {}', 'contenta')).toEqualCss('one[contenta] two[contenta] {}');
    expect(shim('one > two {}', 'contenta')).toEqualCss('one[contenta] > two[contenta] {}');
    expect(shim('one + two {}', 'contenta')).toEqualCss('one[contenta] + two[contenta] {}');
    expect(shim('one ~ two {}', 'contenta')).toEqualCss('one[contenta] ~ two[contenta] {}');
    expect(shim('.one.two > three {}', 'contenta')).toEqualCss(
      '.one.two[contenta] > three[contenta] {}',
    );
    expect(shim('one[attr="value"] {}', 'contenta')).toEqualCss('one[attr="value"][contenta] {}');
    expect(shim('one[attr=value] {}', 'contenta')).toEqualCss('one[attr=value][contenta] {}');
    expect(shim('one[attr^="value"] {}', 'contenta')).toEqualCss('one[attr^="value"][contenta] {}');
    expect(shim('one[attr$="value"] {}', 'contenta')).toEqualCss('one[attr$="value"][contenta] {}');
    expect(shim('one[attr*="value"] {}', 'contenta')).toEqualCss('one[attr*="value"][contenta] {}');
    expect(shim('one[attr|="value"] {}', 'contenta')).toEqualCss('one[attr|="value"][contenta] {}');
    expect(shim('one[attr~="value"] {}', 'contenta')).toEqualCss('one[attr~="value"][contenta] {}');
    expect(shim('one[attr="va lue"] {}', 'contenta')).toEqualCss('one[attr="va lue"][contenta] {}');
    expect(shim('one[attr] {}', 'contenta')).toEqualCss('one[attr][contenta] {}');
    expect(shim('[is="one"] {}', 'contenta')).toEqualCss('[is="one"][contenta] {}');
    expect(shim('[attr] {}', 'contenta')).toEqualCss('[attr][contenta] {}');
  });

  it('should transform :host with attributes', () => {
    expect(shim(':host [attr] {}', 'contenta', 'hosta')).toEqualCss('[hosta] [attr][contenta] {}');
    expect(shim(':host(create-first-project) {}', 'contenta', 'hosta')).toEqualCss(
      'create-first-project[hosta] {}',
    );
    expect(shim(':host[attr] {}', 'contenta', 'hosta')).toEqualCss('[attr][hosta] {}');
    expect(shim(':host[attr]:where(:not(.cm-button)) {}', 'contenta', 'hosta')).toEqualCss(
      '[attr][hosta]:where(:not(.cm-button)) {}',
    );
  });

  it('should handle escaped sequences in selectors', () => {
    expect(shim('one\\/two {}', 'contenta')).toEqualCss('one\\/two[contenta] {}');
    expect(shim('one\\:two {}', 'contenta')).toEqualCss('one\\:two[contenta] {}');
    expect(shim('one\\\\:two {}', 'contenta')).toEqualCss('one\\\\[contenta]:two {}');
    expect(shim('.one\\:two {}', 'contenta')).toEqualCss('.one\\:two[contenta] {}');
    expect(shim('.one\\:\\fc ber {}', 'contenta')).toEqualCss('.one\\:\\fc ber[contenta] {}');
    expect(shim('.one\\:two .three\\:four {}', 'contenta')).toEqualCss(
      '.one\\:two[contenta] .three\\:four[contenta] {}',
    );
    expect(shim('div:where(.one) {}', 'contenta', 'hosta')).toEqualCss(
      'div[contenta]:where(.one) {}',
    );
    expect(shim('div:where() {}', 'contenta', 'hosta')).toEqualCss('div[contenta]:where() {}');
    expect(shim(':where(a):where(b) {}', 'contenta', 'hosta')).toEqualCss(
      ':where(a[contenta]):where(b[contenta]) {}',
    );
    expect(shim('*:where(.one) {}', 'contenta', 'hosta')).toEqualCss('*[contenta]:where(.one) {}');
    expect(shim('*:where(.one) ::ng-deep .foo {}', 'contenta', 'hosta')).toEqualCss(
      '*[contenta]:where(.one) .foo {}',
    );
  });

  it('should handle pseudo functions correctly', () => {
    // :where()
    expect(shim(':where(.one) {}', 'contenta', 'hosta')).toEqualCss(':where(.one[contenta]) {}');
    expect(shim(':where(div.one span.two) {}', 'contenta', 'hosta')).toEqualCss(
      ':where(div.one[contenta] span.two[contenta]) {}',
    );
    expect(shim(':where(.one) .two {}', 'contenta', 'hosta')).toEqualCss(
      ':where(.one[contenta]) .two[contenta] {}',
    );
    expect(shim(':where(:host) {}', 'contenta', 'hosta')).toEqualCss(':where([hosta]) {}');
    expect(shim(':where(:host) .one {}', 'contenta', 'hosta')).toEqualCss(
      ':where([hosta]) .one[contenta] {}',
    );
    expect(shim(':where(.one) :where(:host) {}', 'contenta', 'hosta')).toEqualCss(
      ':where(.one) :where([hosta]) {}',
    );
    expect(shim(':where(.one :host) {}', 'contenta', 'hosta')).toEqualCss(
      ':where(.one [hosta]) {}',
    );
    expect(shim('div :where(.one) {}', 'contenta', 'hosta')).toEqualCss(
      'div[contenta] :where(.one[contenta]) {}',
    );
    expect(shim(':host :where(.one .two) {}', 'contenta', 'hosta')).toEqualCss(
      '[hosta] :where(.one[contenta] .two[contenta]) {}',
    );
    expect(shim(':where(.one, .two) {}', 'contenta', 'hosta')).toEqualCss(
      ':where(.one[contenta], .two[contenta]) {}',
    );
    expect(shim(':where(.one > .two) {}', 'contenta', 'hosta')).toEqualCss(
      ':where(.one[contenta] > .two[contenta]) {}',
    );
    expect(shim(':where(> .one) {}', 'contenta', 'hosta')).toEqualCss(
      ':where( > .one[contenta]) {}',
    );
    expect(shim(':where(:not(.one) ~ .two) {}', 'contenta', 'hosta')).toEqualCss(
      ':where([contenta]:not(.one) ~ .two[contenta]) {}',
    );
    expect(shim(':where([foo]) {}', 'contenta', 'hosta')).toEqualCss(':where([foo][contenta]) {}');

    // :is()
    expect(shim('div:is(.foo) {}', 'contenta', 'a-host')).toEqualCss('div[contenta]:is(.foo) {}');
    expect(shim(':is(.dark :host) {}', 'contenta', 'a-host')).toEqualCss(':is(.dark [a-host]) {}');
    expect(shim(':is(.dark) :is(:host) {}', 'contenta', 'a-host')).toEqualCss(
      ':is(.dark) :is([a-host]) {}',
    );
    expect(shim(':host:is(.foo) {}', 'contenta', 'a-host')).toEqualCss('[a-host]:is(.foo) {}');
    expect(shim(':is(.foo) {}', 'contenta', 'a-host')).toEqualCss(':is(.foo[contenta]) {}');
    expect(shim(':is(.foo, .bar, .baz) {}', 'contenta', 'a-host')).toEqualCss(
      ':is(.foo[contenta], .bar[contenta], .baz[contenta]) {}',
    );
    expect(shim(':is(.foo, .bar) :host {}', 'contenta', 'a-host')).toEqualCss(
      ':is(.foo, .bar) [a-host] {}',
    );

    // :is() and :where()
    expect(
      shim(
        ':is(.foo, .bar) :is(.baz) :where(.one, .two) :host :where(.three:first-child) {}',
        'contenta',
        'a-host',
      ),
    ).toEqualCss(
      ':is(.foo, .bar) :is(.baz) :where(.one, .two) [a-host] :where(.three[contenta]:first-child) {}',
    );
    expect(shim(':where(:is(a)) {}', 'contenta', 'hosta')).toEqualCss(
      ':where(:is(a[contenta])) {}',
    );
    expect(shim(':where(:is(a, b)) {}', 'contenta', 'hosta')).toEqualCss(
      ':where(:is(a[contenta], b[contenta])) {}',
    );
    expect(shim(':where(:host:is(.one, .two)) {}', 'contenta', 'hosta')).toEqualCss(
      ':where([hosta]:is(.one, .two)) {}',
    );
    expect(shim(':where(:host :is(.one, .two)) {}', 'contenta', 'hosta')).toEqualCss(
      ':where([hosta] :is(.one[contenta], .two[contenta])) {}',
    );
    expect(shim(':where(:is(a, b) :is(.one, .two)) {}', 'contenta', 'hosta')).toEqualCss(
      ':where(:is(a[contenta], b[contenta]) :is(.one[contenta], .two[contenta])) {}',
    );
    expect(
      shim(
        ':where(:where(a:has(.foo), b) :is(.one, .two:where(.foo > .bar))) {}',
        'contenta',
        'hosta',
      ),
    ).toEqualCss(
      ':where(:where(a[contenta]:has(.foo), b[contenta]) :is(.one[contenta], .two[contenta]:where(.foo > .bar))) {}',
    );
    expect(shim(':where(.two):first-child {}', 'contenta', 'hosta')).toEqualCss(
      '[contenta]:where(.two):first-child {}',
    );
    expect(shim(':first-child:where(.two) {}', 'contenta', 'hosta')).toEqualCss(
      '[contenta]:first-child:where(.two) {}',
    );
    expect(shim(':where(.two):nth-child(3) {}', 'contenta', 'hosta')).toEqualCss(
      '[contenta]:where(.two):nth-child(3) {}',
    );
    expect(shim('table :where(td, th):hover { color: lime; }', 'contenta', 'hosta')).toEqualCss(
      'table[contenta] [contenta]:where(td, th):hover { color:lime;}',
    );

    // complex selectors
    expect(shim(':host:is([foo],[foo-2])>div.example-2 {}', 'contenta', 'a-host')).toEqualCss(
      '[a-host]:is([foo],[foo-2]) > div.example-2[contenta] {}',
    );
    expect(shim(':host:is([foo], [foo-2]) > div.example-2 {}', 'contenta', 'a-host')).toEqualCss(
      '[a-host]:is([foo], [foo-2]) > div.example-2[contenta] {}',
    );
    expect(shim(':host:has([foo],[foo-2])>div.example-2 {}', 'contenta', 'a-host')).toEqualCss(
      '[a-host]:has([foo],[foo-2]) > div.example-2[contenta] {}',
    );

    // :has()
    expect(shim('div:has(a) {}', 'contenta', 'hosta')).toEqualCss('div[contenta]:has(a) {}');
    expect(shim('div:has(a) :host {}', 'contenta', 'hosta')).toEqualCss('div:has(a) [hosta] {}');
    expect(shim(':has(a) :host :has(b) {}', 'contenta', 'hosta')).toEqualCss(
      ':has(a) [hosta] [contenta]:has(b) {}',
    );
    expect(shim('div:has(~ .one) {}', 'contenta', 'hosta')).toEqualCss(
      'div[contenta]:has(~ .one) {}',
    );
    // Unlike `:is()` or `:where()` the attribute selector isn't placed inside
    // of `:has()`. That is deliberate, `[contenta]:has(a)` would select all
    // `[contenta]` with `a` inside, while `:has(a[contenta])` would select
    // everything that contains `a[contenta]`, targeting elements outside of
    // encapsulated scope.
    expect(shim(':has(a) :has(b) {}', 'contenta', 'hosta')).toEqualCss(
      '[contenta]:has(a) [contenta]:has(b) {}',
    );
    expect(shim(':has(a, b) {}', 'contenta', 'hosta')).toEqualCss('[contenta]:has(a, b) {}');
    expect(shim(':has(a, b:where(.foo), :is(.bar)) {}', 'contenta', 'hosta')).toEqualCss(
      '[contenta]:has(a, b:where(.foo), :is(.bar)) {}',
    );
    expect(
      shim(':has(a, b:where(.foo), :is(.bar):first-child):first-letter {}', 'contenta', 'hosta'),
    ).toEqualCss('[contenta]:has(a, b:where(.foo), :is(.bar):first-child):first-letter {}');
    expect(
      shim(':where(a, b:where(.foo), :has(.bar):first-child) {}', 'contenta', 'hosta'),
    ).toEqualCss(
      ':where(a[contenta], b[contenta]:where(.foo), [contenta]:has(.bar):first-child) {}',
    );
    expect(shim(':has(.one :host, .two) {}', 'contenta', 'hosta')).toEqualCss(
      '[contenta]:has(.one [hosta], .two) {}',
    );
    expect(shim(':has(.one, :host) {}', 'contenta', 'hosta')).toEqualCss(
      '[contenta]:has(.one, [hosta]) {}',
    );
  });

  it('should handle :host inclusions inside pseudo-selectors selectors', () => {
    expect(shim('.header:not(.admin) {}', 'contenta', 'hosta')).toEqualCss(
      '.header[contenta]:not(.admin) {}',
    );
    expect(shim('.header:is(:host > .toolbar, :host ~ .panel) {}', 'contenta', 'hosta')).toEqualCss(
      '.header[contenta]:is([hosta] > .toolbar, [hosta] ~ .panel) {}',
    );
    expect(
      shim('.header:where(:host > .toolbar, :host ~ .panel) {}', 'contenta', 'hosta'),
    ).toEqualCss('.header[contenta]:where([hosta] > .toolbar, [hosta] ~ .panel) {}');
    expect(shim('.header:not(.admin, :host.super .header) {}', 'contenta', 'hosta')).toEqualCss(
      '.header[contenta]:not(.admin, .super[hosta] .header) {}',
    );
    expect(
      shim('.header:not(.admin, :host.super .header, :host.mega .header) {}', 'contenta', 'hosta'),
    ).toEqualCss('.header[contenta]:not(.admin, .super[hosta] .header, .mega[hosta] .header) {}');

    expect(shim('.one :where(.two, :host) {}', 'contenta', 'hosta')).toEqualCss(
      '.one :where(.two[contenta], [hosta]) {}',
    );
    expect(shim('.one :where(:host, .two) {}', 'contenta', 'hosta')).toEqualCss(
      '.one :where([hosta], .two[contenta]) {}',
    );
    expect(shim(':is(.foo):is(:host):is(.two) {}', 'contenta', 'hosta')).toEqualCss(
      ':is(.foo):is([hosta]):is(.two[contenta]) {}',
    );
    expect(shim(':where(.one, :host .two):first-letter {}', 'contenta', 'hosta')).toEqualCss(
      '[contenta]:where(.one, [hosta] .two):first-letter {}',
    );
    expect(shim(':first-child:where(.one, :host .two) {}', 'contenta', 'hosta')).toEqualCss(
      '[contenta]:first-child:where(.one, [hosta] .two) {}',
    );
    expect(
      shim(':where(.one, :host .two):nth-child(3):is(.foo, a:where(.bar)) {}', 'contenta', 'hosta'),
    ).toEqualCss('[contenta]:where(.one, [hosta] .two):nth-child(3):is(.foo, a:where(.bar)) {}');
  });

  it('should handle escaped selector with space (if followed by a hex char)', () => {
    // When esbuild runs with optimization.minify
    // selectors are escaped: .über becomes .\fc ber.
    // The space here isn't a separator between 2 selectors
    expect(shim('.\\fc ber {}', 'contenta')).toEqual('.\\fc ber[contenta] {}');
    expect(shim('.\\fc ker {}', 'contenta')).toEqual('.\\fc[contenta]   ker[contenta] {}');
    expect(shim('.pr\\fc fung {}', 'contenta')).toEqual('.pr\\fc fung[contenta] {}');
  });

  it('should handle ::shadow', () => {
    const css = shim('x::shadow > y {}', 'contenta');
    expect(css).toEqualCss('x[contenta] > y[contenta] {}');
  });

  it('should leave calc() unchanged', () => {
    const styleStr = 'div {height:calc(100% - 55px);}';
    const css = shim(styleStr, 'contenta');
    expect(css).toEqualCss('div[contenta] {height:calc(100% - 55px);}');
  });

  it('should shim rules with quoted content', () => {
    const styleStr = 'div {background-image: url("a.jpg"); color: red;}';
    const css = shim(styleStr, 'contenta');
    expect(css).toEqualCss('div[contenta] {background-image:url("a.jpg"); color:red;}');
  });

  it('should shim rules with an escaped quote inside quoted content', () => {
    const styleStr = 'div::after { content: "\\"" }';
    const css = shim(styleStr, 'contenta');
    expect(css).toEqualCss('div[contenta]::after { content:"\\""}');
  });

  it('should shim rules with curly braces inside quoted content', () => {
    const styleStr = 'div::after { content: "{}" }';
    const css = shim(styleStr, 'contenta');
    expect(css).toEqualCss('div[contenta]::after { content:"{}"}');
  });

  it('should keep retain multiline selectors', () => {
    // This is needed as shifting in line number will cause sourcemaps to break.
    const styleStr = '.foo,\n.bar { color: red;}';
    const css = shim(styleStr, 'contenta');
    expect(css).toEqual('.foo[contenta], \n.bar[contenta] { color: red;}');
  });

  describe('comments', () => {
    // Comments should be kept in the same position as otherwise inline sourcemaps break due to
    // shift in lines.
    it('should replace multiline comments with newline', () => {
      expect(shim('/* b {c} */ b {c}', 'contenta')).toBe('\n b[contenta] {c}');
    });

    it('should replace multiline comments with newline in the original position', () => {
      expect(shim('/* b {c}\n */ b {c}', 'contenta')).toBe('\n\n b[contenta] {c}');
    });

    it('should replace comments with newline in the original position', () => {
      expect(shim('/* b {c} */ b {c} /* a {c} */ a {c}', 'contenta')).toBe(
        '\n b[contenta] {c} \n a[contenta] {c}',
      );
    });

    it('should keep sourceMappingURL comments', () => {
      expect(shim('b {c} /*# sourceMappingURL=data:x */', 'contenta')).toBe(
        'b[contenta] {c} /*# sourceMappingURL=data:x */',
      );
      expect(shim('b {c}/* #sourceMappingURL=data:x */', 'contenta')).toBe(
        'b[contenta] {c}/* #sourceMappingURL=data:x */',
      );
    });

    it('should handle adjacent comments', () => {
      expect(shim('/* comment 1 */ /* comment 2 */ b {c}', 'contenta')).toBe(
        '\n \n b[contenta] {c}',
      );
    });
  });
});
