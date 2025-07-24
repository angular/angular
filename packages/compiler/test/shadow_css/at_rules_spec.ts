/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {shim} from './utils';

describe('ShadowCss, at-rules', () => {
  describe('@media', () => {
    it('should handle media rules with simple rules', () => {
      const css = '@media screen and (max-width: 800px) {div {font-size: 50px;}} div {}';
      const expected =
        '@media screen and (max-width:800px) {div[contenta] {font-size:50px;}} div[contenta] {}';
      expect(shim(css, 'contenta')).toEqualCss(expected);
    });

    it('should handle media rules with both width and height', () => {
      const css = '@media screen and (max-width:800px, max-height:100%) {div {font-size:50px;}}';
      const expected =
        '@media screen and (max-width:800px, max-height:100%) {div[contenta] {font-size:50px;}}';
      expect(shim(css, 'contenta')).toEqualCss(expected);
    });
  });

  describe('@page', () => {
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
      const result = shim(css, contentAttr);
      expect(result).toEqualCss(css);
      expect(result).not.toContain(contentAttr);
    });

    it('should strip ::ng-deep and :host from within @page rules', () => {
      expect(shim('@page { margin-right: 4in; }', 'contenta', 'h')).toEqualCss(
        '@page { margin-right:4in;}',
      );
      expect(
        shim('@page { ::ng-deep @top-left { content: "Hamlet";}}', 'contenta', 'h'),
      ).toEqualCss('@page { @top-left { content:"Hamlet";}}');
      expect(
        shim('@page { :host ::ng-deep @top-left { content:"Hamlet";}}', 'contenta', 'h'),
      ).toEqualCss('@page { @top-left { content:"Hamlet";}}');
    });
  });

  describe('@supports', () => {
    it('should handle support rules', () => {
      const css = '@supports (display: flex) {section {display: flex;}}';
      const expected = '@supports (display:flex) {section[contenta] {display:flex;}}';
      expect(shim(css, 'contenta')).toEqualCss(expected);
    });

    it('should strip ::ng-deep and :host from within @supports', () => {
      expect(
        shim(
          '@supports (display: flex) { @font-face { :host ::ng-deep font-family{} } }',
          'contenta',
          'h',
        ),
      ).toEqualCss('@supports (display:flex) { @font-face { font-family{}}}');
    });
  });

  describe('@font-face', () => {
    it('should strip ::ng-deep and :host from within @font-face', () => {
      expect(shim('@font-face { font-family {} }', 'contenta', 'h')).toEqualCss(
        '@font-face { font-family {}}',
      );
      expect(shim('@font-face { ::ng-deep font-family{} }', 'contenta', 'h')).toEqualCss(
        '@font-face { font-family{}}',
      );
      expect(shim('@font-face { :host ::ng-deep font-family{} }', 'contenta', 'h')).toEqualCss(
        '@font-face { font-family{}}',
      );
    });
  });

  describe('@import', () => {
    it('should pass through @import directives', () => {
      const styleStr = '@import url("https://fonts.googleapis.com/css?family=Roboto");';
      const css = shim(styleStr, 'contenta');
      expect(css).toEqualCss(styleStr);
    });

    it('should shim rules after @import', () => {
      const styleStr = '@import url("a"); div {}';
      const css = shim(styleStr, 'contenta');
      expect(css).toEqualCss('@import url("a"); div[contenta] {}');
    });

    it('should shim rules with quoted content after @import', () => {
      const styleStr = '@import url("a"); div {background-image: url("a.jpg"); color: red;}';
      const css = shim(styleStr, 'contenta');
      expect(css).toEqualCss(
        '@import url("a"); div[contenta] {background-image:url("a.jpg"); color:red;}',
      );
    });

    it('should pass through @import directives whose URL contains colons and semicolons', () => {
      const styleStr =
        '@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap");';
      const css = shim(styleStr, 'contenta');
      expect(css).toEqualCss(styleStr);
    });

    it('should shim rules after @import with colons and semicolons', () => {
      const styleStr =
        '@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap"); div {}';
      const css = shim(styleStr, 'contenta');
      expect(css).toEqualCss(
        '@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap"); div[contenta] {}',
      );
    });
  });

  describe('@container', () => {
    it('should scope normal selectors inside an unnamed container rules', () => {
      const css = `@container max(max-width: 500px) {
               .item {
                 color: red;
               }
             }`;
      const result = shim(css, 'host-a');
      expect(result).toEqualCss(`
        @container max(max-width: 500px) {
           .item[host-a] {
             color: red;
           }
         }`);
    });

    it('should scope normal selectors inside a named container rules', () => {
      const css = `
          @container container max(max-width: 500px) {
               .item {
                 color: red;
               }
          }`;
      const result = shim(css, 'host-a');
      // Note that for the time being we are not scoping the container name itself,
      // this is something that may or may not be done in the future depending
      // on how the css specs evolve. Currently as of Chrome 107 it looks like shadowDom
      // boundaries don't effect container queries (thus the scoping wouldn't be needed)
      // and this aspect of container queries seems to be still under active discussion:
      // https://github.com/w3c/csswg-drafts/issues/5984
      expect(result).toEqualCss(`
        @container container max(max-width: 500px) {
          .item[host-a] {
            color: red;
          }
        }`);
    });
  });

  describe('@scope', () => {
    it('should scope normal selectors inside a scope rule with scoping limits', () => {
      const css = `
          @scope (.media-object) to (.content > *) {
              img { border-radius: 50%; }
              .content { padding: 1em; }
          }`;
      const result = shim(css, 'host-a');
      expect(result).toEqualCss(`
        @scope (.media-object) to (.content > *) {
          img[host-a] { border-radius: 50%; }
          .content[host-a] { padding: 1em; }
        }`);
    });

    it('should scope normal selectors inside a scope rule', () => {
      const css = `
          @scope (.light-scheme) {
              a { color: darkmagenta; }
          }`;
      const result = shim(css, 'host-a');
      expect(result).toEqualCss(`
        @scope (.light-scheme) {
          a[host-a] { color: darkmagenta; }
        }`);
    });
  });

  describe('@document', () => {
    it('should handle document rules', () => {
      const css = '@document url(http://www.w3.org/) {div {font-size:50px;}}';
      const expected = '@document url(http://www.w3.org/) {div[contenta] {font-size:50px;}}';
      expect(shim(css, 'contenta')).toEqualCss(expected);
    });
  });

  describe('@layer', () => {
    it('should handle layer rules', () => {
      const css = '@layer utilities {section {display: flex;}}';
      const expected = '@layer utilities {section[contenta] {display:flex;}}';
      expect(shim(css, 'contenta')).toEqualCss(expected);
    });
  });

  describe('@starting-style', () => {
    it('should scope normal selectors inside a starting-style rule', () => {
      const css = `
          @starting-style {
              img { border-radius: 50%; }
              .content { padding: 1em; }
          }`;
      const result = shim(css, 'host-a');
      expect(result).toEqualCss(`
        @starting-style {
          img[host-a] { border-radius: 50%; }
          .content[host-a] { padding: 1em; }
        }`);
    });
  });
});
