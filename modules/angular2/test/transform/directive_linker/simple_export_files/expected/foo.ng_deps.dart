library foo.ng_deps.dart;

import 'foo.dart';
export 'foo.dart';
import 'package:angular2/src/reflection/reflection.dart' as _ngRef;
import 'package:angular2/src/core/annotations_impl/annotations.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(DependencyComponent, {
      'factory': () => new DependencyComponent(),
      'parameters': const [],
      'annotations': const [const Component(selector: '[salad]')]
    });
}
