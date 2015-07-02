library bar.ng_deps.dart;

import 'bar.dart';
import 'package:angular2/src/core/annotations_impl/annotations.dart';
import 'foo.dart' as prefix;

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(MyComponent, {
      'factory':
          (prefix.MyContext c, String inValue) => new MyComponent(c, inValue),
      'parameters': const [const [prefix.MyContext], const [String]],
      'annotations': const [const Component(selector: 'soup')]
    });
}
