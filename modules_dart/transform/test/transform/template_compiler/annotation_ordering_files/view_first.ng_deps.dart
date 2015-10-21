library test.src.transform.template_compiler.annotation_ordering_files.view_first.ng_deps.dart;

import 'view_first.dart';
import 'package:angular2/angular2.dart'
    show Component, Directive, View, NgElement;
import 'package:angular2/src/directives/ng_for.dart';
export 'view_first.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(
        ViewFirst,
        new ReflectionInfo(const [
          const View(
              template: '<li *ng-for="#thing of things"><div>test</div></li>',
              directives: const [NgFor]),
          const Component(selector: 'hello-app')
        ], const [
          const []
        ], () => new ViewFirst()));
}
