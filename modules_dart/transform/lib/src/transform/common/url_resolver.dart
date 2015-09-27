library angular2.transform.template_compiler.xhr_impl;

import 'package:angular2/src/core/services/url_resolver.dart';

class TransformerUrlResolver implements UrlResolver {
  @override
  String resolve(String baseUrl, String url) {
    final uri = Uri.parse(url);

    String package;
    String pathInPackage;
    if (uri.scheme == 'package') {
      package = uri.pathSegments.first;
      pathInPackage = (['lib']..addAll(uri.pathSegments.skip(1))).join('/');
    } else {
      Uri baseUri = Uri.parse(baseUrl);
      Uri resolvedUri = baseUri.resolveUri(uri);
      package = resolvedUri.pathSegments.first;
      pathInPackage = resolvedUri.pathSegments.skip(1).join('/');
    }

    return '${package}|${pathInPackage}';
  }
}
