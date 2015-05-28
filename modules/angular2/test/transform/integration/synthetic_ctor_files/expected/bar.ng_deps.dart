library bar.ng_deps.dart;

import 'bar.dart';
import 'package:angular2/src/core/annotations_impl/annotations.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(MyComponent, {
      'factory': () => new MyComponent(),
      'parameters': const [],
      'annotations': const [const Component(selector: '[soup]')]
    });
}
