library foo;

import 'foo.dart';
import 'package:angular2/src/core/annotations/annotations.dart';

bool _visited = false;
void setupReflection(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(DependencyComponent, {
      "factory": () => new DependencyComponent(),
      "parameters": const [],
      "annotations": const [const Component(selector: '[salad]')]
    });
}
