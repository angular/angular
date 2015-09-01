library test.transform.directive_processor.invalid_url_files.hello.ng_deps.dart;

import 'hello.dart';
import 'package:angular2/src/core/reflection/reflection.dart' as _ngRef;
import 'package:angular2/angular2.dart'
    show Component, Directive, View, NgElement;
export 'hello.dart';

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(
        HelloCmp,
        new _ngRef.ReflectionInfo(const [
          const Component(selector: 'hello-app'),
          const View(
              styles: const [r'''''', r'''''',],
              template: r'''''',
              templateUrl: '/bad/absolute/url.html')
        ], const [], () => new HelloCmp()));
}
