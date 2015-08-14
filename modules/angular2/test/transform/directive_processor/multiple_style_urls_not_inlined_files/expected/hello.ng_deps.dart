library examples.src.hello_world.multiple_style_urls_not_inlined_files.ng_deps.dart;

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
              templateUrl: 'package:a/template.html',
              styleUrls: const [
                'package:a/template.css',
                'package:a/template_other.css'
              ])
        ], const [], () => new HelloCmp()));
}
