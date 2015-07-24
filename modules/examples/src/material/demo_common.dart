library angular2_examples.material.demo_common;

import 'package:angular2/src/dom/browser_adapter.dart';
import 'package:angular2/src/services/url_resolver.dart';
import 'package:angular2/src/services/app_root_url.dart';

void commonDemoSetup() {
  BrowserDomAdapter.makeCurrent();
}

class DemoUrlResolver extends UrlResolver {
  DemoUrlResolver(AppRootUrl appRootUrl) : super(appRootUrl);
}
