library angular2.src.services.url_resolver;

import 'package:angular2/di.dart' show Injectable;
import 'package:angular2/src/services/app_root_url.dart' show AppRootUrl;

@Injectable()
class UrlResolver {

  final AppRootUrl _appRootUrl;

  UrlResolver(this._appRootUrl);

  /**
   * Resolves the `url` given the `baseUrl`:
   * - when the `url` is null, the `baseUrl` is returned,
   * - if `url` is relative ('path/to/here', './path/to/here'), the resolved url is a combination of
   * `baseUrl` and `url`,
   * - if `url` is absolute (it has a scheme: 'http://', 'https://' or start with '/'), the `url` is
   * returned as is (ignoring the `baseUrl`)
   *
   * @param {string} baseUrl
   * @param {string} url
   * @returns {string} the resolved URL
   */
  String resolve(String baseUrl, String url) {
    Uri uri = Uri.parse(url);

    if (uri.scheme == 'package') {
      var maybeSlash = _appRootUrl.value.endsWith('/') ? '' : '/';
      return '${_appRootUrl.value}${maybeSlash}packages/${uri.path}';
    }

    if (uri.isAbsolute) return uri.toString();

    Uri baseUri = Uri.parse(baseUrl);
    return baseUri.resolveUri(uri).toString();
  }
}
