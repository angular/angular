library web_foo.ng_deps.dart;

import 'index.dart';
import 'package:angular2/src/core/application.dart';
import 'package:angular2/src/reflection/reflection.dart';
import 'package:angular2/src/reflection/reflection_capabilities.dart';
import 'bar.dart';
import 'bar.ng_deps.dart' as i0;
import 'package:angular2/src/core/application.ng_deps.dart' as i1;
import 'package:angular2/src/reflection/reflection_capabilities.ng_deps.dart'
    as i2;

bool _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  i0.initReflector(reflector);
  i1.initReflector(reflector);
  i2.initReflector(reflector);
}
