library angular2.transform.template_compiler.xhr_impl;

import 'package:angular2/src/core/services/url_resolver.dart';

class TransformerUrlResolver implements UrlResolver {
  const TransformerUrlResolver();

  @override
  String resolve(String baseUrl, String url) {
    Uri uri = Uri.parse(url);

    if (!uri.isAbsolute) {
      uri = Uri.parse(baseUrl).resolveUri(uri);
    }

    return toAssetScheme(uri).toString();
  }

  /// Converts `absoluteUri` to use the 'asset' scheme used in the Angular 2
  /// template compiler.
  ///
  /// The `scheme` of `absoluteUri` is expected to be either 'package' or
  /// 'asset'.
  Uri toAssetScheme(Uri absoluteUri) {
    if (absoluteUri == null) return null;

    if (!absoluteUri.isAbsolute) {
      throw new ArgumentError.value(
          absoluteUri, 'absoluteUri', 'Value passed must be an absolute uri');
    }
    if (absoluteUri.scheme == 'asset') return absoluteUri;
    if (absoluteUri.scheme != 'package') {
      throw new ArgumentError.value(
          absoluteUri, 'absoluteUri', 'Unsupported URI scheme encountered');
    }

    var pathSegments = absoluteUri.pathSegments.toList()..insert(1, 'lib');
    return new Uri(scheme: 'asset', pathSegments: pathSegments);
  }
}
