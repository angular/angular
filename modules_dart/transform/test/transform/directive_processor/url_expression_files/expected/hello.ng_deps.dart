library examples.src.hello_world.url_expression_files.ng_deps.dart;

import 'hello.dart';
import 'package:angular2/src/core/reflection/reflection.dart' as _ngRef;
import 'package:angular2/angular2.dart'
    show Component, Directive, View, NgElement;
export 'hello.dart';

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
              template: r'''{{greeting}}''', templateUrl: 'template.html')
        ], const [], () => new HelloCmp()));
}
