import {Injectable} from 'angular2/di';
import {isPresent, isBlank, RegExpWrapper, BaseException} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

@Injectable()
export class UrlResolver {
  static a;

  constructor() {
    if (isBlank(UrlResolver.a)) {
      UrlResolver.a = DOM.createElement('a');
    }
  }

  resolve(baseUrl: string, url: string): string {
    if (isBlank(baseUrl)) {
      DOM.resolveAndSetHref(UrlResolver.a, url, null);
      return DOM.getHref(UrlResolver.a);
    }

    if (isBlank(url) || url == '') return baseUrl;

    if (url[0] == '/') {
      throw new BaseException(`Could not resolve the url ${url} from ${baseUrl}`);
    }

    var m = RegExpWrapper.firstMatch(_schemeRe, url);

    if (isPresent(m[1])) {
      return url;
    }

    DOM.resolveAndSetHref(UrlResolver.a, baseUrl, url);
    return DOM.getHref(UrlResolver.a);
  }
}

var _schemeRe = RegExpWrapper.create('^([^:/?#]+:)?');
