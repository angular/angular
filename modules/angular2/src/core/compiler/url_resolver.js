import {isPresent, isBlank, RegExpWrapper, BaseException} from 'angular2/src/facade/lang';
import {DOM, AnchorElement} from 'angular2/src/facade/dom';

export class UrlResolver {
  static a: AnchorElement;

  constructor() {
    if (isBlank(UrlResolver.a)) {
      UrlResolver.a = DOM.createElement('a');
    }
  }

  resolve(baseUrl: string, url: string): string {
    if (isBlank(baseUrl)) {
      UrlResolver.a.href = url;
      return UrlResolver.a.href;
    }

    if (isBlank(url) || url == '') return baseUrl;

    if (url[0] == '/') {
      throw new BaseException(`Could not resolve the url ${url} from ${baseUrl}`);
    }

    var m = RegExpWrapper.firstMatch(_schemeRe, url);

    if (isPresent(m[1])) {
      return url;
    }

    UrlResolver.a.href = baseUrl + '/../' + url;
    return UrlResolver.a.href;
  }
}

var _schemeRe = RegExpWrapper.create('^([^:/?#]+:)?');
