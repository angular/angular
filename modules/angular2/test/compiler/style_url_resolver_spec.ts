import {describe, it, expect, beforeEach, ddescribe, iit, xit, el} from 'angular2/test_lib';
import {StyleUrlResolver} from 'angular2/src/compiler/style_url_resolver';

import {UrlResolver} from 'angular2/src/core/services/url_resolver';

export function main() {
  describe('StyleUrlResolver', () => {
    let styleUrlResolver: StyleUrlResolver;

    beforeEach(() => { styleUrlResolver = new StyleUrlResolver(new UrlResolver()); });

    describe('resolveUrls', () => {
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

        var resolvedCss = styleUrlResolver.resolveUrls(css, 'http://ng.io');
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

        var resolvedCss = styleUrlResolver.resolveUrls(css, 'http://ng.io');
        expect(resolvedCss).toEqual(expectedCss);
      });
    });

    describe('extractUrls', () => {
      it('should extract "@import" urls', () => {
        var css = `
        @import '1.css';
        @import "2.css";
        `;
        var styleWithImports = styleUrlResolver.extractImports(css);
        expect(styleWithImports.style.trim()).toEqual('');
        expect(styleWithImports.styleUrls).toEqual(['1.css', '2.css']);
      });

      it('should extract "@import url()" urls', () => {
        var css = `
        @import url('3.css');
        @import url("4.css");
        @import url(5.css);
        `;
        var styleWithImports = styleUrlResolver.extractImports(css);
        expect(styleWithImports.style.trim()).toEqual('');
        expect(styleWithImports.styleUrls).toEqual(['3.css', '4.css', '5.css']);
      });

      it('should extract media query in "@import"', () => {
        var css = `
        @import 'print.css' print;
        @import url(print2.css) print;
        `;
        var styleWithImports = styleUrlResolver.extractImports(css);
        expect(styleWithImports.style.trim()).toEqual('');
        expect(styleWithImports.styleUrls).toEqual(['print.css', 'print2.css']);
      });

    });

  });
}
