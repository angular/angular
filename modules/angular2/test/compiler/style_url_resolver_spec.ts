import {describe, it, expect, beforeEach, ddescribe, iit, xit, el} from 'angular2/test_lib';
import {resolveStyleUrls} from 'angular2/src/compiler/style_url_resolver';

import {UrlResolver} from 'angular2/src/core/services/url_resolver';

export function main() {
  describe('StyleUrlResolver', () => {
    var urlResolver;

    beforeEach(() => { urlResolver = new UrlResolver(); });

    it('should resolve "url()" urls', () => {
      var css = `
      .foo {
        background-image: url("double.jpg");
        background-image: url('simple.jpg');
        background-image: url(noquote.jpg);
      }`;
      var expectedCss = `
      .foo {
        background-image: url('http://ng.io/double.jpg');
        background-image: url('http://ng.io/simple.jpg');
        background-image: url('http://ng.io/noquote.jpg');
      }`;

      var resolvedCss = resolveStyleUrls(urlResolver, 'http://ng.io', css).style;
      expect(resolvedCss).toEqual(expectedCss);
    });

    it('should not strip quotes from inlined SVG styles', () => {
      var css = `
      .selector {
        background:rgb(55,71,79) url('data:image/svg+xml;utf8,<?xml version="1.0"?>');
        background:rgb(55,71,79) url("data:image/svg+xml;utf8,<?xml version='1.0'?>");
        background:rgb(55,71,79) url("/some/data:image");
      }
      `;

      var expectedCss = `
      .selector {
        background:rgb(55,71,79) url('data:image/svg+xml;utf8,<?xml version="1.0"?>');
        background:rgb(55,71,79) url("data:image/svg+xml;utf8,<?xml version='1.0'?>");
        background:rgb(55,71,79) url('http://ng.io/some/data:image');
      }
      `;

      var resolvedCss = resolveStyleUrls(urlResolver, 'http://ng.io', css).style;
      expect(resolvedCss).toEqual(expectedCss);
    });

    it('should extract "@import" urls', () => {
      var css = `
      @import '1.css';
      @import "2.css";
      `;
      var styleWithImports = resolveStyleUrls(urlResolver, 'http://ng.io', css);
      expect(styleWithImports.style.trim()).toEqual('');
      expect(styleWithImports.styleUrls).toEqual(['http://ng.io/1.css', 'http://ng.io/2.css']);
    });

    it('should extract "@import url()" urls', () => {
      var css = `
      @import url('3.css');
      @import url("4.css");
      @import url(5.css);
      `;
      var styleWithImports = resolveStyleUrls(urlResolver, 'http://ng.io', css);
      expect(styleWithImports.style.trim()).toEqual('');
      expect(styleWithImports.styleUrls)
          .toEqual(['http://ng.io/3.css', 'http://ng.io/4.css', 'http://ng.io/5.css']);
    });

    it('should extract "@import urls and keep rules in the same line', () => {
      var css = `@import url('some.css');div {color: red};`;
      var styleWithImports = resolveStyleUrls(urlResolver, 'http://ng.io', css);
      expect(styleWithImports.style.trim()).toEqual('div {color: red};');
      expect(styleWithImports.styleUrls).toEqual(['http://ng.io/some.css']);
    });

    it('should extract media query in "@import"', () => {
      var css = `
      @import 'print1.css' print;
      @import url(print2.css) print;
      `;
      var styleWithImports = resolveStyleUrls(urlResolver, 'http://ng.io', css);
      expect(styleWithImports.style.trim()).toEqual('');
      expect(styleWithImports.styleUrls)
          .toEqual(['http://ng.io/print1.css', 'http://ng.io/print2.css']);
    });

  });
}
