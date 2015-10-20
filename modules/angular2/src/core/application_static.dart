library angular2.src.core.application_static;

import 'dart:async';
import 'application_common.dart';
import 'package:angular2/src/core/linker/dynamic_component_loader.dart'
    show ComponentRef;

/// Starts an application from a root component.
///
/// See [commonBootstrap] for detailed documentation.
Future<ComponentRef> bootstrapStatic(Type appComponentType,
    [List componentInjectableBindings, void initReflector()]) {
  if (initReflector != null) {
    initReflector();
  }
  return commonBootstrap(appComponentType, componentInjectableBindings);
}
