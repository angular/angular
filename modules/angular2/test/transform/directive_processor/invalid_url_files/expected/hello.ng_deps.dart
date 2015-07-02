library test.transform.directive_processor.url_expression_files.hello.ng_deps.dart;

import 'hello.dart';
import 'package:angular2/angular2.dart'
    show bootstrap, Component, Directive, View, NgElement;

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(HelloCmp, {
      'factory': () => new HelloCmp(),
      'parameters': const [],
      'annotations': const [
        const Component(selector: 'hello-app'),
        const View(template: r'''''', styles: const [r'''''', r'''''',])
      ]
    });
}
