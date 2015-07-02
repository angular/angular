library examples.hello_world.index_common_dart.ng_deps.dart;

import 'hello.dart';
import 'package:angular2/angular2.dart';

var _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(UnsetComp, {
      'factory': () => new UnsetComp(),
      'parameters': const [const []],
      'annotations': const [const Directive()]
    })
    ..registerType(FalseComp, {
      'factory': () => new FalseComp(),
      'parameters': const [const []],
      'annotations': const [const Directive(compileChildren: false)]
    })
    ..registerType(TrueComp, {
      'factory': () => new TrueComp(),
      'parameters': const [const []],
      'annotations': const [const Directive(compileChildren: true)]
    });
}
