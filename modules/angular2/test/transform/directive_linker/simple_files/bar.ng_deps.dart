library bar.ng_deps.dart;

import 'bar.dart';
export 'bar.dart';
import 'package:angular2/src/reflection/reflection.dart' as _ngRef;
import 'package:angular2/src/core/annotations_impl/annotations.dart';
import 'foo.dart' as dep;

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(MyComponent, new ReflectionInfo(const [
      const Component(
          selector: '[soup]', viewBindings: const [dep.DependencyComponent])
    ], const [], () => new MyComponent()));
}
