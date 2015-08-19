library web_foo.ng_deps.dart;

import 'package:angular2/src/reflection/reflection.dart' as _ngRef;
import 'package:angular2/bootstrap_static.dart';
import 'package:angular2/src/reflection/reflection_capabilities.dart';
import 'bar.dart';
import 'bar.ng_deps.dart' as i0;

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  i0.initReflector();
}
