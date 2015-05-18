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

  /**
   * Resolves the `url` given the `baseUrl`.
   *
   * ## When the `baseUrl` is null
   *
   * `url` is resolved in the context of the current document.
   * If the document location is 'http://www.foo.com/base' and the `url` is 'path/to/here', the
   * resolved url will be
   * 'http://www.foo.com/base/path/to/here'
   *
   * ## When the `baseUrl` is not null
   *
   * - when the `url` is null, the `baseUrl` is returned,
   * - due to a limitation in the process used to resolve urls (a HTMLLinkElement), `url` must not
   * start with a `/`,
   * - if `url` is relative ('path/to/here', './path/to/here'), the resolved url is a combination of
   * `baseUrl` and `url`,
   * - if `url` is absolute (it has a scheme: 'http://', 'https://'), the `url` is returned
   * (ignoring the `baseUrl`)
   *
   * @param {string} baseUrl
   * @param {string} url
   * @returns {string} the resolved URL
   */
  resolve(baseUrl: string, url: string): string {
    if (isBlank(baseUrl)) {
      DOM.resolveAndSetHref(UrlResolver.a, url, null);
      return DOM.getHref(UrlResolver.a);
    }

    if (isBlank(url) || url == '') return baseUrl;

    if (url[0] == '/') {
      // The `HTMLLinkElement` does not allow resolving this case (the `url` would be interpreted as
      // relative):
      // - `baseUrl` = 'http://www.foo.com/base'
      // - `url` = '/absolute/path/to/here'
      // - the result would be 'http://www.foo.com/base/absolute/path/to/here' while
      // 'http://www.foo.com/absolute/path/to/here'
      // is expected (without the 'base' segment).
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
