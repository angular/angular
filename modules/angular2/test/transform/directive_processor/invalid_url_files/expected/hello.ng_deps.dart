library test.transform.directive_processor.invalid_url_files.hello.ng_deps.dart;

import 'hello.dart';
export 'hello.dart';
import 'package:angular2/src/reflection/reflection.dart' as _ngRef;
import 'package:angular2/angular2.dart'
    show Component, Directive, BaseView, NgElement;

var _visited = false;
void initReflector() {
  if (_visited) return;
  _visited = true;
  _ngRef.reflector
    ..registerType(
        HelloCmp,
        new _ngRef.ReflectionInfo(const [
          const Component(selector: 'hello-app'),
          const BaseView(
              template: r'''''',
              templateUrl: r'/bad/absolute/url.html',
              styles: const [r'''''', r'''''',])
        ], const [], () => new HelloCmp()));
}
