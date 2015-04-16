library bar.ng_deps.dart;

import 'bar.dart';
import 'package:angular2/src/core/annotations/annotations.dart';
import 'package:angular2/src/core/annotations/annotations.ng_deps.dart' as i0;
import 'foo.dart' as prefix;
import 'foo.ng_deps.dart' as i1;

bool _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(MyComponent, {
      'factory':
          (prefix.MyContext c, String inValue) => new MyComponent(c, inValue),
      'parameters': const [const [prefix.MyContext], const [String]],
      'annotations':
          const [const Component(selector: prefix.preDefinedSelector)]
    });
  i0.initReflector(reflector);
  i1.initReflector(reflector);
}
