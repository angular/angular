library angular2.compiler.html5lib_dom_adapter.test;

import 'package:angular2/src/dom/html5lib_adapter.dart';
import 'compiler_common_tests.dart';

void main() {
  Html5LibDomAdapter.makeCurrent();
  runCompilerCommonTests();
}
