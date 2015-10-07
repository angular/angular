// Some of the code comes from WebComponents.JS
// https://github.com/webcomponents/webcomponentsjs/blob/master/src/HTMLImports/path.js

import {RegExp, RegExpWrapper, StringWrapper, isPresent} from 'angular2/src/core/facade/lang';
import {UrlResolver} from 'angular2/src/core/compiler/url_resolver';

/**
 * Rewrites URLs by resolving '@import' and 'url()' URLs from the given base URL,
 * removes and returns the @import urls
 */
export function resolveStyleUrls(resolver: UrlResolver, baseUrl: string, cssText: string):
    StyleWithImports {
  var foundUrls = [];
  cssText = extractUrls(resolver, baseUrl, cssText, foundUrls);
  cssText = replaceUrls(resolver, baseUrl, cssText);
  return new StyleWithImports(cssText, foundUrls);
}

export class StyleWithImports {
  constructor(public style: string, public styleUrls: string[]) {}
}

function extractUrls(resolver: UrlResolver, baseUrl: string, cssText: string, foundUrls: string[]):
    string {
  return StringWrapper.replaceAllMapped(cssText, _cssImportRe, (m) => {
    var url = isPresent(m[1]) ? m[1] : m[2];
    var schemeMatch = RegExpWrapper.firstMatch(_urlWithSchemaRe, url);
    if (isPresent(schemeMatch) && schemeMatch[1] != 'package') {
      // Do not attempt to resolve non-package absolute URLs with URI scheme
      return m[0];
    }
    foundUrls.push(resolver.resolve(baseUrl, url));
    return '';
  });
}

function replaceUrls(resolver: UrlResolver, baseUrl: string, cssText: string): string {
  return StringWrapper.replaceAllMapped(cssText, _cssUrlRe, (m) => {
    var pre = m[1];
    var originalUrl = m[2];
    if (RegExpWrapper.test(_dataUrlRe, originalUrl)) {
      // Do not attempt to resolve data: URLs
      return m[0];
    }
    var url = StringWrapper.replaceAll(originalUrl, _quoteRe, '');
    var post = m[3];

    var resolvedUrl = resolver.resolve(baseUrl, url);

    return pre + "'" + resolvedUrl + "'" + post;
  });
}

var _cssUrlRe = /(url\()([^)]*)(\))/g;
var _cssImportRe = /@import\s+(?:url\()?\s*(?:(?:['"]([^'"]*))|([^;\)\s]*))[^;]*;?/g;
var _quoteRe = /['"]/g;
var _dataUrlRe = /^['"]?data:/g;
// TODO: can't use /^[^:/?#.]+:/g due to clang-format bug:
//       https://github.com/angular/angular/issues/4596
var _urlWithSchemaRe = /^['"]?([a-zA-Z\-\+\.]+):/g;
