library bar.ng_deps.dart;

import 'bar.template.dart' as _templates;

import 'bar.dart';
import 'package:angular2/src/core/reflection/reflection.dart' as _ngRef;
import 'package:angular2/src/core/metadata.dart';
import 'foo.dart' as prefix;
export 'bar.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(
        MyComponent,
        new _ngRef.ReflectionInfo(
            const [
          const Component(selector: 'soup'),
          const View(template: 'foo', directives: const [prefix.Foo]),
          _templates.HostMyComponentTemplate
        ], const [], () => new MyComponent()));
}
