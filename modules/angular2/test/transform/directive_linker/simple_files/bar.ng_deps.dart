library bar.ng_deps.dart;

import 'bar.dart';
import 'package:angular2/src/core/annotations/annotations.dart';
import 'foo.dart' as dep;

bool _visited = false;
void setupReflection(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(MyComponent, {
      'factory': () => new MyComponent(),
      'parameters': const [],
      'annotations': const [
        const Component(
            selector: '[soup]', services: const [dep.DependencyComponent])
      ]
    });
}
