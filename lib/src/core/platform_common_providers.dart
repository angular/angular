library angular2.src.core.platform_common_providers;

import "package:angular2/src/facade/lang.dart"
    show Type, isBlank, isPresent, assertionsEnabled;
import "package:angular2/src/core/di.dart"
    show provide, Provider, Injector, OpaqueToken;
import "package:angular2/src/core/console.dart" show Console;
import "reflection/reflection.dart" show Reflector, reflector;
import "package:angular2/src/core/testability/testability.dart"
    show TestabilityRegistry;

Reflector _reflector() {
  return reflector;
}

/**
 * A default set of providers which should be included in any Angular platform.
 */
const List<
        dynamic /* Type | Provider | List < dynamic > */ > PLATFORM_COMMON_PROVIDERS =
    const [
  const Provider(Reflector, useFactory: _reflector, deps: const []),
  TestabilityRegistry,
  Console
];
