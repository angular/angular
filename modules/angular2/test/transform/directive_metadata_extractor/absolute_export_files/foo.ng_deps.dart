library foo.ng_deps.dart;

import 'foo.dart';
import 'package:angular2/src/core/metadata.dart';

export 'package:bar/bar.dart';
import 'package:bar/bar.ng_deps.dart' as i0;

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
