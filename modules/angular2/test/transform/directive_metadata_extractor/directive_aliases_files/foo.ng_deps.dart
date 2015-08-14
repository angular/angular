library foo.ng_deps.dart;

import 'foo.dart';
import 'package:angular2/src/core/metadata.dart';

export 'bar.dart';
import 'bar.ng_deps.dart' as i0;

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(
        FooComponent,
        new ReflectionInfo(const [const Component(selector: '[foo]')], const [],
            () => new FooComponent()));
  i0.initReflector(reflector);
}
