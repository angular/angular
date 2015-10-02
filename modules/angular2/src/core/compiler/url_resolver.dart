library angular2.src.services.url_resolver;

import 'package:angular2/src/core/di.dart' show Injectable;

@Injectable()
class UrlResolver {
  /// This will be the location where 'package:' Urls will resolve. Default is
  /// '/packages'
  final String _packagePrefix;

  const UrlResolver() : _packagePrefix = '/packages';

  /// Creates a UrlResolver that will resolve 'package:' Urls to a different
  /// prefixed location.
  const UrlResolver.withUrlPrefix(this._packagePrefix);

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
      return '$_packagePrefix/${uri.path}';
    }

    if (uri.isAbsolute) return uri.toString();

    Uri baseUri = Uri.parse(baseUrl);
    return baseUri.resolveUri(uri).toString();
  }
}
