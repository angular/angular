library examples.src.hello_world.index_common_dart;

import 'hello.dart';
import 'package:angular2/angular2.dart'
    show bootstrap, Component, Decorator, View, NgElement;

bool _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(HelloCmp, {
      'factory': () => new HelloCmp(),
      'parameters': const [const []],
      'annotations': const [
        const Component(selector: 'hello-app'),
        const View(templateUrl: 'template.html')
      ]
    })
    ..registerMethods(
        {'action': (o, List args) => Function.apply(o.action, args)});
}
