library ng_material.test_url_resolver;

import 'package:angular2/src/platform/browser/browser_adapter.dart';
import 'package:angular2/src/compiler/url_resolver.dart';

void commonDemoSetup() {
  BrowserDomAdapter.makeCurrent();
}

class TestUrlResolver extends UrlResolver {
  @override
  String resolve(String baseUrl, String url) {
    const MATERIAL_PKG = 'package:angular2_material/';

    if (url.startsWith(MATERIAL_PKG)) {
      return '/packages/angular2_material/' +
          url.substring(MATERIAL_PKG.length);
    }
    return super.resolve(baseUrl, url);
  }
}
