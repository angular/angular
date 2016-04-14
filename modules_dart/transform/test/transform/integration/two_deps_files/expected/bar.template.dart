library bar.template.dart;

import 'bar.dart';
import 'package:angular2/src/core/reflection/reflection.dart' as _ngRef;
import 'package:angular2/src/core/metadata.dart';
import 'foo.dart' as prefix;
import 'package:angular2/src/core/metadata.template.dart' as i0;
import 'foo.template.dart' as i1;
export 'bar.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(
        MyComponent,
        new _ngRef.ReflectionInfo(
            const [hostViewFactory_MyComponent],
            const [
              const [prefix.MyContext],
              const [prefix.MyDep]
            ],
            (prefix.MyContext c, prefix.MyDep inValue) =>
                new MyComponent(c, inValue)));
  i0.initReflector();
  i1.initReflector();
}
