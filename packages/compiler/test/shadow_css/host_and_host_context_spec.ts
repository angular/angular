/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {shim} from './utils';

describe('ShadowCss, :host and :host-context', () => {
  describe((':host'), () => {
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

    it('should handle multiple tag selectors', () => {
      expect(shim(':host(ul,li) {}', 'contenta', 'a-host')).toEqualCss('ul[a-host], li[a-host] {}');
      expect(shim(':host(ul,li) > .z {}', 'contenta', 'a-host'))
          .toEqualCss('ul[a-host] > .z[contenta], li[a-host] > .z[contenta] {}');
    });

    it('should handle compound class selectors', () => {
      expect(shim(':host(.a.b) {}', 'contenta', 'a-host')).toEqualCss('.a.b[a-host] {}');
    });

    it('should handle multiple class selectors', () => {
      expect(shim(':host(.x,.y) {}', 'contenta', 'a-host')).toEqualCss('.x[a-host], .y[a-host] {}');
      expect(shim(':host(.x,.y) > .z {}', 'contenta', 'a-host'))
          .toEqualCss('.x[a-host] > .z[contenta], .y[a-host] > .z[contenta] {}');
    });

    it('should handle multiple attribute selectors', () => {
      expect(shim(':host([a="b"],[c=d]) {}', 'contenta', 'a-host'))
          .toEqualCss('[a="b"][a-host], [c=d][a-host] {}');
    });

    it('should handle pseudo selectors', () => {
      expect(shim(':host(:before) {}', 'contenta', 'a-host')).toEqualCss('[a-host]:before {}');
      expect(shim(':host:before {}', 'contenta', 'a-host')).toEqualCss('[a-host]:before {}');
      expect(shim(':host:nth-child(8n+1) {}', 'contenta', 'a-host'))
          .toEqualCss('[a-host]:nth-child(8n+1) {}');
      expect(shim(':host:nth-of-type(8n+1) {}', 'contenta', 'a-host'))
          .toEqualCss('[a-host]:nth-of-type(8n+1) {}');
      expect(shim(':host(.class):before {}', 'contenta', 'a-host'))
          .toEqualCss('.class[a-host]:before {}');
      expect(shim(':host.class:before {}', 'contenta', 'a-host'))
          .toEqualCss('.class[a-host]:before {}');
      expect(shim(':host(:not(p)):before {}', 'contenta', 'a-host'))
          .toEqualCss('[a-host]:not(p):before {}');
    });

    // see b/63672152
    it('should handle unexpected selectors in the most reasonable way', () => {
      expect(shim('cmp:host {}', 'contenta', 'a-host')).toEqualCss('cmp[a-host] {}');
      expect(shim('cmp:host >>> {}', 'contenta', 'a-host')).toEqualCss('cmp[a-host] {}');
      expect(shim('cmp:host child {}', 'contenta', 'a-host'))
          .toEqualCss('cmp[a-host] child[contenta] {}');
      expect(shim('cmp:host >>> child {}', 'contenta', 'a-host'))
          .toEqualCss('cmp[a-host] child {}');
      expect(shim('cmp :host {}', 'contenta', 'a-host')).toEqualCss('cmp [a-host] {}');
      expect(shim('cmp :host >>> {}', 'contenta', 'a-host')).toEqualCss('cmp [a-host] {}');
      expect(shim('cmp :host child {}', 'contenta', 'a-host'))
          .toEqualCss('cmp [a-host] child[contenta] {}');
      expect(shim('cmp :host >>> child {}', 'contenta', 'a-host'))
          .toEqualCss('cmp [a-host] child {}');
    });
  });

  describe((':host-context'), () => {
    it('should handle tag selector', () => {
      expect(shim(':host-context(div) {}', 'contenta', 'a-host'))
          .toEqualCss('div[a-host], div [a-host] {}');
      expect(shim(':host-context(ul) > .y {}', 'contenta', 'a-host'))
          .toEqualCss('ul[a-host] > .y[contenta], ul [a-host] > .y[contenta] {}');
    });

    it('should handle class selector', () => {
      expect(shim(':host-context(.x) {}', 'contenta', 'a-host'))
          .toEqualCss('.x[a-host], .x [a-host] {}');

      expect(shim(':host-context(.x) > .y {}', 'contenta', 'a-host'))
          .toEqualCss('.x[a-host] > .y[contenta], .x [a-host] > .y[contenta] {}');
    });

    it('should handle attribute selector', () => {
      expect(shim(':host-context([a="b"]) {}', 'contenta', 'a-host'))
          .toEqualCss('[a="b"][a-host], [a="b"] [a-host] {}');
      expect(shim(':host-context([a=b]) {}', 'contenta', 'a-host'))
          .toEqualCss('[a=b][a-host], [a=b] [a-host] {}');
    });

    it('should handle multiple :host-context() selectors', () => {
      expect(shim(':host-context(.one):host-context(.two) {}', 'contenta', 'a-host'))
          .toEqualCss(
              '.one.two[a-host], ' +    // `one` and `two` both on the host
              '.one.two [a-host], ' +   // `one` and `two` are both on the same ancestor
              '.one .two[a-host], ' +   // `one` is an ancestor and `two` is on the host
              '.one .two [a-host], ' +  // `one` and `two` are both ancestors (in that order)
              '.two .one[a-host], ' +   // `two` is an ancestor and `one` is on the host
              '.two .one [a-host]' +    // `two` and `one` are both ancestors (in that order)
              ' {}');

      expect(shim(':host-context(.X):host-context(.Y):host-context(.Z) {}', 'contenta', 'a-host'))
          .toEqualCss(
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
              '{}');
    });

    // It is not clear what the behavior should be for a `:host-context` with no selectors.
    // This test is checking that the result is backward compatible with previous behavior.
    // Arguably it should actually be an error that should be reported.
    it('should handle :host-context with no ancestor selectors', () => {
      expect(shim(':host-context .inner {}', 'contenta', 'a-host'))
          .toEqualCss('[a-host] .inner[contenta] {}');
      expect(shim(':host-context() .inner {}', 'contenta', 'a-host'))
          .toEqualCss('[a-host] .inner[contenta] {}');
    });

    // More than one selector such as this is not valid as part of the :host-context spec.
    // This test is checking that the result is backward compatible with previous behavior.
    // Arguably it should actually be an error that should be reported.
    it('should handle selectors', () => {
      expect(shim(':host-context(.one,.two) .inner {}', 'contenta', 'a-host'))
          .toEqualCss(
              '.one[a-host] .inner[contenta], ' +
              '.one [a-host] .inner[contenta], ' +
              '.two[a-host] .inner[contenta], ' +
              '.two [a-host] .inner[contenta] ' +
              '{}');
    });
  });

  describe((':host-context and :host combination selector'), () => {
    it('should handle selectors on the same element', () => {
      expect(shim(':host-context(div):host(.x) > .y {}', 'contenta', 'a-host'))
          .toEqualCss('div.x[a-host] > .y[contenta] {}');
    });

    it('should handle selectors on different elements', () => {
      expect(shim(':host-context(div) :host(.x) > .y {}', 'contenta', 'a-host'))
          .toEqualCss('div .x[a-host] > .y[contenta] {}');

      expect(shim(':host-context(div) > :host(.x) > .y {}', 'contenta', 'a-host'))
          .toEqualCss('div > .x[a-host] > .y[contenta] {}');
    });

    it('should parse multiple rules containing :host-context and :host', () => {
      const input = `
            :host-context(outer1) :host(bar) {}
            :host-context(outer2) :host(foo) {}
        `;
      expect(shim(input, 'contenta', 'a-host'))
          .toEqualCss(

              'outer1 bar[a-host] {} ' +
              'outer2 foo[a-host] {}');
    });
  });
});
