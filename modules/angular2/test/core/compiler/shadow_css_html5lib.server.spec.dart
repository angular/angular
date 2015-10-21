library angular2.compiler.shadow_css_html5lib.test;

import 'package:angular2/src/core/dom/html_adapter.dart';
import 'package:angular2/src/testing/testing_internal.dart' show testSetup;
import 'shadow_css_spec.dart' as shadow_css_spec_test;

void main() {
  Html5LibDomAdapter.makeCurrent();
  testSetup();
  shadow_css_spec_test.main();
}
