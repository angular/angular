library foo.ng_deps.dart;

import 'foo.dart';
import 'package:angular2/src/core/annotations/annotations.dart';

export 'bar.dart';
import 'bar.ng_deps.dart' as i0;

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(FooComponent, {
      'factory': () => new FooComponent(),
      'parameters': const [],
      'annotations': const [const Component(selector: '[foo]')]
    });
  i0.initReflector(reflector);
}
