library bar.ng_deps.dart;

import 'foo.dart';
import 'package:angular2/src/core/reflection/reflection.dart' as _ngRef;
import 'package:angular2/src/core/metadata.dart';
import 'package:angular2/src/core/metadata.ng_deps.dart' as i0;
import 'bar.dart';
import 'bar.ng_deps.dart' as i1;
import 'foo.template.dart' as _templates;
export 'foo.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(
        MyComponent,
        new _ngRef.ReflectionInfo(const [
          const Component(selector: '[soup]'),
          const View(directives: const [directiveAlias], template: ''),
          _templates.HostMyComponentTemplate
        ], const [], () => new MyComponent()));
  i0.initReflector();
  i1.initReflector();
}
