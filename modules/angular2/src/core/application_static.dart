library angular2.application_static;

import 'dart:async';
import 'application_common.dart';
import 'application_ref.dart';

/// Starts an application from a root component.
///
/// See [commonBootstrap] for detailed documentation.
Future<ApplicationRef> bootstrapStatic(Type appComponentType,
    [List componentInjectableBindings, void initReflector()]) {
  if (initReflector != null) {
    initReflector();
  }
  return commonBootstrap(appComponentType, componentInjectableBindings);
}
