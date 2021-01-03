/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {extractStyleUrls, isStyleUrlResolvable} from '@angular/compiler/src/style_url_resolver';
import {UrlResolver} from '@angular/compiler/src/url_resolver';

{
  describe('extractStyleUrls', () => {
    let urlResolver: UrlResolver;

    beforeEach(() => {
      urlResolver = new UrlResolver();
    });

    it('should not resolve "url()" urls', () => {
      const css = `
      .foo {
        background-image: url("double.jpg");
        background-image: url('simple.jpg');
        background-image: url(noquote.jpg);
      }`;
      const resolvedCss = extractStyleUrls(urlResolver, 'http://ng.io', css).style;
      expect(resolvedCss).toEqual(css);
    });

    it('should extract "@import" urls', () => {
      const css = `
      @import '1.css';
      @import "2.css";
      `;
      const styleWithImports = extractStyleUrls(urlResolver, 'http://ng.io', css);
      expect(styleWithImports.style.trim()).toEqual('');
      expect(styleWithImports.styleUrls).toEqual(['http://ng.io/1.css', 'http://ng.io/2.css']);
    });

    it('should ignore "@import" in comments', () => {
      const css = `
      @import '1.css';
      /*@import '2.css';*/
      /*
      @import '3.css';
      */
      `;
      const styleWithImports = extractStyleUrls(urlResolver, 'http://ng.io', css);
      expect(styleWithImports.style.trim()).toEqual('');
      expect(styleWithImports.styleUrls).toContain('http://ng.io/1.css');
      expect(styleWithImports.styleUrls).not.toContain('http://ng.io/2.css');
      expect(styleWithImports.styleUrls).not.toContain('http://ng.io/3.css');
    });

    it('should keep /*# sourceURL... */ and /*# sourceMappingURL... */ comments', () => {
      const css =
          `/*regular comment*/\n/*# sourceURL=.... */\n/*# sourceMappingURL=... *//*#sourceMappingURL=... */`;
      const styleWithSourceMaps = extractStyleUrls(urlResolver, 'http://ng.io', css);
      expect(styleWithSourceMaps.style.trim())
          .toEqual('/*# sourceURL=.... */\n/*# sourceMappingURL=... *//*#sourceMappingURL=... */');
    });

    it('should extract "@import url()" urls', () => {
      const css = `
      @import url('3.css');
      @import url("4.css");
      @import url(5.css);
      `;
      const styleWithImports = extractStyleUrls(urlResolver, 'http://ng.io', css);
      expect(styleWithImports.style.trim()).toEqual('');
      expect(styleWithImports.styleUrls).toEqual([
        'http://ng.io/3.css', 'http://ng.io/4.css', 'http://ng.io/5.css'
      ]);
    });

    it('should extract "@import urls and keep rules in the same line', () => {
      const css = `@import url('some.css');div {color: red};`;
      const styleWithImports = extractStyleUrls(urlResolver, 'http://ng.io', css);
      expect(styleWithImports.style.trim()).toEqual('div {color: red};');
      expect(styleWithImports.styleUrls).toEqual(['http://ng.io/some.css']);
    });

    it('should extract media query in "@import"', () => {
      const css = `
      @import 'print1.css' print;
      @import url(print2.css) print;
      `;
      const styleWithImports = extractStyleUrls(urlResolver, 'http://ng.io', css);
      expect(styleWithImports.style.trim()).toEqual('');
      expect(styleWithImports.styleUrls).toEqual([
        'http://ng.io/print1.css', 'http://ng.io/print2.css'
      ]);
    });

    it('should leave absolute non-package @import urls intact', () => {
      const css = `@import url('http://server.com/some.css');`;
      const styleWithImports = extractStyleUrls(urlResolver, 'http://ng.io', css);
      expect(styleWithImports.style.trim()).toEqual(`@import url('http://server.com/some.css');`);
      expect(styleWithImports.styleUrls).toEqual([]);
    });

    it('should resolve package @import urls', () => {
      const css = `@import url('package:a/b/some.css');`;
      const styleWithImports = extractStyleUrls(new FakeUrlResolver(), 'http://ng.io', css);
      expect(styleWithImports.style.trim()).toEqual(``);
      expect(styleWithImports.styleUrls).toEqual(['fake_resolved_url']);
    });
  });

  describe('isStyleUrlResolvable', () => {
    it('should resolve relative urls', () => {
      expect(isStyleUrlResolvable('someUrl.css')).toBe(true);
    });

    it('should resolve package: urls', () => {
      expect(isStyleUrlResolvable('package:someUrl.css')).toBe(true);
    });

    it('should not resolve empty urls', () => {
      expect(isStyleUrlResolvable(null!)).toBe(false);
      expect(isStyleUrlResolvable('')).toBe(false);
    });

    it('should not resolve urls with other schema', () => {
      expect(isStyleUrlResolvable('http://otherurl')).toBe(false);
    });

    it('should not resolve urls with absolute paths', () => {
      expect(isStyleUrlResolvable('/otherurl')).toBe(false);
      expect(isStyleUrlResolvable('//otherurl')).toBe(false);
    });
  });
}

class FakeUrlResolver extends UrlResolver {
  constructor() {
    super();
  }

  resolve(baseUrl: string, url: string): string {
    return 'fake_resolved_url';
  }
}
