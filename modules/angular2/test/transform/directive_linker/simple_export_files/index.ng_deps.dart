library web_foo.ng_deps.dart;

import 'dart:core' as boolScope show bool;
import 'package:angular2/src/core/application.dart';
import 'package:angular2/src/reflection/reflection_capabilities.dart';
import 'bar.dart';

boolScope.bool _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
}
