library examples.src.hello_world.absolute_url_expression_files.ng_deps.dart;

import 'hello.dart';
import 'package:angular2/src/core/reflection/reflection.dart' as _ngRef;
import 'package:angular2/angular2.dart'
    show bootstrap, Component, Directive, View, NgElement;
import 'b.dart' as b;
export 'hello.dart';
export 'a.dart' show alias3;

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(
        HelloCmp,
        new _ngRef.ReflectionInfo(const [
          const Component(selector: 'hello-app'),
          const View(
              styles: const [r'''.greeting { .color: blue; }''',],
              template: r'''{{greeting}}''',
              templateUrl: 'template.html')
        ], const [], () => new HelloCmp()));
}
