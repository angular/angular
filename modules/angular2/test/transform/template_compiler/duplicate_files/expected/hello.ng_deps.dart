library examples.hello_world.index_common_dart.ng_deps.dart;

import 'hello.dart';
import 'package:angular2/angular2.dart'
    show Component, Directive, BaseView, NgElement;

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(
        HelloCmp,
        new ReflectionInfo(const [
          const Component(selector: 'hello-app'),
          const BaseView(template: '{{greeting}}, {{greeting}}')
        ], const [
          const []
        ], () => new HelloCmp()))
    ..registerGetters({'greeting': (o) => o.greeting})
    ..registerSetters({'greeting': (o, v) => o.greeting = v});
}
