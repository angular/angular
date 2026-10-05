/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {shim} from './utils';

describe('ShadowCss, :host and :host-context', () => {
  describe(':host', () => {
    it('should handle no context', () => {
      expect(shim(':host {}', 'contenta', 'a-host')).toEqualCss('[a-host] {}');
    });

    it('should handle tag selector', () => {
      expect(shim(':host(ul) {}', 'contenta', 'a-host')).toEqualCss('ul[a-host] {}');
    });

    it('should handle class selector', () => {
      expect(shim(':host(.x) {}', 'contenta', 'a-host')).toEqualCss('.x[a-host] {}');
    });

    it('should handle attribute selector', () => {
      expect(shim(':host([a="b"]) {}', 'contenta', 'a-host')).toEqualCss('[a="b"][a-host] {}');
      expect(shim(':host([a=b]) {}', 'contenta', 'a-host')).toEqualCss('[a=b][a-host] {}');
    });

    it('should handle attribute and next operator without spaces', () => {
      expect(shim(':host[foo]>div {}', 'contenta', 'a-host')).toEqualCss(
        '[foo][a-host] > div[contenta] {}',
      );
    });

    // we know that the following test doesn't pass
    // the host attribute is added before the space
    // We advise to a more simple class name that doesn't require escaping
    xit('should handle host with escaped class selector', () => {
      // here we're looking to shim :host.prüfung (an escaped ü is replaced by "\\fc ")
      expect(shim(':host.pr\\fc fung {}', 'contenta', 'a-host')).toEqual('.pr\\fc fung[a-host] {}');
    });

    it('should handle compound class selectors', () => {
      expect(shim(':host(.a.b) {}', 'contenta', 'a-host')).toEqualCss('.a.b[a-host] {}');
    });

    it('should handle pseudo selectors', () => {
      expect(shim(':host(:before) {}', 'contenta', 'a-host')).toEqualCss('[a-host]:before {}');
      expect(shim(':host:before {}', 'contenta', 'a-host')).toEqualCss('[a-host]:before {}');
      expect(shim(':host:nth-child(8n+1) {}', 'contenta', 'a-host')).toEqualCss(
        '[a-host]:nth-child(8n+1) {}',
      );
      expect(shim(':host(:nth-child(3n of :not(p, a))) {}', 'contenta', 'a-host')).toEqualCss(
        '[a-host]:nth-child(3n of :not(p, a)) {}',
      );
      expect(shim(':host:nth-of-type(8n+1) {}', 'contenta', 'a-host')).toEqualCss(
        '[a-host]:nth-of-type(8n+1) {}',
      );
      expect(shim(':host(.class):before {}', 'contenta', 'a-host')).toEqualCss(
        '.class[a-host]:before {}',
      );
      expect(shim(':host.class:before {}', 'contenta', 'a-host')).toEqualCss(
        '.class[a-host]:before {}',
      );
      expect(shim(':host(:not(p)):before {}', 'contenta', 'a-host')).toEqualCss(
        '[a-host]:not(p):before {}',
      );
      expect(shim(':host(:not(:has(p))) {}', 'contenta', 'a-host')).toEqualCss(
        '[a-host]:not(:has(p)) {}',
      );
      expect(shim(':host:not(:host.foo) {}', 'contenta', 'a-host')).toEqualCss(
        '[a-host]:not([a-host].foo) {}',
      );
      expect(shim(':host:not(.foo:host) {}', 'contenta', 'a-host')).toEqualCss(
        '[a-host]:not(.foo[a-host]) {}',
      );
      expect(shim(':host:not(:host.foo, :host.bar) {}', 'contenta', 'a-host')).toEqualCss(
        '[a-host]:not([a-host].foo, .bar[a-host]) {}',
      );
      expect(shim(':host:not(:host.foo, .bar :host) {}', 'contenta', 'a-host')).toEqualCss(
        '[a-host]:not([a-host].foo, .bar [a-host]) {}',
      );
      expect(shim(':host:not(.foo, .bar) {}', 'contenta', 'a-host')).toEqualCss(
        '[a-host]:not(.foo, .bar) {}',
      );
      expect(shim(':host:not(:has(p, a)) {}', 'contenta', 'a-host')).toEqualCss(
        '[a-host]:not(:has(p, a)) {}',
      );
      expect(shim(':host(:not(.foo, .bar)) {}', 'contenta', 'a-host')).toEqualCss(
        '[a-host]:not(.foo, .bar) {}',
      );
      expect(shim(':host:has(> child-element:not(.foo)) {}', 'contenta', 'a-host')).toEqualCss(
        '[a-host]:has(> child-element:not(.foo)) {}',
      );
    });

    // see b/63672152
    it('should handle unexpected selectors in the most reasonable way', () => {
      expect(shim('cmp:host {}', 'contenta', 'a-host')).toEqualCss('cmp[a-host] {}');
      expect(shim('cmp:host >>> {}', 'contenta', 'a-host')).toEqualCss('cmp[a-host] {}');
      expect(shim('cmp:host child {}', 'contenta', 'a-host')).toEqualCss(
        'cmp[a-host] child[contenta] {}',
      );
      expect(shim('cmp:host >>> child {}', 'contenta', 'a-host')).toEqualCss(
        'cmp[a-host] child {}',
      );
      expect(shim('cmp :host {}', 'contenta', 'a-host')).toEqualCss('cmp [a-host] {}');
      expect(shim('cmp :host >>> {}', 'contenta', 'a-host')).toEqualCss('cmp [a-host] {}');
      expect(shim('cmp :host child {}', 'contenta', 'a-host')).toEqualCss(
        'cmp [a-host] child[contenta] {}',
      );
      expect(shim('cmp :host >>> child {}', 'contenta', 'a-host')).toEqualCss(
        'cmp [a-host] child {}',
      );
    });

    it('should support newlines in the same selector and content ', () => {
      const selector = `.foo:not(
        :host) {
          background-color:
            green;
      }`;
      expect(shim(selector, 'contenta', 'a-host')).toEqualCss(
        '.foo[contenta]:not( [a-host]) { background-color:green;}',
      );
    });
  });

  describe(':host-context', () => {
    it('should transform :host-context with pseudo selectors', () => {
      expect(
        shim(':host-context(backdrop:not(.borderless)) .backdrop {}', 'contenta', 'hosta'),
      ).toEqualCss(
        'backdrop:not(.borderless)[hosta] .backdrop[contenta], backdrop:not(.borderless) [hosta] .backdrop[contenta] {}',
      );
      expect(shim(':where(:host-context(backdrop)) {}', 'contenta', 'hosta')).toEqualCss(
        ':where(backdrop[hosta]), :where(backdrop [hosta]) {}',
      );
      expect(shim(':where(:host-context(outer1)) :host(bar) {}', 'contenta', 'hosta')).toEqualCss(
        ':where(outer1) bar[hosta] {}',
      );
      expect(
        shim(':where(:host-context(.one)) :where(:host-context(.two)) {}', 'contenta', 'a-host'),
      ).toEqualCss(
        ':where(.one.two[a-host]), ' + // `one` and `two` both on the host
          ':where(.one.two [a-host]), ' + // `one` and `two` are both on the same ancestor
          ':where(.one .two[a-host]), ' + // `one` is an ancestor and `two` is on the host
          ':where(.one .two [a-host]), ' + // `one` and `two` are both ancestors (in that order)
          ':where(.two .one[a-host]), ' + // `two` is an ancestor and `one` is on the host
          ':where(.two .one [a-host])' + // `two` and `one` are both ancestors (in that order)
          ' {}',
      );
      expect(
        shim(':where(:host-context(backdrop)) .foo ~ .bar {}', 'contenta', 'hosta'),
      ).toEqualCss(
        ':where(backdrop[hosta]) .foo[contenta] ~ .bar[contenta], :where(backdrop [hosta]) .foo[contenta] ~ .bar[contenta] {}',
      );
      expect(shim(':where(:host-context(backdrop)) :host {}', 'contenta', 'hosta')).toEqualCss(
        ':where(backdrop) [hosta] {}',
      );
      expect(shim('div:where(:host-context(backdrop)) :host {}', 'contenta', 'hosta')).toEqualCss(
        'div:where(backdrop) [hosta] {}',
      );
    });

    it('should transform :host-context with nested pseudo selectors', () => {
      expect(shim(':host-context(:where(.foo:not(.bar))) {}', 'contenta', 'hosta')).toEqualCss(
        ':where(.foo:not(.bar))[hosta], :where(.foo:not(.bar)) [hosta] {}',
      );
      expect(shim(':host-context(:is(.foo:not(.bar))) {}', 'contenta', 'hosta')).toEqualCss(
        ':is(.foo:not(.bar))[hosta], :is(.foo:not(.bar)) [hosta] {}',
      );
      expect(
        shim(':host-context(:where(.foo:not(.bar, .baz))) .inner {}', 'contenta', 'hosta'),
      ).toEqualCss(
        ':where(.foo:not(.bar, .baz))[hosta] .inner[contenta], :where(.foo:not(.bar, .baz)) [hosta] .inner[contenta] {}',
      );
    });

    it('should handle combinations of double :host-context and :where', () => {
      // 1. :where on the outside containing two :host-context selectors chained
      expect(
        shim(':where(:host-context(.one):host-context(.two)) {}', 'contenta', 'a-host'),
      ).toEqualCss(
        ':where(.one.two[a-host]), :where(.one.two [a-host]), :where(.one .two[a-host]), ' +
          ':where(.one .two [a-host]), :where(.two .one[a-host]), :where(.two .one [a-host]) {}',
      );

      // 2. :where on the outside containing two :host-context selectors as descendants
      expect(
        shim(':where(:host-context(.one) :host-context(.two)) {}', 'contenta', 'a-host'),
      ).toEqualCss(
        ':where(.one.two[a-host]), :where(.one.two [a-host]), :where(.one .two[a-host]), ' +
          ':where(.one .two [a-host]), :where(.two .one[a-host]), :where(.two .one [a-host]) {}',
      );

      // 3. Mix: first :host-context inside :where, second :host-context outside
      expect(
        shim(':where(:host-context(.one)) :host-context(.two) {}', 'contenta', 'a-host'),
      ).toEqualCss(
        ':where(.one).two[a-host], :where(.one).two [a-host], :where(.one) .two[a-host], ' +
          ':where(.one) .two [a-host], .two :where(.one)[a-host], .two :where(.one) [a-host] {}',
      );

      // 4. Mix: first :host-context outside, second :host-context inside :where
      expect(
        shim(':host-context(.one) :where(:host-context(.two)) {}', 'contenta', 'a-host'),
      ).toEqualCss(
        '.one:where(.two)[a-host], .one:where(.two) [a-host], .one :where(.two)[a-host], ' +
          '.one :where(.two) [a-host], :where(.two) .one[a-host], :where(.two) .one [a-host] {}',
      );

      // 5. Two :host-context selectors with :where inside
      expect(
        shim(':host-context(:where(.one)) :host-context(:where(.two)) {}', 'contenta', 'a-host'),
      ).toEqualCss(
        ':where(.one):where(.two)[a-host], :where(.one):where(.two) [a-host], ' +
          ':where(.one) :where(.two)[a-host], :where(.one) :where(.two) [a-host], ' +
          ':where(.two) :where(.one)[a-host], :where(.two) :where(.one) [a-host] {}',
      );

      // 6. Mix: one :host-context inside :where, one :host-context with :where inside
      expect(
        shim(':where(:host-context(.one)) :host-context(:where(.two)) {}', 'contenta', 'a-host'),
      ).toEqualCss(
        ':where(.one):where(.two)[a-host], :where(.one):where(.two) [a-host], ' +
          ':where(.one) :where(.two)[a-host], :where(.one) :where(.two) [a-host], ' +
          ':where(.two) :where(.one)[a-host], :where(.two) :where(.one) [a-host] {}',
      );

      // 7. Mix: one :host-context with :where inside, one :host-context inside :where
      expect(
        shim(':host-context(:where(.one)) :where(:host-context(.two)) {}', 'contenta', 'a-host'),
      ).toEqualCss(
        ':where(.one):where(.two)[a-host], :where(.one):where(.two) [a-host], ' +
          ':where(.one) :where(.two)[a-host], :where(.one) :where(.two) [a-host], ' +
          ':where(.two) :where(.one)[a-host], :where(.two) :where(.one) [a-host] {}',
      );
    });

    it('should handle :where containing :host-context followed by descendant selectors', () => {
      expect(shim(':where(:host-context(.dark)) .button {}', 'contenta', 'a-host')).toEqualCss(
        ':where(.dark[a-host]) .button[contenta], :where(.dark [a-host]) .button[contenta] {}',
      );
    });

    it('should handle :where wrapping :host-context split across lines', () => {
      const input = `
        :where(
          :host-context(.dark-theme)
        ) .button {}
      `;
      expect(shim(input, 'contenta', 'a-host')).toEqualCss(
        ':where(.dark-theme[a-host]) .button[contenta], ' +
          ':where(.dark-theme [a-host]) .button[contenta] {}',
      );
    });

    it('should keep descendant selectors inside :where together with :host-context', () => {
      // Output of a Sass theme mixin: `:where(:host-context(.dark-theme) &) { @content; }`.
      expect(shim(':where(:host-context(.dark-theme) .card) {}', 'contenta', 'a-host')).toEqualCss(
        ':where(.dark-theme[a-host] .card[contenta]), ' +
          ':where(.dark-theme [a-host] .card[contenta]) {}',
      );
      expect(
        shim(':where(:host-context(.dark-theme) .card) .title {}', 'contenta', 'a-host'),
      ).toEqualCss(
        ':where(.dark-theme[a-host] .card[contenta]) .title[contenta], ' +
          ':where(.dark-theme [a-host] .card[contenta]) .title[contenta] {}',
      );
    });

    it('should handle tag selector', () => {
      expect(shim(':host-context(div) {}', 'contenta', 'a-host')).toEqualCss(
        'div[a-host], div [a-host] {}',
      );
      expect(shim(':host-context(ul) > .y {}', 'contenta', 'a-host')).toEqualCss(
        'ul[a-host] > .y[contenta], ul [a-host] > .y[contenta] {}',
      );
    });

    it('should handle class selector', () => {
      expect(shim(':host-context(.x) {}', 'contenta', 'a-host')).toEqualCss(
        '.x[a-host], .x [a-host] {}',
      );

      expect(shim(':host-context(.x) > .y {}', 'contenta', 'a-host')).toEqualCss(
        '.x[a-host] > .y[contenta], .x [a-host] > .y[contenta] {}',
      );
    });

    it('should handle attribute selector', () => {
      expect(shim(':host-context([a="b"]) {}', 'contenta', 'a-host')).toEqualCss(
        '[a="b"][a-host], [a="b"] [a-host] {}',
      );
      expect(shim(':host-context([a=b]) {}', 'contenta', 'a-host')).toEqualCss(
        '[a=b][a-host], [a=b] [a-host] {}',
      );
      expect(
        shim(':host-context([data-theme="dark,compact"]) .button {}', 'contenta', 'a-host'),
      ).toEqualCss(
        '[data-theme="dark,compact"][a-host] .button[contenta], ' +
          '[data-theme="dark,compact"] [a-host] .button[contenta] {}',
      );
    });

    it('should handle multiple :host-context() selectors', () => {
      expect(shim(':host-context(.one):host-context(.two) {}', 'contenta', 'a-host')).toEqualCss(
        '.one.two[a-host], ' + // `one` and `two` both on the host
          '.one.two [a-host], ' + // `one` and `two` are both on the same ancestor
          '.one .two[a-host], ' + // `one` is an ancestor and `two` is on the host
          '.one .two [a-host], ' + // `one` and `two` are both ancestors (in that order)
          '.two .one[a-host], ' + // `two` is an ancestor and `one` is on the host
          '.two .one [a-host]' + // `two` and `one` are both ancestors (in that order)
          ' {}',
      );

      expect(
        shim(':host-context(.X):host-context(.Y):host-context(.Z) {}', 'contenta', 'a-host'),
      ).toEqualCss(
        '.X.Y.Z[a-host], ' +
          '.X.Y.Z [a-host], ' +
          '.X.Y .Z[a-host], ' +
          '.X.Y .Z [a-host], ' +
          '.X.Z .Y[a-host], ' +
          '.X.Z .Y [a-host], ' +
          '.X .Y.Z[a-host], ' +
          '.X .Y.Z [a-host], ' +
          '.X .Y .Z[a-host], ' +
          '.X .Y .Z [a-host], ' +
          '.X .Z .Y[a-host], ' +
          '.X .Z .Y [a-host], ' +
          '.Y.Z .X[a-host], ' +
          '.Y.Z .X [a-host], ' +
          '.Y .Z .X[a-host], ' +
          '.Y .Z .X [a-host], ' +
          '.Z .Y .X[a-host], ' +
          '.Z .Y .X [a-host] ' +
          '{}',
      );
    });

    // This test is checking that the result is backward compatible with previous behavior.
    // Arguably it should actually be an error that should be reported.
    it('should handle :host-context with no ancestor selectors', () => {
      expect(shim(':host-context .inner {}', 'contenta', 'a-host')).toEqualCss(
        '[contenta]:host-context .inner[contenta] {}',
      );
      expect(shim(':host-context() .inner {}', 'contenta', 'a-host')).toEqualCss(
        '[contenta]:host-context() .inner[contenta] {}',
      );
    });

    // More than one selector such as this is not valid as part of the :host-context spec.
    // This test is checking that the result is backward compatible with previous behavior.
    // Arguably it should actually be an error that should be reported.
    it('should handle selectors', () => {
      expect(shim(':host-context(.one,.two) .inner {}', 'contenta', 'a-host')).toEqualCss(
        '.one[a-host] .inner[contenta], ' +
          '.one [a-host] .inner[contenta], ' +
          '.two[a-host] .inner[contenta], ' +
          '.two [a-host] .inner[contenta] ' +
          '{}',
      );
    });

    it('should distribute preceding prefix across all permutations of multi-argument :host-context', () => {
      expect(shim('div :host-context(.foo, .bar) span {}', 'contenta', 'a-host')).toEqualCss(
        'div .foo[a-host] span[contenta], div .foo [a-host] span[contenta], ' +
          'div .bar[a-host] span[contenta], div .bar [a-host] span[contenta] {}',
      );
    });

    it('should handle :host-context with comma-separated child selector', () => {
      expect(shim(':host-context(.foo) a:not(.a, .b) {}', 'contenta', 'a-host')).toEqualCss(
        '.foo[a-host] a[contenta]:not(.a, .b), .foo [a-host] a[contenta]:not(.a, .b) {}',
      );
      expect(
        shim(
          ':host-context(.foo) a:not([a], .b), .bar, :host-context(.baz) a:not([c], .d) {}',
          'contenta',
          'a-host',
        ),
      ).toEqualCss(
        '.foo[a-host] a[contenta]:not([a], .b), .foo [a-host] a[contenta]:not([a], .b), ' +
          '.bar[contenta], .baz[a-host] a[contenta]:not([c], .d), ' +
          '.baz [a-host] a[contenta]:not([c], .d) {}',
      );
    });
  });

  describe(':host-context and :host combination selector', () => {
    it('should handle selectors on the same element', () => {
      expect(shim(':host-context(div):host(.x) > .y {}', 'contenta', 'a-host')).toEqualCss(
        'div.x[a-host] > .y[contenta] {}',
      );
    });

    it('should handle no selector :host', () => {
      // The second selector below should have a `[a-host]` attribute selector
      // attached to `.one`, current `:host-context` unwrapping logic doesn't
      // work correctly on prefixed selectors, see #58345.
      expect(shim(':host:host-context(.one) {}', 'contenta', 'a-host')).toEqualCss(
        '.one[a-host][a-host], .one [a-host] {}',
      );
      expect(shim(':host-context(.one) :host {}', 'contenta', 'a-host')).toEqualCss(
        '.one [a-host] {}',
      );
    });

    it('should handle selectors on different elements', () => {
      expect(shim(':host-context(div) :host(.x) > .y {}', 'contenta', 'a-host')).toEqualCss(
        'div .x[a-host] > .y[contenta] {}',
      );

      expect(shim(':host-context(div) > :host(.x) > .y {}', 'contenta', 'a-host')).toEqualCss(
        'div > .x[a-host] > .y[contenta] {}',
      );
    });

    it('should handle selectors on different elements (prefixed :host-context)', () => {
      expect(shim('.foo :host-context(div) :host(.x) > .y {}', 'contenta', 'a-host')).toEqualCss(
        '.foo div .x[a-host] > .y[contenta] {}',
      );

      expect(
        shim(
          'body[data-cm-color-scheme=dark] :host-context(.cm-gm2) .cfc-message-warning {}',
          'contenta',
          'a-host',
        ),
      ).toEqualCss(
        'body[data-cm-color-scheme=dark] .cm-gm2[a-host] .cfc-message-warning[contenta], ' +
          'body[data-cm-color-scheme=dark] .cm-gm2 [a-host] .cfc-message-warning[contenta] {}',
      );
    });

    it('should parse multiple rules containing :host-context and :host', () => {
      const input = `
            :host-context(outer1) :host(bar) {}
            :host-context(outer2) :host(foo) {}
        `;
      expect(shim(input, 'contenta', 'a-host')).toEqualCss(
        'outer1 bar[a-host] {} ' + 'outer2 foo[a-host] {}',
      );
    });

    it('should maintain prefixed context on all host-context permutations in multi-rule stylesheets containing :host', () => {
      const input = `
        body[data-cm-color-scheme="dark"] :host-context(.cm-gm2) .foo {}
        :host {}
      `;
      expect(shim(input, 'contenta', 'a-host')).toEqualCss(
        'body[data-cm-color-scheme="dark"] .cm-gm2[a-host] .foo[contenta], ' +
          'body[data-cm-color-scheme="dark"] .cm-gm2 [a-host] .foo[contenta] {} ' +
          '[a-host] {}',
      );
    });

    it('should handle preceding tag before :host-context', () => {
      expect(shim('div:host-context(.bar) .zot { color: red; }', 'contenta', 'a-host')).toEqualCss(
        'div.bar[a-host] .zot[contenta], .bar div[a-host] .zot[contenta] { color: red; }',
      );
    });

    it('should handle preceding compound selector with spaces or combinators before :host-context', () => {
      expect(
        shim('[aria-label="Close dialog"]:host-context(.bar) {}', 'contenta', 'a-host'),
      ).toEqualCss(
        '[aria-label="Close dialog"].bar[a-host], .bar [aria-label="Close dialog"][a-host] {}',
      );
      expect(shim('li:nth-child(2n + 1):host-context(.bar) {}', 'contenta', 'a-host')).toEqualCss(
        'li:nth-child(2n + 1).bar[a-host], .bar li:nth-child(2n + 1)[a-host] {}',
      );
      expect(shim('li:is(.x, .y):host-context(.c) {}', 'contenta', 'a-host')).toEqualCss(
        'li:is(.x, .y).c[a-host], .c li:is(.x, .y)[a-host] {}',
      );
      expect(shim('div:not(.a, .b):host-context(.c) .d {}', 'contenta', 'a-host')).toEqualCss(
        'div:not(.a, .b).c[a-host] .d[contenta], .c div:not(.a, .b)[a-host] .d[contenta] {}',
      );
      expect(shim('div:has(> img):host-context(.c) {}', 'contenta', 'a-host')).toEqualCss(
        'div:has(> img).c[a-host], .c div:has(> img)[a-host] {}',
      );
      expect(shim('.p :is(.x .y):host-context(.c) {}', 'contenta', 'a-host')).toEqualCss(
        '.p :is(.x .y).c[a-host], .p .c :is(.x .y)[a-host] {}',
      );
    });

    it('should handle preceding class selector before :host-context', () => {
      expect(shim('.foo :host-context(.bar) {}', 'contenta', 'a-host')).toEqualCss(
        '.foo .bar[a-host], .foo .bar [a-host] {}',
      );
    });
  });

  // The tests in this block document current fallback behavior for selector patterns that are not
  // supported by ShadowCss. They are not a specification of desired output, and may be updated if
  // proper support or compiler diagnostics are introduced in the future.
  describe('unsupported selector patterns', () => {
    it('should ignore :host with a selector list containing top-level commas', () => {
      expect(shim(':host(.a, .b) {}', 'contenta', 'a-host')).toEqualCss(
        '[contenta]:host(.a, .b) {}',
      );
      expect(shim('.outer :host(.a, .b) .inner {}', 'contenta', 'a-host')).toEqualCss(
        '.outer[contenta] [contenta]:host(.a, .b) .inner[contenta] {}',
      );
    });

    it('should not distribute an argumentless :host-context prefix', () => {
      expect(shim(':host-context :host-context(.a) {}', 'contenta', 'host-a')).toEqualCss(
        ':host-context .a[host-a], .a [host-a] {}',
      );
    });

    it('should not distribute an unclosed functional pseudo-class across :host-context permutations', () => {
      // Unsupported: `:host-context` nested in `:not()` or `:has()` has no well-defined meaning.
      // The output intentionally matches the behavior before prefix distribution: the unmatched
      // `)` makes the selector list invalid, so the browser drops the rule. Distributing the prefix
      // instead would produce a valid selector that matches inside `.cfc` / `.a` (the inverse of
      // the author's intent).
      expect(shim(':not(:host-context(.cfc)) .f.g {}', 'contenta', 'a-host')).toEqualCss(
        '[contenta]:not(.cfc[a-host]) .f.g, .cfc [a-host]) .f.g[contenta] {}',
      );
      expect(shim('.p :has(:host-context(.a)) .b {}', 'contenta', 'a-host')).toEqualCss(
        '.p [contenta]:has(.a[a-host]) .b, .a [a-host]) .b[contenta] {}',
      );
      expect(shim('.p :not(.q :host-context(.a)) .b {}', 'contenta', 'a-host')).toEqualCss(
        '.p [contenta]:not(.q .a[a-host]) .b, .a [a-host]) .b[contenta] {}',
      );
    });

    it('should not distribute a prefix inside a :is() wrapper that contains more than :host-context', () => {
      // Unsupported: only a `:is()`/`:where()` wrapping `:host-context` directly is handled. The
      // output is invalid (unmatched `)`), unchanged from the behavior before prefix distribution.
      expect(shim(':is(.x :host-context(.a)) .b {}', 'contenta', 'a-host')).toEqualCss(
        '[contenta]:is(.x .a[a-host]) .b, .a [a-host]) .b[contenta] {}',
      );
    });

    it('should not distribute a prefix containing a deep combinator', () => {
      // Unsupported: the first permutation leaks the host marker, as before prefix distribution.
      // Distributing the prefix would break the second permutation in the same way.
      expect(shim('.p ::ng-deep div:host-context(.c) {}', 'contenta', 'a-host')).toEqualCss(
        '.p[contenta] div.c-shadowcsshost-no-combinator, .c [a-host] {}',
      );
      expect(shim('.p >>> div:host-context(.c) {}', 'contenta', 'a-host')).toEqualCss(
        '.p[contenta] div.c-shadowcsshost-no-combinator, .c [a-host] {}',
      );
    });

    it('should keep a preceding compound only in the first direct permutation', () => {
      // Known limitation: with several context selectors, the compound (`div`) is dropped from
      // every direct (`.b[a-host]`) permutation except the first.
      expect(shim('div:host-context(.a, .b) {}', 'contenta', 'a-host')).toEqualCss(
        'div.a[a-host], .a div[a-host], .b[a-host], .b div[a-host] {}',
      );
      expect(shim('div:host-context(.a):host-context(.b) {}', 'contenta', 'a-host')).toEqualCss(
        'div.a.b[a-host], .a.b div[a-host], .a .b[a-host], .a .b div[a-host], ' +
          '.b .a[a-host], .b .a div[a-host] {}',
      );
    });
  });
});
