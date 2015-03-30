library bar;

import 'bar.dart';
import 'package:angular2/src/core/annotations/annotations.dart';
import 'foo.dart' as prefix;

bool _visited = false;
void setupReflection(reflector) {
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
}
