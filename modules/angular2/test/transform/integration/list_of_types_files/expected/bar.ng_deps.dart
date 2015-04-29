library bar.ng_deps.dart;

import 'bar.dart';
import 'package:angular2/src/core/annotations_impl/annotations.dart';
import 'package:angular2/src/core/annotations_impl/annotations.ng_deps.dart' as i0;
import 'foo.dart';
import 'foo.ng_deps.dart' as i1;

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(MyComponent, {
      'factory': (MyContext c) => new MyComponent(c),
      'parameters': const [const [MyContext]],
      'annotations':
          const [const Component(componentServices: const [MyContext])]
    });
  i0.initReflector(reflector);
  i1.initReflector(reflector);
}
