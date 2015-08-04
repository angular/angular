library test.src.transform.template_compiler.ng_for_files.hello.ng_deps.dart;

import 'hello.dart';
import 'package:angular2/angular2.dart'
    show Component, Directive, View, NgElement;

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(
        HelloCmp,
        new ReflectionInfo(const [
          const Component(selector: 'hello-app'),
          const View(
              template: '<li *ng-for="#thing of things"><div>test</div></li>',
              directives: const [NgFor])
        ], const [
          const []
        ], () => new HelloCmp()));
}
