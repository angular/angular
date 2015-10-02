library angular2.transform.template_compiler.reflection.processor;

import 'package:angular2/src/core/compiler/directive_metadata.dart';

import 'model.dart';

class Processor implements CodegenModel {
  /// The names of all requested `getter`s.
  final Set<ReflectiveAccessor> getterNames = new Set<ReflectiveAccessor>();

  /// The names of all requested `setter`s.
  final Set<ReflectiveAccessor> setterNames = new Set<ReflectiveAccessor>();

  /// The names of all requested `method`s.
  final Set<ReflectiveAccessor> methodNames = new Set<ReflectiveAccessor>();

  void process(CompileDirectiveMetadata meta) {
    meta.outputs.keys.forEach((eventName) {
      getterNames.add(new ReflectiveAccessor(eventName));
    });
  }
}
