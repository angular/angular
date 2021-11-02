/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CssRule, processRules, repeatGroups, ShadowCss} from '@angular/compiler/src/shadow_css';
import {normalizeCSS} from '@angular/platform-browser/testing/src/browser_util';

{
  describe('ShadowCss', () => {
    function s(css: string, contentAttr: string, hostAttr: string = '') {
      const shadowCss = new ShadowCss();
      const shim = shadowCss.shimCssText(css, contentAttr, hostAttr);
      return normalize(shim);
    }

    function normalize(value: string): string {
      return normalizeCSS(value.replace(/\n/g, '')).trim();
    }

    it('should handle empty string', () => {
      expect(s('', 'contenta')).toEqual('');
    });

    it('should add an attribute to every rule', () => {
      const css = 'one {color: red;}two {color: red;}';
      const expected = 'one[contenta] {color:red;}two[contenta] {color:red;}';
      expect(s(css, 'contenta')).toEqual(expected);
    });

    it('should handle invalid css', () => {
      const css = 'one {color: red;}garbage';
      const expected = 'one[contenta] {color:red;}garbage';
      expect(s(css, 'contenta')).toEqual(expected);
    });

    it('should add an attribute to every selector', () => {
      const css = 'one, two {color: red;}';
      const expected = 'one[contenta], two[contenta] {color:red;}';
      expect(s(css, 'contenta')).toEqual(expected);
    });

    it('should support newlines in the selector and content ', () => {
      const css = 'one, \ntwo {\ncolor: red;}';
      const expected = 'one[contenta], two[contenta] {color:red;}';
      expect(s(css, 'contenta')).toEqual(expected);
    });

    it('should handle media rules', () => {
      const css = '@media screen and (max-width:800px, max-height:100%) {div {font-size:50px;}}';
      const expected =
          '@media screen and (max-width:800px, max-height:100%) {div[contenta] {font-size:50px;}}';
      expect(s(css, 'contenta')).toEqual(expected);
    });

    // @page rules use a special set of at-rules and selectors and they can't be scoped.
    // See: https://www.w3.org/TR/css-page-3
    it('should preserve @page rules', () => {
      const contentAttr = 'contenta';
      const css = `
        @page {
          margin-right: 4in;

          @top-left {
            content: "Hamlet";
          }

          @top-right {
            content: "Page " counter(page);
          }
        }

        @page main {
          margin-left: 4in;
        }

        @page :left {
          margin-left: 3cm;
          margin-right: 4cm;
        }

        @page :right {
          margin-left: 4cm;
          margin-right: 3cm;
        }
      `;
      const result = s(css, contentAttr);
      expect(result).toEqual(normalize(css));
      expect(result).not.toContain(contentAttr);
    });

    it('should strip ::ng-deep and :host from within @page rules', () => {
      expect(s('@page { margin-right: 4in; }', 'contenta', 'h'))
          .toEqual('@page { margin-right:4in;}');
      expect(s('@page { ::ng-deep @top-left { content: "Hamlet";}}', 'contenta', 'h'))
          .toEqual('@page { @top-left { content:"Hamlet";}}');
      expect(s('@page { :host ::ng-deep @top-left { content:"Hamlet";}}', 'contenta', 'h'))
          .toEqual('@page { @top-left { content:"Hamlet";}}');
    });

    it('should handle document rules', () => {
      const css = '@document url(http://www.w3.org/) {div {font-size:50px;}}';
      const expected = '@document url(http://www.w3.org/) {div[contenta] {font-size:50px;}}';
      expect(s(css, 'contenta')).toEqual(expected);
    });

    it('should handle media rules with simple rules', () => {
      const css = '@media screen and (max-width: 800px) {div {font-size: 50px;}} div {}';
      const expected =
          '@media screen and (max-width:800px) {div[contenta] {font-size:50px;}} div[contenta] {}';
      expect(s(css, 'contenta')).toEqual(expected);
    });

    it('should handle support rules', () => {
      const css = '@supports (display: flex) {section {display: flex;}}';
      const expected = '@supports (display:flex) {section[contenta] {display:flex;}}';
      expect(s(css, 'contenta')).toEqual(expected);
    });

    // Check that the browser supports unprefixed CSS animation
    it('should handle keyframes rules', () => {
      const css = '@keyframes foo {0% {transform:translate(-50%) scaleX(0);}}';
      expect(s(css, 'contenta')).toEqual(css);
    });

    it('should handle -webkit-keyframes rules', () => {
      const css = '@-webkit-keyframes foo {0% {-webkit-transform:translate(-50%) scaleX(0);}}';
      expect(s(css, 'contenta')).toEqual(css);
    });

    it('should handle complicated selectors', () => {
      expect(s('one::before {}', 'contenta')).toEqual('one[contenta]::before {}');
      expect(s('one two {}', 'contenta')).toEqual('one[contenta] two[contenta] {}');
      expect(s('one > two {}', 'contenta')).toEqual('one[contenta] > two[contenta] {}');
      expect(s('one + two {}', 'contenta')).toEqual('one[contenta] + two[contenta] {}');
      expect(s('one ~ two {}', 'contenta')).toEqual('one[contenta] ~ two[contenta] {}');
      const res = s('.one.two > three {}', 'contenta');  // IE swap classes
      expect(
          res == '.one.two[contenta] > three[contenta] {}' ||
          res == '.two.one[contenta] > three[contenta] {}')
          .toEqual(true);
      expect(s('one[attr="value"] {}', 'contenta')).toEqual('one[attr="value"][contenta] {}');
      expect(s('one[attr=value] {}', 'contenta')).toEqual('one[attr="value"][contenta] {}');
      expect(s('one[attr^="value"] {}', 'contenta')).toEqual('one[attr^="value"][contenta] {}');
      expect(s('one[attr$="value"] {}', 'contenta')).toEqual('one[attr$="value"][contenta] {}');
      expect(s('one[attr*="value"] {}', 'contenta')).toEqual('one[attr*="value"][contenta] {}');
      expect(s('one[attr|="value"] {}', 'contenta')).toEqual('one[attr|="value"][contenta] {}');
      expect(s('one[attr~="value"] {}', 'contenta')).toEqual('one[attr~="value"][contenta] {}');
      expect(s('one[attr="va lue"] {}', 'contenta')).toEqual('one[attr="va lue"][contenta] {}');
      expect(s('one[attr] {}', 'contenta')).toEqual('one[attr][contenta] {}');
      expect(s('[is="one"] {}', 'contenta')).toEqual('[is="one"][contenta] {}');
    });

    it('should handle escaped sequences in selectors', () => {
      expect(s('one\\/two {}', 'contenta')).toEqual('one\\/two[contenta] {}');
      expect(s('one\\:two {}', 'contenta')).toEqual('one\\:two[contenta] {}');
      expect(s('one\\\\:two {}', 'contenta')).toEqual('one\\\\[contenta]:two {}');
      expect(s('.one\\:two {}', 'contenta')).toEqual('.one\\:two[contenta] {}');
      expect(s('.one\\:two .three\\:four {}', 'contenta'))
          .toEqual('.one\\:two[contenta] .three\\:four[contenta] {}');
    });

    describe((':host'), () => {
      it('should handle no context', () => {
        expect(s(':host {}', 'contenta', 'a-host')).toEqual('[a-host] {}');
      });

      it('should handle tag selector', () => {
        expect(s(':host(ul) {}', 'contenta', 'a-host')).toEqual('ul[a-host] {}');
      });

      it('should handle class selector', () => {
        expect(s(':host(.x) {}', 'contenta', 'a-host')).toEqual('.x[a-host] {}');
      });

      it('should handle attribute selector', () => {
        expect(s(':host([a="b"]) {}', 'contenta', 'a-host')).toEqual('[a="b"][a-host] {}');
        expect(s(':host([a=b]) {}', 'contenta', 'a-host')).toEqual('[a="b"][a-host] {}');
      });

      it('should handle multiple tag selectors', () => {
        expect(s(':host(ul,li) {}', 'contenta', 'a-host')).toEqual('ul[a-host], li[a-host] {}');
        expect(s(':host(ul,li) > .z {}', 'contenta', 'a-host'))
            .toEqual('ul[a-host] > .z[contenta], li[a-host] > .z[contenta] {}');
      });

      it('should handle compound class selectors', () => {
        expect(s(':host(.a.b) {}', 'contenta', 'a-host')).toEqual('.a.b[a-host] {}');
      });

      it('should handle multiple class selectors', () => {
        expect(s(':host(.x,.y) {}', 'contenta', 'a-host')).toEqual('.x[a-host], .y[a-host] {}');
        expect(s(':host(.x,.y) > .z {}', 'contenta', 'a-host'))
            .toEqual('.x[a-host] > .z[contenta], .y[a-host] > .z[contenta] {}');
      });

      it('should handle multiple attribute selectors', () => {
        expect(s(':host([a="b"],[c=d]) {}', 'contenta', 'a-host'))
            .toEqual('[a="b"][a-host], [c="d"][a-host] {}');
      });

      it('should handle pseudo selectors', () => {
        expect(s(':host(:before) {}', 'contenta', 'a-host')).toEqual('[a-host]:before {}');
        expect(s(':host:before {}', 'contenta', 'a-host')).toEqual('[a-host]:before {}');
        expect(s(':host:nth-child(8n+1) {}', 'contenta', 'a-host'))
            .toEqual('[a-host]:nth-child(8n+1) {}');
        expect(s(':host:nth-of-type(8n+1) {}', 'contenta', 'a-host'))
            .toEqual('[a-host]:nth-of-type(8n+1) {}');
        expect(s(':host(.class):before {}', 'contenta', 'a-host'))
            .toEqual('.class[a-host]:before {}');
        expect(s(':host.class:before {}', 'contenta', 'a-host'))
            .toEqual('.class[a-host]:before {}');
        expect(s(':host(:not(p)):before {}', 'contenta', 'a-host'))
            .toEqual('[a-host]:not(p):before {}');
      });

      // see b/63672152
      it('should handle unexpected selectors in the most reasonable way', () => {
        expect(s('cmp:host {}', 'contenta', 'a-host')).toEqual('cmp[a-host] {}');
        expect(s('cmp:host >>> {}', 'contenta', 'a-host')).toEqual('cmp[a-host] {}');
        expect(s('cmp:host child {}', 'contenta', 'a-host'))
            .toEqual('cmp[a-host] child[contenta] {}');
        expect(s('cmp:host >>> child {}', 'contenta', 'a-host')).toEqual('cmp[a-host] child {}');
        expect(s('cmp :host {}', 'contenta', 'a-host')).toEqual('cmp [a-host] {}');
        expect(s('cmp :host >>> {}', 'contenta', 'a-host')).toEqual('cmp [a-host] {}');
        expect(s('cmp :host child {}', 'contenta', 'a-host'))
            .toEqual('cmp [a-host] child[contenta] {}');
        expect(s('cmp :host >>> child {}', 'contenta', 'a-host')).toEqual('cmp [a-host] child {}');
      });
    });

    describe((':host-context'), () => {
      it('should handle tag selector', () => {
        expect(s(':host-context(div) {}', 'contenta', 'a-host'))
            .toEqual('div[a-host], div [a-host] {}');
        expect(s(':host-context(ul) > .y {}', 'contenta', 'a-host'))
            .toEqual('ul[a-host] > .y[contenta], ul [a-host] > .y[contenta] {}');
      });

      it('should handle class selector', () => {
        expect(s(':host-context(.x) {}', 'contenta', 'a-host'))
            .toEqual('.x[a-host], .x [a-host] {}');

        expect(s(':host-context(.x) > .y {}', 'contenta', 'a-host'))
            .toEqual('.x[a-host] > .y[contenta], .x [a-host] > .y[contenta] {}');
      });

      it('should handle attribute selector', () => {
        expect(s(':host-context([a="b"]) {}', 'contenta', 'a-host'))
            .toEqual('[a="b"][a-host], [a="b"] [a-host] {}');
        expect(s(':host-context([a=b]) {}', 'contenta', 'a-host'))
            .toEqual('[a=b][a-host], [a="b"] [a-host] {}');
      });

      it('should handle multiple :host-context() selectors', () => {
        expect(s(':host-context(.one):host-context(.two) {}', 'contenta', 'a-host'))
            .toEqual(
                '.one.two[a-host], ' +    // `one` and `two` both on the host
                '.one.two [a-host], ' +   // `one` and `two` are both on the same ancestor
                '.one .two[a-host], ' +   // `one` is an ancestor and `two` is on the host
                '.one .two [a-host], ' +  // `one` and `two` are both ancestors (in that order)
                '.two .one[a-host], ' +   // `two` is an ancestor and `one` is on the host
                '.two .one [a-host]' +    // `two` and `one` are both ancestors (in that order)
                ' {}');

        expect(s(':host-context(.X):host-context(.Y):host-context(.Z) {}', 'contenta', 'a-host')
                   .replace(/ \{\}$/, '')
                   .split(/\,\s+/))
            .toEqual([
              '.X.Y.Z[a-host]',
              '.X.Y.Z [a-host]',
              '.X.Y .Z[a-host]',
              '.X.Y .Z [a-host]',
              '.X.Z .Y[a-host]',
              '.X.Z .Y [a-host]',
              '.X .Y.Z[a-host]',
              '.X .Y.Z [a-host]',
              '.X .Y .Z[a-host]',
              '.X .Y .Z [a-host]',
              '.X .Z .Y[a-host]',
              '.X .Z .Y [a-host]',
              '.Y.Z .X[a-host]',
              '.Y.Z .X [a-host]',
              '.Y .Z .X[a-host]',
              '.Y .Z .X [a-host]',
              '.Z .Y .X[a-host]',
              '.Z .Y .X [a-host]',
            ]);
      });

      // It is not clear what the behavior should be for a `:host-context` with no selectors.
      // This test is checking that the result is backward compatible with previous behavior.
      // Arguably it should actually be an error that should be reported.
      it('should handle :host-context with no ancestor selectors', () => {
        expect(s(':host-context .inner {}', 'contenta', 'a-host'))
            .toEqual('[a-host] .inner[contenta] {}');
        expect(s(':host-context() .inner {}', 'contenta', 'a-host'))
            .toEqual('[a-host] .inner[contenta] {}');
      });

      // More than one selector such as this is not valid as part of the :host-context spec.
      // This test is checking that the result is backward compatible with previous behavior.
      // Arguably it should actually be an error that should be reported.
      it('should handle selectors', () => {
        expect(s(':host-context(.one,.two) .inner {}', 'contenta', 'a-host'))
            .toEqual(
                '.one[a-host] .inner[contenta], ' +
                '.one [a-host] .inner[contenta], ' +
                '.two[a-host] .inner[contenta], ' +
                '.two [a-host] .inner[contenta] ' +
                '{}');
      });
    });

    describe((':host-context and :host combination selector'), () => {
      it('should handle selectors on the same element', () => {
        expect(s(':host-context(div):host(.x) > .y {}', 'contenta', 'a-host'))
            .toEqual('div.x[a-host] > .y[contenta] {}');
      });

      it('should handle selectors on different elements', () => {
        expect(s(':host-context(div) :host(.x) > .y {}', 'contenta', 'a-host'))
            .toEqual('div .x[a-host] > .y[contenta] {}');

        expect(s(':host-context(div) > :host(.x) > .y {}', 'contenta', 'a-host'))
            .toEqual('div > .x[a-host] > .y[contenta] {}');
      });

      it('should parse multiple rules containing :host-context and :host', () => {
        const input = `
            :host-context(outer1) :host(bar) {}
            :host-context(outer2) :host(foo) {}
        `;
        expect(s(input, 'contenta', 'a-host'))
            .toEqual(
                'outer1 bar[a-host] {} ' +
                'outer2 foo[a-host] {}');
      });
    });

    it('should support polyfill-next-selector', () => {
      let css = s('polyfill-next-selector {content: \'x > y\'} z {}', 'contenta');
      expect(css).toEqual('x[contenta] > y[contenta]{}');

      css = s('polyfill-next-selector {content: "x > y"} z {}', 'contenta');
      expect(css).toEqual('x[contenta] > y[contenta]{}');

      css = s(`polyfill-next-selector {content: 'button[priority="1"]'} z {}`, 'contenta');
      expect(css).toEqual('button[priority="1"][contenta]{}');
    });

    it('should support polyfill-unscoped-rule', () => {
      let css = s('polyfill-unscoped-rule {content: \'#menu > .bar\';color: blue;}', 'contenta');
      expect(css).toContain('#menu > .bar {;color:blue;}');

      css = s('polyfill-unscoped-rule {content: "#menu > .bar";color: blue;}', 'contenta');
      expect(css).toContain('#menu > .bar {;color:blue;}');

      css = s(`polyfill-unscoped-rule {content: 'button[priority="1"]'}`, 'contenta');
      expect(css).toContain('button[priority="1"] {}');
    });

    it('should support multiple instances polyfill-unscoped-rule', () => {
      const css =
          s('polyfill-unscoped-rule {content: \'foo\';color: blue;}' +
                'polyfill-unscoped-rule {content: \'bar\';color: blue;}',
            'contenta');
      expect(css).toContain('foo {;color:blue;}');
      expect(css).toContain('bar {;color:blue;}');
    });

    it('should support polyfill-rule', () => {
      let css = s('polyfill-rule {content: \':host.foo .bar\';color: blue;}', 'contenta', 'a-host');
      expect(css).toEqual('.foo[a-host] .bar[contenta] {;color:blue;}');

      css = s('polyfill-rule {content: ":host.foo .bar";color:blue;}', 'contenta', 'a-host');
      expect(css).toEqual('.foo[a-host] .bar[contenta] {;color:blue;}');

      css = s(`polyfill-rule {content: 'button[priority="1"]'}`, 'contenta', 'a-host');
      expect(css).toEqual('button[priority="1"][contenta] {}');
    });

    it('should handle ::shadow', () => {
      const css = s('x::shadow > y {}', 'contenta');
      expect(css).toEqual('x[contenta] > y[contenta] {}');
    });

    it('should handle /deep/', () => {
      const css = s('x /deep/ y {}', 'contenta');
      expect(css).toEqual('x[contenta] y {}');
    });

    it('should handle >>>', () => {
      const css = s('x >>> y {}', 'contenta');
      expect(css).toEqual('x[contenta] y {}');
    });

    it('should handle ::ng-deep', () => {
      let css = '::ng-deep y {}';
      expect(s(css, 'contenta')).toEqual('y {}');
      css = 'x ::ng-deep y {}';
      expect(s(css, 'contenta')).toEqual('x[contenta] y {}');
      css = ':host > ::ng-deep .x {}';
      expect(s(css, 'contenta', 'h')).toEqual('[h] > .x {}');
      css = ':host ::ng-deep > .x {}';
      expect(s(css, 'contenta', 'h')).toEqual('[h] > .x {}');
      css = ':host > ::ng-deep > .x {}';
      expect(s(css, 'contenta', 'h')).toEqual('[h] > > .x {}');
    });

    it('should strip ::ng-deep and :host from within @font-face', () => {
      expect(s('@font-face { font-family {} }', 'contenta', 'h'))
          .toEqual('@font-face { font-family {}}');
      expect(s('@font-face { ::ng-deep font-family{} }', 'contenta', 'h'))
          .toEqual('@font-face { font-family{}}');
      expect(s('@font-face { :host ::ng-deep font-family{} }', 'contenta', 'h'))
          .toEqual('@font-face { font-family{}}');
      expect(s('@supports (display: flex) { @font-face { :host ::ng-deep font-family{} } }',
               'contenta', 'h'))
          .toEqual('@supports (display:flex) { @font-face { font-family{}}}');
    });

    it('should pass through @import directives', () => {
      const styleStr = '@import url("https://fonts.googleapis.com/css?family=Roboto");';
      const css = s(styleStr, 'contenta');
      expect(css).toEqual(styleStr);
    });

    it('should shim rules after @import', () => {
      const styleStr = '@import url("a"); div {}';
      const css = s(styleStr, 'contenta');
      expect(css).toEqual('@import url("a"); div[contenta] {}');
    });

    it('should shim rules with quoted content after @import', () => {
      const styleStr = '@import url("a"); div {background-image: url("a.jpg"); color: red;}';
      const css = s(styleStr, 'contenta');
      expect(css).toEqual(
          '@import url("a"); div[contenta] {background-image:url("a.jpg"); color:red;}');
    });

    it('should pass through @import directives whose URL contains colons and semicolons', () => {
      const styleStr =
          '@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap");';
      const css = s(styleStr, 'contenta');
      expect(css).toEqual(styleStr);
    });

    it('should shim rules after @import with colons and semicolons', () => {
      const styleStr =
          '@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap"); div {}';
      const css = s(styleStr, 'contenta');
      expect(css).toEqual(
          '@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap"); div[contenta] {}');
    });

    it('should leave calc() unchanged', () => {
      const styleStr = 'div {height:calc(100% - 55px);}';
      const css = s(styleStr, 'contenta');
      expect(css).toEqual('div[contenta] {height:calc(100% - 55px);}');
    });

    it('should strip comments', () => {
      expect(s('/* x */b {c}', 'contenta')).toEqual('b[contenta] {c}');
    });

    it('should ignore special characters in comments', () => {
      expect(s('/* {;, */b {c}', 'contenta')).toEqual('b[contenta] {c}');
    });

    it('should support multiline comments', () => {
      expect(s('/* \n */b {c}', 'contenta')).toEqual('b[contenta] {c}');
    });

    it('should keep sourceMappingURL comments', () => {
      expect(s('b {c}/*# sourceMappingURL=data:x */', 'contenta'))
          .toEqual('b[contenta] {c}/*# sourceMappingURL=data:x */');
      expect(s('b {c}/* #sourceMappingURL=data:x */', 'contenta'))
          .toEqual('b[contenta] {c}/* #sourceMappingURL=data:x */');
    });

    it('should keep sourceURL comments', () => {
      expect(s('/*# sourceMappingURL=data:x */b {c}/*# sourceURL=xxx */', 'contenta'))
          .toEqual('b[contenta] {c}/*# sourceMappingURL=data:x *//*# sourceURL=xxx */');
    });

    it('should shim rules with quoted content', () => {
      const styleStr = 'div {background-image: url("a.jpg"); color: red;}';
      const css = s(styleStr, 'contenta');
      expect(css).toEqual('div[contenta] {background-image:url("a.jpg"); color:red;}');
    });

    it('should shim rules with an escaped quote inside quoted content', () => {
      const styleStr = 'div::after { content: "\\"" }';
      const css = s(styleStr, 'contenta');
      expect(css).toEqual('div[contenta]::after { content:"\\""}');
    });

    it('should shim rules with curly braces inside quoted content', () => {
      const styleStr = 'div::after { content: "{}" }';
      const css = s(styleStr, 'contenta');
      expect(css).toEqual('div[contenta]::after { content:"{}"}');
    });
  });

  describe('processRules', () => {
    describe('parse rules', () => {
      function captureRules(input: string): CssRule[] {
        const result: CssRule[] = [];
        processRules(input, (cssRule) => {
          result.push(cssRule);
          return cssRule;
        });
        return result;
      }

      it('should work with empty css', () => {
        expect(captureRules('')).toEqual([]);
      });

      it('should capture a rule without body', () => {
        expect(captureRules('a;')).toEqual([new CssRule('a', '')]);
      });

      it('should capture css rules with body', () => {
        expect(captureRules('a {b}')).toEqual([new CssRule('a', 'b')]);
      });

      it('should capture css rules with nested rules', () => {
        expect(captureRules('a {b {c}} d {e}')).toEqual([
          new CssRule('a', 'b {c}'),
          new CssRule('d', 'e'),
        ]);
      });

      it('should capture multiple rules where some have no body', () => {
        expect(captureRules('@import a ; b {c}')).toEqual([
          new CssRule('@import a', ''),
          new CssRule('b', 'c'),
        ]);
      });
    });

    describe('modify rules', () => {
      it('should allow to change the selector while preserving whitespaces', () => {
        expect(processRules(
                   '@import a; b {c {d}} e {f}',
                   (cssRule: CssRule) => new CssRule(cssRule.selector + '2', cssRule.content)))
            .toEqual('@import a2; b2 {c {d}} e2 {f}');
      });

      it('should allow to change the content', () => {
        expect(processRules(
                   'a {b}',
                   (cssRule: CssRule) => new CssRule(cssRule.selector, cssRule.content + '2')))
            .toEqual('a {b2}');
      });
    });
  });

  describe('repeatGroups()', () => {
    it('should do nothing if `multiples` is 0', () => {
      const groups = [['a1', 'b1', 'c1'], ['a2', 'b2', 'c2']];
      repeatGroups(groups, 0);
      expect(groups).toEqual([['a1', 'b1', 'c1'], ['a2', 'b2', 'c2']]);
    });

    it('should do nothing if `multiples` is 1', () => {
      const groups = [['a1', 'b1', 'c1'], ['a2', 'b2', 'c2']];
      repeatGroups(groups, 1);
      expect(groups).toEqual([['a1', 'b1', 'c1'], ['a2', 'b2', 'c2']]);
    });

    it('should add clones of the original groups if `multiples` is greater than 1', () => {
      const group1 = ['a1', 'b1', 'c1'];
      const group2 = ['a2', 'b2', 'c2'];
      const groups = [group1, group2];
      repeatGroups(groups, 3);
      expect(groups).toEqual([group1, group2, group1, group2, group1, group2]);
      expect(groups[0]).toBe(group1);
      expect(groups[1]).toBe(group2);
      expect(groups[2]).not.toBe(group1);
      expect(groups[3]).not.toBe(group2);
      expect(groups[4]).not.toBe(group1);
      expect(groups[5]).not.toBe(group2);
    });
  });
}
