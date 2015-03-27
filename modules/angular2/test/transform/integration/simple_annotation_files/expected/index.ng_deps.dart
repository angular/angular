library web_foo;

import 'index.dart';
import 'package:angular2/src/core/application.dart';
import 'package:angular2/src/reflection/reflection.dart';
import 'package:angular2/src/reflection/reflection_capabilities.dart';
import 'bar.dart';
import 'bar.ng_deps.dart' as i0;

bool _visited = false;
void setupReflection(reflector) {
  if (_visited) return;
  _visited = true;
  i0.setupReflection(reflector);
}
