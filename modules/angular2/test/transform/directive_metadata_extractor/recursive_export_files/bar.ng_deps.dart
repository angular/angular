library foo.ng_deps.dart;

import 'bar.dart';
import 'package:angular2/src/core/annotations/annotations.dart';

export 'baz.dart';
import 'baz.ng_deps.dart' as i0;

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(
        BarComponent,
        new ReflectionInfo(const [const Component(selector: '[bar]')], const [],
            () => new BarComponent()));
  i0.initReflector(reflector);
}
