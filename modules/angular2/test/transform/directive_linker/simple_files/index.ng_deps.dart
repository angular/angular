library web_foo.ng_deps.dart;

import 'package:angular2/src/core/application.dart';
import 'package:angular2/src/reflection/reflection_capabilities.dart';
import 'bar.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
}
