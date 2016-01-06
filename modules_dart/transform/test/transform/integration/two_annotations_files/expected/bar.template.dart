library bar.template.dart;

import 'bar.dart';
import 'package:angular2/src/core/reflection/reflection.dart' as _ngRef;
import 'package:angular2/core.dart';
import 'package:angular2/core.template.dart' as i0;
export 'bar.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(
        MyComponent,
        new _ngRef.ReflectionInfo(const [
          const Annotation1(prop1: 'value1'),
          const Annotation2(prop2: 'value2'),
          hostViewFactory_MyComponent
        ], const [], () => new MyComponent()));
  i0.initReflector();
}
