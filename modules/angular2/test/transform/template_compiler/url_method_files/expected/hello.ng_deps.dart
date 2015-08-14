library examples.src.hello_world.index_common_dart;

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
          const BaseView(templateUrl: 'template.html')
        ], const [
          const []
        ], () => new HelloCmp()))
    ..registerMethods(
        {'action': (o, List args) => Function.apply(o.action, args)});
}
