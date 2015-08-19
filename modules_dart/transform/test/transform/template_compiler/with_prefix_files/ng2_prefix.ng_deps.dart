library angular2.test.transform.template_compiler.with_prefix_files.ng2_prefix.ng_deps.dart;

import 'ng2_prefix.dart';
import 'package:angular2/angular2.dart' as ng2
    show Component, Directive, View, NgElement;

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(
        MyApp,
        new ReflectionInfo(const [
          const ng2.Component(selector: 'my-app'),
          const ng2.View(template: 'MyApp {{name}}')
        ], const [
          const []
        ], () => new MyApp()));
}
