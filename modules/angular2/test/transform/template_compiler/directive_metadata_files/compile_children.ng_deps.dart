library examples.hello_world.index_common_dart.ng_deps.dart;

import 'dart:core' as boolScope show bool;
import 'hello.dart';
import 'package:angular2/angular2.dart';

boolScope.bool _visited = false;
void initReflector(reflector) {
  if (_visited) return;
  _visited = true;
  reflector
    ..registerType(HelloCmp, {
      'factory': () => new HelloCmp(),
      'parameters': const [const []],
      'annotations': const [const Decorator(compileChildren: true)]
    });
}
