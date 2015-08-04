library bar.ng_deps.dart;

import 'foo.dart';
import 'package:angular2/src/core/annotations/annotations.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(
        FooComponent,
        new ReflectionInfo(const [const Component(selector: '[fo' 'o]')],
            const [], () => new FooComponent()));
}
