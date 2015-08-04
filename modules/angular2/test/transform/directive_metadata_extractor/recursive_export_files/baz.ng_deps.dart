library foo.ng_deps.dart;

import 'baz.dart';
import 'package:angular2/src/core/annotations/annotations.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(
        BazComponent,
        new ReflectionInfo(const [const Component(selector: '[baz]')], const [],
            () => new BazComponent()));
}
