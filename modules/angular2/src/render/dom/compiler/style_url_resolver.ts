// Some of the code comes from WebComponents.JS
// https://github.com/webcomponents/webcomponentsjs/blob/master/src/HTMLImports/path.js

import {Injectable} from 'angular2/di';
import {RegExp, RegExpWrapper, StringWrapper} from 'angular2/src/facade/lang';
import {UrlResolver} from 'angular2/src/services/url_resolver';

/**
 * Rewrites URLs by resolving '@import' and 'url()' URLs from the given base URL.
 */
@Injectable()
export class StyleUrlResolver {
  constructor(public _resolver: UrlResolver) {}

  resolveUrls(cssText: string, baseUrl: string) {
    cssText = this._replaceUrls(cssText, _cssUrlRe, baseUrl);
    cssText = this._replaceUrls(cssText, _cssImportRe, baseUrl);
    return cssText;
  }

  _replaceUrls(cssText: string, re: RegExp, baseUrl: string) {
    return StringWrapper.replaceAllMapped(cssText, re, (m) => {
      var pre = m[1];
      var url = StringWrapper.replaceAll(m[2], _quoteRe, '');
      var post = m[3];

      var resolvedUrl = this._resolver.resolve(baseUrl, url);

      return pre + "'" + resolvedUrl + "'" + post;
    });
  }
}

var _cssUrlRe = RegExpWrapper.create('(url\\()([^)]*)(\\))');
var _cssImportRe = RegExpWrapper.create('(@import[\\s]+(?!url\\())[\'"]([^\'"]*)[\'"](.*;)');
var _quoteRe = RegExpWrapper.create('[\'"]');
