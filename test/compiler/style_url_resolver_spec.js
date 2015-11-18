var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var testing_internal_1 = require('angular2/testing_internal');
var style_url_resolver_1 = require('angular2/src/compiler/style_url_resolver');
var url_resolver_1 = require('angular2/src/compiler/url_resolver');
function main() {
    testing_internal_1.describe('extractStyleUrls', function () {
        var urlResolver;
        testing_internal_1.beforeEach(function () { urlResolver = new url_resolver_1.UrlResolver(); });
        testing_internal_1.it('should not resolve "url()" urls', function () {
            var css = "\n      .foo {\n        background-image: url(\"double.jpg\");\n        background-image: url('simple.jpg');\n        background-image: url(noquote.jpg);\n      }";
            var resolvedCss = style_url_resolver_1.extractStyleUrls(urlResolver, 'http://ng.io', css).style;
            testing_internal_1.expect(resolvedCss).toEqual(css);
        });
        testing_internal_1.it('should extract "@import" urls', function () {
            var css = "\n      @import '1.css';\n      @import \"2.css\";\n      ";
            var styleWithImports = style_url_resolver_1.extractStyleUrls(urlResolver, 'http://ng.io', css);
            testing_internal_1.expect(styleWithImports.style.trim()).toEqual('');
            testing_internal_1.expect(styleWithImports.styleUrls).toEqual(['http://ng.io/1.css', 'http://ng.io/2.css']);
        });
        testing_internal_1.it('should extract "@import url()" urls', function () {
            var css = "\n      @import url('3.css');\n      @import url(\"4.css\");\n      @import url(5.css);\n      ";
            var styleWithImports = style_url_resolver_1.extractStyleUrls(urlResolver, 'http://ng.io', css);
            testing_internal_1.expect(styleWithImports.style.trim()).toEqual('');
            testing_internal_1.expect(styleWithImports.styleUrls)
                .toEqual(['http://ng.io/3.css', 'http://ng.io/4.css', 'http://ng.io/5.css']);
        });
        testing_internal_1.it('should extract "@import urls and keep rules in the same line', function () {
            var css = "@import url('some.css');div {color: red};";
            var styleWithImports = style_url_resolver_1.extractStyleUrls(urlResolver, 'http://ng.io', css);
            testing_internal_1.expect(styleWithImports.style.trim()).toEqual('div {color: red};');
            testing_internal_1.expect(styleWithImports.styleUrls).toEqual(['http://ng.io/some.css']);
        });
        testing_internal_1.it('should extract media query in "@import"', function () {
            var css = "\n      @import 'print1.css' print;\n      @import url(print2.css) print;\n      ";
            var styleWithImports = style_url_resolver_1.extractStyleUrls(urlResolver, 'http://ng.io', css);
            testing_internal_1.expect(styleWithImports.style.trim()).toEqual('');
            testing_internal_1.expect(styleWithImports.styleUrls)
                .toEqual(['http://ng.io/print1.css', 'http://ng.io/print2.css']);
        });
        testing_internal_1.it('should leave absolute non-package @import urls intact', function () {
            var css = "@import url('http://server.com/some.css');";
            var styleWithImports = style_url_resolver_1.extractStyleUrls(urlResolver, 'http://ng.io', css);
            testing_internal_1.expect(styleWithImports.style.trim()).toEqual("@import url('http://server.com/some.css');");
            testing_internal_1.expect(styleWithImports.styleUrls).toEqual([]);
        });
        testing_internal_1.it('should resolve package @import urls', function () {
            var css = "@import url('package:a/b/some.css');";
            var styleWithImports = style_url_resolver_1.extractStyleUrls(new FakeUrlResolver(), 'http://ng.io', css);
            testing_internal_1.expect(styleWithImports.style.trim()).toEqual("");
            testing_internal_1.expect(styleWithImports.styleUrls).toEqual(['fake_resolved_url']);
        });
    });
    testing_internal_1.describe('isStyleUrlResolvable', function () {
        testing_internal_1.it('should resolve relative urls', function () { testing_internal_1.expect(style_url_resolver_1.isStyleUrlResolvable('someUrl.css')).toBe(true); });
        testing_internal_1.it('should resolve package: urls', function () { testing_internal_1.expect(style_url_resolver_1.isStyleUrlResolvable('package:someUrl.css')).toBe(true); });
        testing_internal_1.it('should resolve asset: urls', function () { testing_internal_1.expect(style_url_resolver_1.isStyleUrlResolvable('asset:someUrl.css')).toBe(true); });
        testing_internal_1.it('should not resolve empty urls', function () {
            testing_internal_1.expect(style_url_resolver_1.isStyleUrlResolvable(null)).toBe(false);
            testing_internal_1.expect(style_url_resolver_1.isStyleUrlResolvable('')).toBe(false);
        });
        testing_internal_1.it('should not resolve urls with other schema', function () { testing_internal_1.expect(style_url_resolver_1.isStyleUrlResolvable('http://otherurl')).toBe(false); });
        testing_internal_1.it('should not resolve urls with absolute paths', function () {
            testing_internal_1.expect(style_url_resolver_1.isStyleUrlResolvable('/otherurl')).toBe(false);
            testing_internal_1.expect(style_url_resolver_1.isStyleUrlResolvable('//otherurl')).toBe(false);
        });
    });
}
exports.main = main;
/// The real thing behaves differently between Dart and JS for package URIs.
var FakeUrlResolver = (function (_super) {
    __extends(FakeUrlResolver, _super);
    function FakeUrlResolver() {
        _super.call(this);
    }
    FakeUrlResolver.prototype.resolve = function (baseUrl, url) { return 'fake_resolved_url'; };
    return FakeUrlResolver;
})(url_resolver_1.UrlResolver);
//# sourceMappingURL=style_url_resolver_spec.js.map