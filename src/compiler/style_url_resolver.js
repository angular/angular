'use strict';// Some of the code comes from WebComponents.JS
// https://github.com/webcomponents/webcomponentsjs/blob/master/src/HTMLImports/path.js
var lang_1 = require('angular2/src/facade/lang');
var StyleWithImports = (function () {
    function StyleWithImports(style, styleUrls) {
        this.style = style;
        this.styleUrls = styleUrls;
    }
    return StyleWithImports;
})();
exports.StyleWithImports = StyleWithImports;
function isStyleUrlResolvable(url) {
    if (lang_1.isBlank(url) || url.length === 0 || url[0] == '/')
        return false;
    var schemeMatch = lang_1.RegExpWrapper.firstMatch(_urlWithSchemaRe, url);
    return lang_1.isBlank(schemeMatch) || schemeMatch[1] == 'package' || schemeMatch[1] == 'asset';
}
exports.isStyleUrlResolvable = isStyleUrlResolvable;
/**
 * Rewrites stylesheets by resolving and removing the @import urls that
 * are either relative or don't have a `package:` scheme
 */
function extractStyleUrls(resolver, baseUrl, cssText) {
    var foundUrls = [];
    var modifiedCssText = lang_1.StringWrapper.replaceAllMapped(cssText, _cssImportRe, function (m) {
        var url = lang_1.isPresent(m[1]) ? m[1] : m[2];
        if (!isStyleUrlResolvable(url)) {
            // Do not attempt to resolve non-package absolute URLs with URI scheme
            return m[0];
        }
        foundUrls.push(resolver.resolve(baseUrl, url));
        return '';
    });
    return new StyleWithImports(modifiedCssText, foundUrls);
}
exports.extractStyleUrls = extractStyleUrls;
var _cssImportRe = /@import\s+(?:url\()?\s*(?:(?:['"]([^'"]*))|([^;\)\s]*))[^;]*;?/g;
// TODO: can't use /^[^:/?#.]+:/g due to clang-format bug:
//       https://github.com/angular/angular/issues/4596
var _urlWithSchemaRe = /^([a-zA-Z\-\+\.]+):/g;
//# sourceMappingURL=style_url_resolver.js.map