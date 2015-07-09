library examples.src.hello_world.absolute_url_expression_files.ng_deps.dart;

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
        const View(
            template: r'''{{greeting}}''',
            templateUrl: r'package:other_package/template.html',
            styles: const [r'''.greeting { .color: blue; }''',])
      ]
    });
}
