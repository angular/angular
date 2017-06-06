// Some of the code comes from WebComponents.JS
// https://github.com/webcomponents/webcomponentsjs/blob/master/src/HTMLImports/path.js

import {Injectable} from 'angular2/di';
import {RegExp, RegExpWrapper, StringWrapper} from 'angular2/src/core/facade/lang';
import {UrlResolver} from 'angular2/src/core/services/url_resolver';

/**
 * Rewrites URLs by resolving '@import' and 'url()' URLs from the given base URL,
 * removes and returns the @import urls
 */
@Injectable()
export class StyleUrlResolver {
  constructor(public _resolver: UrlResolver) {}

  resolveUrls(cssText: string, baseUrl: string): string {
    cssText = this._replaceUrls(cssText, _cssUrlRe, baseUrl);
    return cssText;
  }

  extractImports(cssText: string): StyleWithImports {
    var foundUrls = [];
    cssText = this._extractUrls(cssText, _cssImportRe, foundUrls);
    return new StyleWithImports(cssText, foundUrls);
  }

  _replaceUrls(cssText: string, re: RegExp, baseUrl: string) {
    return StringWrapper.replaceAllMapped(cssText, re, (m) => {
      var pre = m[1];
      var originalUrl = m[2];
      if (RegExpWrapper.test(_dataUrlRe, originalUrl)) {
        // Do not attempt to resolve data: URLs
        return m[0];
      }
      var url = StringWrapper.replaceAll(originalUrl, _quoteRe, '');
      var post = m[3];

      var resolvedUrl = this._resolver.resolve(baseUrl, url);

      return pre + "'" + resolvedUrl + "'" + post;
    });
  }

  _extractUrls(cssText: string, re: RegExp, foundUrls: string[]) {
    return StringWrapper.replaceAllMapped(cssText, re, (m) => {
      var originalUrl = m[2];
      if (RegExpWrapper.test(_dataUrlRe, originalUrl)) {
        // Do not attempt to resolve data: URLs
        return m[0];
      }
      var url = StringWrapper.replaceAll(originalUrl, _quoteRe, '');
      foundUrls.push(url);
      return '';
    });
  }
}

export class StyleWithImports {
  constructor(public style: string, public styleUrls: string[]) {}
}

var _cssUrlRe = /(url\()([^)]*)(\))/g;
var _cssImportRe = /(@import[\s]+(?:url\()?)['"]?([^'"\)]*)['"]?(.*;)/g;
var _quoteRe = /['"]/g;
var _dataUrlRe = /^['"]?data:/g;
