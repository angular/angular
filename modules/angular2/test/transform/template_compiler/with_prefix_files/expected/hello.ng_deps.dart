library examples.hello_world.index_common_dart.ng_deps.dart;

import 'hello.dart';
import 'goodbye.dart' as prefix;
import 'goodbye.ng_deps.dart' as i0;
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
          const BaseView(
              template: 'goodbye-app', directives: const [prefix.GoodbyeCmp])
        ], const [
          const []
        ], () => new HelloCmp()));
  i0.initReflector(reflector);
}
