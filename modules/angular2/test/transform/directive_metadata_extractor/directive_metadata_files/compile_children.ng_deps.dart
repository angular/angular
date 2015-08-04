library examples.hello_world.index_common_dart.ng_deps.dart;

import 'hello.dart';
import 'package:angular2/angular2.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(
        UnsetComp,
        new ReflectionInfo(
            const [const Directive()], const [const []], () => new UnsetComp()))
    ..registerType(
        FalseComp,
        new ReflectionInfo(const [const Directive(compileChildren: false)],
            const [const []], () => new FalseComp()))
    ..registerType(
        TrueComp,
        new ReflectionInfo(const [const Directive(compileChildren: true)],
            const [const []], () => new TrueComp()));
}
