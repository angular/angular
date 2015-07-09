library test.transform.directive_processor.invalid_url_files.hello.ng_deps.dart;

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
            template: r'''''',
            templateUrl: r'/bad/absolute/url.html',
            styles: const [r'''''', r'''''',])
      ]
    });
}
