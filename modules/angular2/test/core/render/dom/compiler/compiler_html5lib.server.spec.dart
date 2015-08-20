library angular2.compiler.html5lib_dom_adapter.test;

import 'package:angular2/src/core/dom/html_adapter.dart';
import 'package:angular2/src/test_lib/test_lib.dart' show testSetup;
import 'compiler_common_tests.dart';

void main() {
  Html5LibDomAdapter.makeCurrent();
  testSetup();
  runCompilerCommonTests();
}
