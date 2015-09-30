library angular2.transform.template_compiler.xhr_impl;

import 'package:angular2/src/core/services/url_resolver.dart';

class TransformerUrlResolver implements UrlResolver {
  const TransformerUrlResolver();

  @override
  String resolve(String baseUrl, String url) {
    Uri uri = Uri.parse(url);

    if (!uri.isAbsolute) {
      Uri baseUri = Uri.parse(baseUrl);
      uri = baseUri.resolveUri(uri);
    }

    var retVal;
    if (uri.scheme == 'package') {
      var package = uri.pathSegments.first;
      var pathInPackage = (['lib']..addAll(uri.pathSegments.skip(1))).join('/');
      retVal = 'asset:${package}/${pathInPackage}';
    } else if (uri.scheme == 'asset') {
      retVal = uri.toString();
    } else {
      throw new FormatException('Unsupported URI encountered: $uri', url);
    }

    return retVal;
  }
}
