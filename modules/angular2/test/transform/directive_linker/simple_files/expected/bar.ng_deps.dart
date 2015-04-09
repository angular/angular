library bar.ng_deps.dart;

import 'bar.dart';
import 'package:angular2/src/core/annotations/annotations.dart';
import 'foo.dart' as dep;
import 'foo.ng_deps.dart' as i0;

bool _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(MyComponent, {
      'factory': () => new MyComponent(),
      'parameters': const [],
      'annotations': const [
        const Component(
            selector: '[soup]', injectables: const [dep.DependencyComponent])
      ]
    });
  i0.initReflector(reflector);
}
