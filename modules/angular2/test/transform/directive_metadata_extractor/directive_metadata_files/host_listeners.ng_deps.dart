library examples.hello_world.index_common_dart.ng_deps.dart;

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
      'parameters': const [const []],
      'annotations': const [
        const Component(
            host: const {
          '(change)': 'onChange(\$event)',
          '[value]': 'value',
          '@actionName': 'actionValue',
          'attName': 'attValue'
        })
      ]
    });
}
