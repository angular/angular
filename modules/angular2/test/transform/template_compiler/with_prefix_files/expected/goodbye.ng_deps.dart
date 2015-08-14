library examples.hello_world.index_common_dart.ng_deps.dart;

import 'goodbye.dart';
import 'package:angular2/angular2.dart'
    show Component, Directive, BaseView, NgElement;

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(
        GoodbyeCmp,
        new ReflectionInfo(const [
          const Component(selector: 'goodbye-app'),
          const BaseView(template: 'Goodbye {{name}}')
        ], const [
          const []
        ], () => new GoodbyeCmp()))
    ..registerGetters({'name': (o) => o.name})
    ..registerSetters({'name': (o, v) => o.name = v});
}
