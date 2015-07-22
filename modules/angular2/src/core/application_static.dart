library angular2.application_static;

import 'dart:async';
import 'application_common.dart';

/// Starts an application from a root component.
///
/// See [commonBootstrap] for detailed documentation.
Future<ApplicationRef> bootstrapStatic(
    Type appComponentType,
    [List componentInjectableBindings,
    Function errorReporter]) {
  return commonBootstrap(appComponentType, componentInjectableBindings, errorReporter);
}
