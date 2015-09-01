library angular2.src.core.compiler.directive_lifecycle_reflector;

import 'package:angular2/src/core/reflection/reflection.dart';

bool hasLifecycleHook(/*LifecycleHook*/ interface, type) {
  if (type is! Type) return false;

  return reflector.interfaces(type).contains(interface);
}
