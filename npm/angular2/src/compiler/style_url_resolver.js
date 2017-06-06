'use strict';// Some of the code comes from WebComponents.JS
// https://github.com/webcomponents/webcomponentsjs/blob/master/src/HTMLImports/path.js
"use strict";
var lang_1 = require('angular2/src/facade/lang');
var StyleWithImports = (function () {
    function StyleWithImports(style, styleUrls) {
        this.style = style;
        this.styleUrls = styleUrls;
    }
    return StyleWithImports;
}());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVfdXJsX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3N0eWxlX3VybF9yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQ0FBK0M7QUFDL0MsdUZBQXVGOztBQUV2RixxQkFBdUUsMEJBQTBCLENBQUMsQ0FBQTtBQUdsRztJQUNFLDBCQUFtQixLQUFhLEVBQVMsU0FBbUI7UUFBekMsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUFTLGNBQVMsR0FBVCxTQUFTLENBQVU7SUFBRyxDQUFDO0lBQ2xFLHVCQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFGWSx3QkFBZ0IsbUJBRTVCLENBQUE7QUFFRCw4QkFBcUMsR0FBVztJQUM5QyxFQUFFLENBQUMsQ0FBQyxjQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztRQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDcEUsSUFBSSxXQUFXLEdBQUcsb0JBQWEsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbEUsTUFBTSxDQUFDLGNBQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUM7QUFDMUYsQ0FBQztBQUplLDRCQUFvQix1QkFJbkMsQ0FBQTtBQUVEOzs7R0FHRztBQUNILDBCQUFpQyxRQUFxQixFQUFFLE9BQWUsRUFDdEMsT0FBZTtJQUM5QyxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDbkIsSUFBSSxlQUFlLEdBQUcsb0JBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFVBQUMsQ0FBQztRQUM1RSxJQUFJLEdBQUcsR0FBRyxnQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0Isc0VBQXNFO1lBQ3RFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxDQUFDO1FBQ0QsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFDWixDQUFDLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxJQUFJLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUMxRCxDQUFDO0FBYmUsd0JBQWdCLG1CQWEvQixDQUFBO0FBRUQsSUFBSSxZQUFZLEdBQUcsaUVBQWlFLENBQUM7QUFDckYsMERBQTBEO0FBQzFELHVEQUF1RDtBQUN2RCxJQUFJLGdCQUFnQixHQUFHLHNCQUFzQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gU29tZSBvZiB0aGUgY29kZSBjb21lcyBmcm9tIFdlYkNvbXBvbmVudHMuSlNcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJjb21wb25lbnRzL3dlYmNvbXBvbmVudHNqcy9ibG9iL21hc3Rlci9zcmMvSFRNTEltcG9ydHMvcGF0aC5qc1xuXG5pbXBvcnQge1JlZ0V4cCwgUmVnRXhwV3JhcHBlciwgU3RyaW5nV3JhcHBlciwgaXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtVcmxSZXNvbHZlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3VybF9yZXNvbHZlcic7XG5cbmV4cG9ydCBjbGFzcyBTdHlsZVdpdGhJbXBvcnRzIHtcbiAgY29uc3RydWN0b3IocHVibGljIHN0eWxlOiBzdHJpbmcsIHB1YmxpYyBzdHlsZVVybHM6IHN0cmluZ1tdKSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTdHlsZVVybFJlc29sdmFibGUodXJsOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKGlzQmxhbmsodXJsKSB8fCB1cmwubGVuZ3RoID09PSAwIHx8IHVybFswXSA9PSAnLycpIHJldHVybiBmYWxzZTtcbiAgdmFyIHNjaGVtZU1hdGNoID0gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKF91cmxXaXRoU2NoZW1hUmUsIHVybCk7XG4gIHJldHVybiBpc0JsYW5rKHNjaGVtZU1hdGNoKSB8fCBzY2hlbWVNYXRjaFsxXSA9PSAncGFja2FnZScgfHwgc2NoZW1lTWF0Y2hbMV0gPT0gJ2Fzc2V0Jztcbn1cblxuLyoqXG4gKiBSZXdyaXRlcyBzdHlsZXNoZWV0cyBieSByZXNvbHZpbmcgYW5kIHJlbW92aW5nIHRoZSBAaW1wb3J0IHVybHMgdGhhdFxuICogYXJlIGVpdGhlciByZWxhdGl2ZSBvciBkb24ndCBoYXZlIGEgYHBhY2thZ2U6YCBzY2hlbWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RTdHlsZVVybHMocmVzb2x2ZXI6IFVybFJlc29sdmVyLCBiYXNlVXJsOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NUZXh0OiBzdHJpbmcpOiBTdHlsZVdpdGhJbXBvcnRzIHtcbiAgdmFyIGZvdW5kVXJscyA9IFtdO1xuICB2YXIgbW9kaWZpZWRDc3NUZXh0ID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsTWFwcGVkKGNzc1RleHQsIF9jc3NJbXBvcnRSZSwgKG0pID0+IHtcbiAgICB2YXIgdXJsID0gaXNQcmVzZW50KG1bMV0pID8gbVsxXSA6IG1bMl07XG4gICAgaWYgKCFpc1N0eWxlVXJsUmVzb2x2YWJsZSh1cmwpKSB7XG4gICAgICAvLyBEbyBub3QgYXR0ZW1wdCB0byByZXNvbHZlIG5vbi1wYWNrYWdlIGFic29sdXRlIFVSTHMgd2l0aCBVUkkgc2NoZW1lXG4gICAgICByZXR1cm4gbVswXTtcbiAgICB9XG4gICAgZm91bmRVcmxzLnB1c2gocmVzb2x2ZXIucmVzb2x2ZShiYXNlVXJsLCB1cmwpKTtcbiAgICByZXR1cm4gJyc7XG4gIH0pO1xuICByZXR1cm4gbmV3IFN0eWxlV2l0aEltcG9ydHMobW9kaWZpZWRDc3NUZXh0LCBmb3VuZFVybHMpO1xufVxuXG52YXIgX2Nzc0ltcG9ydFJlID0gL0BpbXBvcnRcXHMrKD86dXJsXFwoKT9cXHMqKD86KD86WydcIl0oW14nXCJdKikpfChbXjtcXClcXHNdKikpW147XSo7Py9nO1xuLy8gVE9ETzogY2FuJ3QgdXNlIC9eW146Lz8jLl0rOi9nIGR1ZSB0byBjbGFuZy1mb3JtYXQgYnVnOlxuLy8gICAgICAgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvNDU5NlxudmFyIF91cmxXaXRoU2NoZW1hUmUgPSAvXihbYS16QS1aXFwtXFwrXFwuXSspOi9nO1xuIl19