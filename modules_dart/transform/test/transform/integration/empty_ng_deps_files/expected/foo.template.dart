library bar.template.dart;

import 'foo.dart';
import 'package:angular2/src/core/reflection/reflection.dart' as _ngRef;
import 'package:angular2/src/core/metadata.dart';
import 'bar.dart';
import 'package:angular2/src/core/metadata.template.dart' as i0;
import 'bar.template.dart' as i1;
export 'foo.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(
        MyComponent,
        new _ngRef.ReflectionInfo(const [hostViewFactory_MyComponent], const [],
            () => new MyComponent()));
  i0.initReflector();
  i1.initReflector();
}
